import pg from "pg";
import {
  parseCSV,
  normalizeCSV,
  checksum,
  exportCSV,
  exportGeoJSON,
  MAX_BYTES,
} from "../../src/data/core.js";
import { parseFilters, UUID } from "../../src/data/filters.js";
import * as repository from "./repository.js";
const encoder = new TextEncoder();
function fail(message, status = 400) {
  throw Object.assign(new Error(message), { status });
}
export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
async function sameSecret(a, b) {
  if (!a || !b) return false;
  const [x, y] = await Promise.all([
    checksum(encoder.encode(a)),
    checksum(encoder.encode(b)),
  ]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}
async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return [
    ...new Uint8Array(
      await crypto.subtle.sign("HMAC", key, encoder.encode(value)),
    ),
  ]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export async function makeTicket(payload, secret) {
  const data = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  return data + "." + (await sign(data, secret));
}
export async function readTicket(ticket, secret) {
  const [data, sig, ...extra] = String(ticket).split(".");
  if (
    extra.length ||
    !data ||
    !(await sameSecret(sig, await sign(data, secret)))
  )
    fail("Preview confirmation is invalid.");
  let payload;
  try {
    payload = JSON.parse(decodeURIComponent(escape(atob(data))));
  } catch {
    fail("Invalid confirmation.");
  }
  if (payload.expires < Date.now())
    fail("Preview expired; validate the file again.");
  return payload;
}
async function limitedBody(request) {
  const length = Number(request.headers.get("content-length"));
  if (length > MAX_BYTES + 65536)
    fail("Upload exceeds the V1 size limit.", 413);
  if (!request.body) fail("Missing upload.");
  const reader = request.body.getReader(),
    chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_BYTES + 65536) {
      await reader.cancel();
      fail("Upload exceeds the V1 size limit.", 413);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.length;
  }
  return new Response(bytes, {
    headers: { "Content-Type": request.headers.get("content-type") || "" },
  }).formData();
}
async function upload(request, env, db, path) {
  if (!env.ORIGINALS || !env.IMPORT_SIGNING_SECRET)
    fail("Upload storage and signing secret are not configured.", 503);
  const form = await limitedBody(request),
    file = form.get("file");
  if (
    !file ||
    typeof file === "string" ||
    !file.name.toLowerCase().endsWith(".csv") ||
    file.name.length > 255 ||
    file.size === 0 ||
    file.size > MAX_BYTES
  )
    fail(
      "Select a nonempty CSV up to 2 MiB with a filename up to 255 characters.",
    );
  const bytes = await file.arrayBuffer(),
    sha = await checksum(bytes);
  let meta;
  try {
    meta = JSON.parse(form.get("metadata"));
  } catch {
    fail("Invalid import metadata.");
  }
  if (
    !meta ||
    !UUID.test(meta.mission_id) ||
    !UUID.test(meta.sensor_configuration_id) ||
    !meta.mapping ||
    !meta.units
  )
    fail("Mission, sensor configuration, mapping and units are required.");
  const context = await repository.resolveContext(db, meta);
  let normalized;
  try {
    normalized = normalizeCSV(
      parseCSV(new TextDecoder("utf-8", { fatal: true }).decode(bytes)),
      meta.mapping,
      meta.units,
      context,
    );
  } catch (e) {
    fail(e.message);
  }
  if (path.endsWith("/preview")) {
    const ticket = await makeTicket(
      {
        sha,
        filename: file.name,
        meta,
        parserVersion: normalized.parserVersion,
        expires: Date.now() + 15 * 60 * 1000,
      },
      env.IMPORT_SIGNING_SECRET,
    );
    return json({
      summary: normalized.summary,
      preview: normalized.rows.slice(0, 100).map(({ raw, ...r }) => r),
      previewLimit: 100,
      sha256: sha,
      parserVersion: normalized.parserVersion,
      ticket,
    });
  }
  const payload = await readTicket(
    form.get("ticket"),
    env.IMPORT_SIGNING_SECRET,
  );
  if (
    payload.parserVersion !== normalized.parserVersion ||
    payload.sha !== sha ||
    payload.filename !== file.name ||
    JSON.stringify(payload.meta) !== JSON.stringify(meta)
  )
    fail("File or mapping changed since preview; validate again.");
  if (
    form.get("confirmed") !== "true" ||
    (normalized.summary.flaggedRows && form.get("acknowledgeQC") !== "true")
  )
    fail("Confirm the import and acknowledge QC warnings.");
  const saved = await repository.saveImport(
    db,
    env,
    file,
    bytes,
    sha,
    meta,
    context,
    normalized,
  );
  return json(
    {
      ...saved,
      summary: normalized.summary,
      message:
        "Archived and imported. Publication is controlled separately by mission approval.",
    },
    saved.duplicate ? 200 : 201,
  );
}
export async function handle(
  request,
  env,
  connect = async () => {
    const db = new pg.Client({
      connectionString: env.HYPERDRIVE.connectionString,
      connectionTimeoutMillis: 10000,
      query_timeout: 15000,
    });
    await db.connect();
    return db;
  },
) {
  const url = new URL(request.url),
    path = url.pathname.replace(/\/$/, ""),
    origin = request.headers.get("origin");
  const allowed = env.ALLOWED_ORIGIN;
  let response;
  try {
    if (origin && origin !== allowed && origin !== url.origin)
      fail("Origin is not allowed.", 403);
    if (request.method === "OPTIONS")
      return decorate(new Response(null, { status: 204 }), origin, allowed);
    const admin = path.startsWith("/api/admin/");
    if (admin) {
      if (!env.ADMIN_TOKEN)
        fail("Administrator uploads are not configured.", 503);
      if (
        !(await sameSecret(
          request.headers.get("authorization"),
          `Bearer ${env.ADMIN_TOKEN}`,
        ))
      )
        fail("Administrator authorization required.", 401);
    }
    if (path === "/api/health" && request.method === "GET")
      return decorate(
        json({
          configured: !!env.HYPERDRIVE,
          uploadsConfigured: !!(
            env.HYPERDRIVE &&
            env.ORIGINALS &&
            env.ADMIN_TOKEN &&
            env.IMPORT_SIGNING_SECRET
          ),
        }),
        origin,
        allowed,
      );
    const isUpload = [
      "/api/admin/imports/preview",
      "/api/admin/imports/confirm",
    ].includes(path);
    if (
      (isUpload && request.method !== "POST") ||
      (!isUpload && request.method !== "GET")
    )
      fail("Method not allowed.", 405);
    if (!env.HYPERDRIVE) fail("Scientific database is not configured.", 503);
    const db = await connect();
    try {
      await db.query("SET statement_timeout = '12s'");
      if (isUpload) response = await upload(request, env, db, path);
      else if (path === "/api/admin/missions")
        response = json({
          data: await repository.importContexts(db),
          limit: 1000,
        });
      else if (
        [
          "/api/parameters",
          "/api/platforms",
          "/api/teams",
          "/api/sites",
        ].includes(path)
      ) {
        const rows = await repository.catalog(db, path.split("/").at(-1));
        // Explicit bound; clients must never mistake a truncated directory for a full catalog.
        response = json({
          data: rows.slice(0, 1000),
          truncated: rows.length > 1000,
          limit: 1000,
        });
      } else {
        let f;
        const query = new URLSearchParams(url.search);
        const missionRoute = path.match(
          /^\/api\/missions\/([0-9a-f-]+)(\/observations)?$/i,
        );
        if (missionRoute) {
          if (!UUID.test(missionRoute[1])) fail("Invalid mission ID.");
          query.set("mission", missionRoute[1]);
        }
        let missionCursor = null;
        if (path === "/api/missions" && query.has("cursor")) {
          missionCursor = query.get("cursor");
          if (!UUID.test(missionCursor)) fail("Invalid mission cursor.");
          query.delete("cursor");
        }
        try {
          f = parseFilters(query);
        } catch (e) {
          fail(e.message);
        }
        if (path === "/api/missions" || (missionRoute && !missionRoute[2]))
          response = json(
            await repository.missions(db, {
              ...f,
              ...(missionCursor ? { cursor: missionCursor } : {}),
            }),
          );
        else if (path === "/api/observations" || missionRoute?.[2]) {
          const result = await repository.observations(db, f),
            metadata = {
              filters: Object.fromEntries(query),
              nextCursor: result.nextCursor,
              count: result.data.length,
              altitudeReference: "MSL and AGL are separate fields",
              generatedAt: new Date().toISOString(),
            };
          const format = query.get("format");
          if (format === "csv" || format === "geojson") {
            const body =
              format === "csv"
                ? exportCSV(result.data)
                : JSON.stringify(exportGeoJSON(result.data, metadata));
            response = new Response(body, {
              headers: {
                "Content-Type":
                  format === "csv"
                    ? "text/csv; charset=utf-8"
                    : "application/geo+json",
                "Content-Disposition": `attachment; filename="ascend-observations.${format === "csv" ? "csv" : "geojson"}"`,
                "X-Next-Cursor": result.nextCursor || "",
                "X-Result-Count": String(result.data.length),
              },
            });
          } else if (format) fail("Supported formats are csv and geojson.");
          else response = json({ ...result, metadata });
        } else fail("API route not found.", 404);
      }
    } finally {
      await db.end();
    }
  } catch (error) {
    response = json(
      {
        error: error.status
          ? error.message
          : "Service unavailable. No partial database import was committed.",
      },
      error.status || 503,
    );
  }
  return decorate(response, origin, allowed);
}
function decorate(response, origin, allowed) {
  // No shared caching until publication-revocation semantics are defined.
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Vary", "Origin");
  if (origin && origin === allowed) {
    response.headers.set("Access-Control-Allow-Origin", allowed);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type",
    );
    response.headers.set(
      "Access-Control-Expose-Headers",
      "X-Next-Cursor, X-Result-Count",
    );
  }
  return response;
}
export default { fetch: (request, env) => handle(request, env) };
