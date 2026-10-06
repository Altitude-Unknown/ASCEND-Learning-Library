import test from "node:test";
import assert from "node:assert/strict";
import { handle, makeTicket, readTicket } from "../src/worker.js";
const req = (path, init) =>
  new Request("https://api.example.test" + path, init);
test("unconfigured services fail closed", async () => {
  assert.equal((await handle(req("/api/observations"), {})).status, 503);
  assert.equal((await handle(req("/api/admin/missions"), {})).status, 503);
});
test("authorization and CORS block before database connection", async () => {
  let connects = 0;
  const connect = () => {
    connects++;
    throw Error("should not connect");
  };
  const env = {
    ADMIN_TOKEN: "test-only-secret",
    ALLOWED_ORIGIN: "https://site.example.test",
    HYPERDRIVE: {},
  };
  assert.equal(
    (await handle(req("/api/admin/missions"), env, connect)).status,
    401,
  );
  assert.equal(
    (
      await handle(
        req("/api/observations", {
          headers: { Origin: "https://other.example.test" },
        }),
        env,
        connect,
      )
    ).status,
    403,
  );
  assert.equal(connects, 0);
});
test("public filters return bounded pages with no shared caching", async () => {
  const statements = [];
  let closed = false;
  const db = {
    query: async (sql, args) => {
      statements.push([sql, args]);
      return {
        rows: sql.includes("SELECT o.id") ? [{ id: "1" }, { id: "2" }] : [],
      };
    },
    end: async () => {
      closed = true;
    },
  };
  const r = await handle(
    req("/api/observations?limit=1"),
    { HYPERDRIVE: {} },
    async () => db,
  );
  const b = await r.json();
  assert.equal(b.data.length, 1);
  assert.equal(b.nextCursor, "1");
  assert.equal(r.headers.get("Cache-Control"), "no-store");
  assert.equal(closed, true);
  assert.match(statements[1][0], /publication_status='approved'/);
});
test("database errors never disclose credentials or raw exception", async () => {
  const r = await handle(
    req("/api/observations"),
    { HYPERDRIVE: {} },
    async () => {
      throw Error("secret-database-connection");
    },
  );
  assert.equal(r.status, 503);
  assert.ok(!(await r.text()).includes("secret-database"));
});
test("signed review rejects tampering and expiration", async () => {
  const key = "test-only-signing-secret",
    payload = { sha: "abc", expires: Date.now() + 10000 };
  const ticket = await makeTicket(payload, key);
  assert.deepEqual(await readTicket(ticket, key), payload);
  await assert.rejects(() => readTicket(ticket + "0", key));
  await assert.rejects(() => readTicket(ticket, "wrong"));
  await assert.rejects(() => readTicket(awaitable(), key));
  function awaitable() {
    return "invalid";
  }
  const expired = await makeTicket({ ...payload, expires: 1 }, key);
  await assert.rejects(() => readTicket(expired, key), /expired/);
});

test("server preview and confirmation archive exact bytes, reject changed mappings and require QC acknowledgement", async () => {
  const mission = "30000000-0000-4000-8000-000000000001",
    configuration = "60000000-0000-4000-8000-000000000001";
  const metadata = {
    mission_id: mission,
    sensor_configuration_id: configuration,
    mapping: { timestamp_utc: "timestamp_utc", temperature_c: "temperature_c" },
    units: { temperature_c: "°C" },
  };
  const csv = "timestamp_utc,temperature_c\r\n2026-06-15T12:00:00Z,20\r\n";
  const archived = [],
    statements = [];
  const env = {
    HYPERDRIVE: {},
    ADMIN_TOKEN: "test-admin",
    IMPORT_SIGNING_SECRET: "test-signing",
    ORIGINALS: {
      put: async (key, bytes) => {
        archived.push({ key, bytes });
        return {};
      },
    },
  };
  const connect = async () => ({
    query: async (sql, args) => {
      statements.push(sql);
      if (sql.includes("WHERE m.id=$1 AND sc.id=$2"))
        return {
          rows: [
            {
              mission_id: mission,
              sensor_configuration_id: configuration,
              team_id: "20000000-0000-4000-8000-000000000001",
              platform_id: "50000000-0000-4000-8000-000000000001",
            },
          ],
        };
      if (sql.startsWith("INSERT INTO data_files"))
        return { rows: [{ id: "40000000-0000-4000-8000-000000000001" }] };
      return { rows: [] };
    },
    end: async () => {},
  });
  function form(meta = metadata, content = csv) {
    const f = new FormData();
    f.set("file", new File([content], "test.csv", { type: "text/csv" }));
    f.set("metadata", JSON.stringify(meta));
    return f;
  }
  const post = (path, body) =>
    handle(
      req(path, {
        method: "POST",
        headers: { Authorization: "Bearer test-admin" },
        body,
      }),
      env,
      connect,
    );
  const preview = await post("/api/admin/imports/preview", form());
  assert.equal(preview.status, 200);
  const review = await preview.json();
  assert.equal(archived.length, 0);
  assert.equal(review.summary.rowCount, 1);
  const changed = form({ ...metadata, units: { temperature_c: "°F" } });
  changed.set("ticket", review.ticket);
  changed.set("confirmed", "true");
  changed.set("acknowledgeQC", "true");
  assert.equal((await post("/api/admin/imports/confirm", changed)).status, 400);
  const missingAck = form();
  missingAck.set("ticket", review.ticket);
  missingAck.set("confirmed", "true");
  assert.equal(
    (await post("/api/admin/imports/confirm", missingAck)).status,
    400,
  );
  const confirmed = form();
  confirmed.set("ticket", review.ticket);
  confirmed.set("confirmed", "true");
  confirmed.set("acknowledgeQC", "true");
  const response = await post("/api/admin/imports/confirm", confirmed);
  assert.equal(response.status, 201);
  assert.equal(archived.length, 1);
  assert.equal(new TextDecoder().decode(archived[0].bytes), csv);
  assert.ok(statements.includes("BEGIN"));
  assert.ok(statements.includes("COMMIT"));
});

test("oversized unauthenticated requests never reach parsing or storage", async () => {
  let connected = false;
  const response = await handle(
    req("/api/admin/imports/preview", {
      method: "POST",
      body: "x",
      headers: { "Content-Length": "999999999" },
    }),
    { ADMIN_TOKEN: "test" },
    async () => {
      connected = true;
    },
  );
  assert.equal(response.status, 401);
  assert.equal(connected, false);
});
