import Papa from "papaparse";
export const PARSER_VERSION = "ascend-csv/1.0.0";
export const MAX_BYTES = 2 * 1024 * 1024;
export const MAX_ROWS = 5000;
export const PARAMETERS = [
  ["pm1_ugm3", "PM1", "µg/m³"],
  ["pm25_ugm3", "PM2.5", "µg/m³"],
  ["pm10_ugm3", "PM10", "µg/m³"],
  ["temperature_c", "Temperature", "°C"],
  ["relative_humidity_pct", "Relative humidity", "%"],
  ["pressure_hpa", "Pressure", "hPa"],
  ["wind_speed_ms", "Wind speed", "m/s"],
  ["wind_direction_deg", "Wind direction", "°"],
].map(([id, label, unit]) => ({ id, label, unit }));
export const FIELDS = [
  "project",
  "team_id",
  "mission_id",
  "platform",
  "timestamp_utc",
  "latitude",
  "longitude",
  "altitude_msl_m",
  "altitude_agl_m",
  ...PARAMETERS.map((p) => p.id),
  "sensor",
  "qc_flag",
];
const aliases = {
  timestamp_utc: ["timestamp", "datetime", "time", "utc"],
  latitude: ["lat", "gps_lat"],
  longitude: ["lon", "lng", "gps_lon"],
  altitude_msl_m: ["altitude", "alt", "altitude_m", "msl"],
  altitude_agl_m: ["agl"],
  pm25_ugm3: ["pm25", "pm2_5", "pm2.5"],
  pm1_ugm3: ["pm1"],
  pm10_ugm3: ["pm10"],
  temperature_c: ["temperature", "temp", "temp_c"],
  relative_humidity_pct: ["humidity", "rh"],
  pressure_hpa: ["pressure", "baro"],
  wind_speed_ms: ["wind_speed"],
  wind_direction_deg: ["wind_direction"],
};
export const UNIT_OPTIONS = Object.fromEntries(
  FIELDS.map((f) => [
    f,
    f.startsWith("altitude_")
      ? ["m", "ft"]
      : f.startsWith("pm")
        ? ["µg/m³", "mg/m³"]
        : f === "temperature_c"
          ? ["°C", "°F", "K"]
          : f === "relative_humidity_pct"
            ? ["%", "fraction"]
            : f === "pressure_hpa"
              ? ["hPa", "Pa", "kPa"]
              : f === "wind_speed_ms"
                ? ["m/s", "km/h", "knots"]
                : f === "wind_direction_deg" ||
                    ["latitude", "longitude"].includes(f)
                  ? ["°"]
                  : [],
  ]),
);
export function parseCSV(text) {
  if (new TextEncoder().encode(text).length > MAX_BYTES)
    throw new Error("CSV exceeds the V1 2 MiB limit.");
  const parsed = Papa.parse(text.replace(/^\uFEFF/, ""), {
    skipEmptyLines: true,
  });
  if (parsed.errors.length)
    throw new Error("Malformed CSV: " + parsed.errors[0].message);
  const [headers, ...rows] = parsed.data;
  if (!headers?.length || !rows.length)
    throw new Error("CSV needs a header and at least one data row.");
  if (
    headers.some((h) => !h.trim()) ||
    new Set(headers).size !== headers.length
  )
    throw new Error("Headers must be nonempty and unique.");
  if (headers.length > 100 || rows.length > MAX_ROWS)
    throw new Error(
      "V1 accepts up to 100 columns and 5,000 observations per file.",
    );
  if (rows.some((r) => r.length !== headers.length))
    throw new Error(
      "Every row must have the same number of fields as the header.",
    );
  return { headers, rows };
}
export function detectMapping(headers) {
  const mapping = {};
  for (const f of FIELDS) {
    const h =
      headers.find((h) => h.toLowerCase().trim() === f) ||
      headers.find((h) => (aliases[f] || []).includes(h.toLowerCase().trim()));
    if (h) mapping[f] = h;
  }
  return mapping;
}
export function validTimestamp(s) {
  if (
    !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?(?:Z|[+-]\d\d:\d\d)$/.test(s)
  )
    return false;
  const [year, month, day] = s.slice(0, 10).split("-").map(Number);
  const hour = Number(s.slice(11, 13)),
    minute = Number(s.slice(14, 16)),
    second = Number(s.slice(17, 19));
  return (
    hour < 24 &&
    minute < 60 &&
    second < 60 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= new Date(Date.UTC(year, month, 0)).getUTCDate() &&
    Number.isFinite(Date.parse(s))
  );
}
function convert(n, unit) {
  return unit === "ft"
    ? n * 0.3048
    : unit === "mg/m³"
      ? n * 1000
      : unit === "°F"
        ? ((n - 32) * 5) / 9
        : unit === "K"
          ? n - 273.15
          : unit === "fraction"
            ? n * 100
            : unit === "Pa"
              ? n / 100
              : unit === "kPa"
                ? n * 10
                : unit === "km/h"
                  ? n / 3.6
                  : unit === "knots"
                    ? n * 0.514444
                    : n;
}
export function distance(a, b) {
  const rad = Math.PI / 180,
    dlat = (b.latitude - a.latitude) * rad,
    dlon = (b.longitude - a.longitude) * rad;
  return (
    6371000 *
    2 *
    Math.asin(
      Math.min(
        1,
        Math.sqrt(
          Math.sin(dlat / 2) ** 2 +
            Math.cos(a.latitude * rad) *
              Math.cos(b.latitude * rad) *
              Math.sin(dlon / 2) ** 2,
        ),
      ),
    )
  );
}
export function normalizeCSV(parsed, mapping, units = {}, context = {}) {
  for (const [f, h] of Object.entries(mapping))
    if (!FIELDS.includes(f) || !parsed.headers.includes(h))
      throw new Error("Invalid column mapping.");
  if (new Set(Object.values(mapping)).size !== Object.values(mapping).length)
    throw new Error("Map each source column only once.");
  if (!mapping.timestamp_utc)
    throw new Error("Map a timestamp column before validation.");
  if (!PARAMETERS.some((p) => mapping[p.id]))
    throw new Error("Map at least one measurement parameter.");
  for (const [f, opts] of Object.entries(UNIT_OPTIONS))
    if (mapping[f] && opts.length && !opts.includes(units[f]))
      throw new Error("Confirm units for " + f + ".");
  const seen = new Set(),
    counts = {};
  let previous = null;
  const rows = parsed.rows.map((cells, index) => {
    const raw = Object.fromEntries(parsed.headers.map((h, i) => [h, cells[i]]));
    const read = (f) => (mapping[f] ? raw[mapping[f]].trim() : "");
    const qc = [];
    const flag = (code, detail) => {
      qc.push({ code, detail });
      counts[code] = (counts[code] || 0) + 1;
    };
    function number(f) {
      const s = read(f);
      if (s === "") return null;
      if (
        !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(s) ||
        !Number.isFinite(Number(s))
      ) {
        flag("invalid_numeric", f);
        return null;
      }
      const n = convert(Number(s), units[f]);
      if (!Number.isFinite(n)) {
        flag("invalid_numeric", f);
        return null;
      }
      return n;
    }
    const time = read("timestamp_utc");
    const timestamp_utc = validTimestamp(time)
      ? new Date(time).toISOString()
      : null;
    if (!timestamp_utc) flag("invalid_timestamp", "timestamp_utc");
    if (timestamp_utc && seen.has(timestamp_utc))
      flag("duplicate_timestamp", "Within this file");
    if (timestamp_utc) seen.add(timestamp_utc);
    let latitude = number("latitude"),
      longitude = number("longitude");
    if (
      latitude === null ||
      longitude === null ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      flag("invalid_position", "Coordinates retained in raw source");
      latitude = null;
      longitude = null;
    }
    const altitude_msl_m = number("altitude_msl_m"),
      altitude_agl_m = number("altitude_agl_m");
    if (altitude_msl_m === null) flag("missing_altitude", "altitude_msl_m");
    const values = {};
    for (const p of PARAMETERS) {
      const n = number(p.id);
      if (n !== null) values[p.id] = n;
    }
    for (const [f, n] of Object.entries({
      ...values,
      altitude_msl_m,
      altitude_agl_m,
    })) {
      if (n === null) continue;
      const range = f.startsWith("pm")
        ? [0, 10000]
        : f === "relative_humidity_pct"
          ? [0, 100]
          : f === "temperature_c"
            ? [-100, 70]
            : f === "pressure_hpa"
              ? [0.01, 1100]
              : f === "wind_speed_ms"
                ? [0, 150]
                : f === "wind_direction_deg"
                  ? [0, 360]
                  : [-1000, 60000];
      if (n < range[0] || n > range[1])
        flag("range", f + "=" + n + " outside " + range.join("…"));
    }
    if (read("qc_flag")) flag("source_qc", read("qc_flag").slice(0, 512));
    for (const f of ["team_id", "mission_id", "platform", "sensor"])
      if (read(f) && context[f] && read(f) !== context[f])
        flag("metadata_mismatch", f + " differs from selected metadata");
    const row = {
      source_row: index + 2,
      timestamp_utc,
      latitude,
      longitude,
      altitude_msl_m,
      altitude_agl_m,
      values,
      qc,
      raw,
    };
    if (previous && timestamp_utc && previous.timestamp_utc) {
      const seconds =
        (Date.parse(timestamp_utc) - Date.parse(previous.timestamp_utc)) / 1000;
      if (seconds < 0) flag("time_order", "Earlier than previous source row");
      if (
        latitude !== null &&
        previous.latitude !== null &&
        (seconds > 0
          ? distance(previous, row) / seconds > 150
          : seconds === 0 && distance(previous, row) > 10)
      )
        flag("gps_jump", "Check positions, timestamps and platform motion");
    }
    previous = row;
    return row;
  });
  const statistics = Object.fromEntries(
    PARAMETERS.map((p) => {
      const ns = rows.map((r) => r.values[p.id]).filter((n) => n !== undefined);
      return [
        p.id,
        {
          count: ns.length,
          min: ns.length ? Math.min(...ns) : null,
          max: ns.length ? Math.max(...ns) : null,
          mean: ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : null,
        },
      ];
    }),
  );
  return {
    rows,
    summary: {
      rowCount: rows.length,
      positionCount: rows.filter((r) => r.latitude !== null).length,
      flaggedRows: rows.filter((r) => r.qc.length).length,
      flags: counts,
      statistics,
    },
    parserVersion: PARSER_VERSION,
  };
}
export async function checksum(bytes) {
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export function csvCell(v) {
  let s =
    v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
  // Protect spreadsheets from formulas in metadata and annotations, while retaining numbers.
  if (typeof v !== "number" && /^[\s]*[=+\-@]/.test(s)) s = "'" + s;
  return '"' + s.replaceAll('"', '""') + '"';
}
export function exportCSV(rows) {
  const fields = [
    "project",
    "synthetic",
    "mission_id",
    "mission",
    "team_id",
    "team",
    "institution",
    "platform",
    "sensor",
    "data_license",
    "source_file_id",
    "source_sha256",
    "parser_version",
    "source_row",
    "timestamp_utc",
    "latitude",
    "longitude",
    "altitude_msl_m",
    "altitude_agl_m",
    ...new Set([
      ...PARAMETERS.map((p) => p.id),
      ...rows.flatMap((r) => Object.keys(r.values || {})),
    ]),
    "qc_flag",
  ];
  return (
    [
      fields.map(csvCell).join(","),
      ...rows.map((r) =>
        fields
          .map((f) =>
            csvCell(
              f === "project"
                ? "ASCEND"
                : f === "qc_flag"
                  ? r.qc
                  : (r.values?.[f] ?? r[f]),
            ),
          )
          .join(","),
      ),
    ].join("\r\n") + "\r\n"
  );
}
export function exportGeoJSON(rows, metadata = {}) {
  return {
    type: "FeatureCollection",
    metadata,
    features: rows.map((r) => {
      const { latitude, longitude, ...properties } = r;
      return {
        type: "Feature",
        geometry:
          latitude == null || longitude == null
            ? null
            : { type: "Point", coordinates: [longitude, latitude] },
        properties: {
          ...properties,
          latitude,
          longitude,
          altitude_reference:
            "MSL in properties; GeoJSON coordinates are 2-D to avoid implying ellipsoidal height",
        },
      };
    }),
  };
}
