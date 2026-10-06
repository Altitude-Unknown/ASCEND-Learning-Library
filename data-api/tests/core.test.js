import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  parseCSV,
  normalizeCSV,
  detectMapping,
  UNIT_OPTIONS,
  exportCSV,
  exportGeoJSON,
  checksum,
  validTimestamp,
} from "../../src/data/core.js";
import { parseFilters } from "../../src/data/filters.js";
import { whereFilters, PUBLIC_POLICY } from "../src/repository.js";
const units = (mapping) =>
  Object.fromEntries(
    Object.keys(mapping)
      .filter((f) => UNIT_OPTIONS[f]?.length)
      .map((f) => [f, UNIT_OPTIONS[f][0]]),
  );
function normalize(text) {
  const parsed = parseCSV(text),
    mapping = detectMapping(parsed.headers);
  return normalizeCSV(parsed, mapping, units(mapping));
}
test("quoted CSV, BOM and CRLF preserve textual source values", () => {
  const parsed = parseCSV(
    '\uFEFFtimestamp_utc,temperature_c,note\r\n2026-06-15T12:00:00Z,12,"a, b\nsecond line"\r\n',
  );
  assert.equal(parsed.rows[0][2], "a, b\nsecond line");
});
test("malformed, ragged and duplicate headers fail explicitly", () => {
  for (const s of ["a,a\n1,2", "a,b\n1", 'a,b\n"broken,2'])
    assert.throws(() => parseCSV(s));
});
test("unit confirmation is required and conversions retain raw values", () => {
  const p = parseCSV(
      "time,temp,lat,lon,alt\n2026-06-15T12:00:00Z,68,45,-111,1000",
    ),
    m = detectMapping(p.headers);
  assert.throws(() => normalizeCSV(p, m, {}), /units/);
  const n = normalizeCSV(p, m, {
    temperature_c: "°F",
    latitude: "°",
    longitude: "°",
    altitude_msl_m: "ft",
  });
  assert.equal(n.rows[0].values.temperature_c, 20);
  assert.equal(n.rows[0].altitude_msl_m, 304.8);
  assert.equal(n.rows[0].raw.temp, "68");
});
test("questionable rows retained with flags, no silent loss or invalid geometry", () => {
  const n = normalize(
    "timestamp_utc,latitude,longitude,relative_humidity_pct,temperature_c\ninvalid,100,200,110,bad\n2026-06-15T12:00:00Z,45,-111,50,10\n2026-06-15T12:00:00Z,46,-111,50,10",
  );
  assert.equal(n.rows.length, 3);
  assert.equal(n.rows[0].latitude, null);
  assert.equal(n.rows[0].values.relative_humidity_pct, 110);
  for (const flag of [
    "invalid_timestamp",
    "invalid_position",
    "range",
    "invalid_numeric",
    "missing_altitude",
    "duplicate_timestamp",
    "gps_jump",
  ])
    assert.ok(n.summary.flags[flag], flag);
});
test("calendar-invalid and timezone-free timestamps are not silently repaired", () => {
  assert.equal(validTimestamp("2026-02-30T12:00:00Z"), false);
  assert.equal(validTimestamp("2026-06-15T12:00:00"), false);
  assert.equal(validTimestamp("2026-06-15T12:00:00-06:00"), true);
});
test("metadata conflicts are visible", () => {
  const p = parseCSV(
      "timestamp_utc,temperature_c,mission_id\n2026-06-15T12:00:00Z,20,wrong",
    ),
    m = detectMapping(p.headers);
  assert.ok(
    normalizeCSV(p, m, units(m), { mission_id: "expected" }).summary.flags
      .metadata_mismatch,
  );
});
test("public SQL filters bind input and always enforce publication policy", () => {
  const f = parseFilters(
    new URLSearchParams(
      "parameter=pm25_ugm3&bbox=-112,40,-100,50&altitude_min=100&limit=20",
    ),
  );
  const sql = whereFilters(f);
  assert.ok(sql.where.includes(PUBLIC_POLICY));
  assert.ok(sql.where.includes("ST_Intersects"));
  assert.ok(!sql.where.includes("pm25_ugm3"));
  assert.equal(sql.args[0], "pm25_ugm3");
  assert.throws(() => parseFilters(new URLSearchParams("limit=1000000")));
  assert.throws(() =>
    parseFilters(new URLSearchParams("parameter=x%27%3BDROP")),
  );
  assert.throws(() => parseFilters(new URLSearchParams("bbox=180,40,-180,50")));
});
test("exports contain provenance, safe text, and honest altitude references", () => {
  const row = {
    mission: "=cmd()",
    latitude: 45,
    longitude: -111,
    altitude_msl_m: 1500,
    source_file_id: "source",
    source_sha256: "hash",
    values: { temperature_c: -15 },
    qc: [],
  };
  const csv = exportCSV([row]);
  assert.ok(csv.includes("'=cmd()"));
  assert.ok(csv.includes('"-15"'));
  const geo = exportGeoJSON([row]);
  assert.deepEqual(geo.features[0].geometry.coordinates, [-111, 45]);
  assert.equal(geo.features[0].properties.altitude_msl_m, 1500);
});
test("all demo mission files have exact provenance checksums and parse successfully", async () => {
  const demo = JSON.parse(readFileSync("public/assets/data/demo/dataset.json"));
  assert.equal(demo.missions.length, 3);
  for (const m of demo.missions) {
    assert.equal(m.synthetic, true);
    const bytes = readFileSync(
      "public/assets/data/demo/" + m.platforms[0].type + ".csv",
    );
    assert.equal(
      await checksum(bytes),
      demo.observations.find((r) => r.mission_id === m.id).source_sha256,
    );
    assert.equal(normalize(bytes.toString()).rows.length, 90);
  }
});
test("blank measurement records are retained and screened", () => {
  const n = normalize(
    "timestamp_utc,temperature_c\n2026-06-15T12:00:00Z,20\n,\n",
  );
  assert.equal(n.rows.length, 2);
  assert.ok(n.rows[1].qc.some((q) => q.code === "invalid_timestamp"));
  assert.equal(validTimestamp("2026-06-15T24:00:00Z"), false);
});

test("CSV exports include future registered measurements and reject invalid filter calendar dates", () => {
  const csv = exportCSV([{ values: { ozone_ppb: 12.3 }, qc: [] }]);
  assert.ok(csv.includes('"ozone_ppb"'));
  assert.ok(csv.includes('"12.3"'));
  assert.throws(
    () => parseFilters(new URLSearchParams("from=2026-02-30")),
    /Invalid/,
  );
});
