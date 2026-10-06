import assert from "node:assert/strict";
import pg from "pg";
import { readFileSync } from "node:fs";
import {
  parseCSV,
  detectMapping,
  normalizeCSV,
  UNIT_OPTIONS,
  checksum,
} from "../../src/data/core.js";
import {
  resolveContext,
  saveImport,
  observations,
  missions,
  catalog,
} from "../src/repository.js";
if (process.env.ASCEND_DISPOSABLE_DATABASE !== "1")
  throw new Error(
    "Set ASCEND_DISPOSABLE_DATABASE=1 only for an empty disposable PostGIS test database.",
  );
const db = new pg.Client(
  process.env.TEST_DATABASE_URL
    ? { connectionString: process.env.TEST_DATABASE_URL }
    : {},
);
await db.connect();
try {
  const existing = await db.query(
    "SELECT to_regclass('public.organizations') AS name",
  );
  assert.equal(
    existing.rows[0].name,
    null,
    "Refusing to run on an initialized database",
  );
  await db.query(
    readFileSync("data-api/migrations/001_scientific_data.sql", "utf8"),
  );
  const insert = async (sql, args) => (await db.query(sql, args)).rows[0].id;
  const organization = await insert(
    "INSERT INTO organizations(name) VALUES('SYNTHETIC TEST Institution') RETURNING id",
  );
  const team = await insert(
    "INSERT INTO teams(organization_id,name) VALUES($1,'SYNTHETIC TEST Team') RETURNING id",
    [organization],
  );
  const site = await insert(
    "INSERT INTO sites(team_id,name,location) VALUES($1,'SYNTHETIC TEST site',ST_SetSRID(ST_MakePoint(-111,45),4326)) RETURNING id",
    [team],
  );
  const platform = await insert(
    "INSERT INTO platforms(team_id,type_id,name) VALUES($1,'radiosonde','SYNTHETIC TEST platform') RETURNING id",
    [team],
  );
  const sensor = await insert(
    "INSERT INTO sensors(team_id,name) VALUES($1,'SYNTHETIC TEST sensor') RETURNING id",
    [team],
  );
  const configuration = await insert(
    "INSERT INTO sensor_configurations(sensor_id,team_id,platform_id) VALUES($1,$2,$3) RETURNING id",
    [sensor, team, platform],
  );
  const mission = await insert(
    "INSERT INTO missions(team_id,site_id,name,mission_date,data_license,synthetic) VALUES($1,$2,'SYNTHETIC TEST mission','2026-06-15','CC0-1.0',true) RETURNING id",
    [team, site],
  );
  await db.query("INSERT INTO mission_platforms VALUES($1,$2,$3)", [
    mission,
    platform,
    team,
  ]);
  const text =
    "timestamp_utc,latitude,longitude,altitude_msl_m,temperature_c\n2026-06-15T12:00:00Z,45,-111,1500,15\n2026-06-15T12:01:00Z,45.001,-111,1600,14\ninvalid,999,-111,,bad\n";
  const bytes = new TextEncoder().encode(text),
    sha = await checksum(bytes),
    parsed = parseCSV(text),
    mapping = detectMapping(parsed.headers),
    units = Object.fromEntries(
      Object.keys(mapping)
        .filter((k) => UNIT_OPTIONS[k].length)
        .map((k) => [k, UNIT_OPTIONS[k][0]]),
    );
  const meta = {
    mission_id: mission,
    sensor_configuration_id: configuration,
    mapping,
    units,
  };
  const ctx = await resolveContext(db, meta);
  const normalized = normalizeCSV(parsed, mapping, units, ctx);
  const objects = new Map();
  const env = {
    ORIGINALS: {
      put: async (key, value, options) => {
        if (objects.has(key)) return null;
        objects.set(key, {
          bytes: value,
          customMetadata: options.customMetadata,
        });
        return {};
      },
      head: async (key) => objects.get(key),
    },
  };
  const imported = await saveImport(
    db,
    env,
    { name: "synthetic-test.csv" },
    bytes,
    sha,
    meta,
    ctx,
    normalized,
  );
  assert.equal(imported.duplicate, false);
  assert.equal(objects.size, 1);
  assert.deepEqual(objects.values().next().value.bytes, bytes);
  assert.equal(
    (await observations(db, { limit: 100 })).data.length,
    0,
    "Private mission must not leak",
  );
  assert.equal((await catalog(db, "teams")).length, 0);
  await db.query("UPDATE missions SET visibility='public' WHERE id=$1", [
    mission,
  ]);
  assert.equal(
    (await observations(db, { limit: 100 })).data.length,
    0,
    "Pending mission must not leak",
  );
  await db.query(
    "UPDATE missions SET publication_status='approved' WHERE id=$1",
    [mission],
  );
  const first = await observations(db, { limit: 2 });
  assert.equal(first.data.length, 2);
  assert.ok(first.nextCursor);
  const second = await observations(db, { limit: 2, cursor: first.nextCursor });
  assert.equal(second.data.length, 1);
  assert.equal(second.data[0].latitude, null);
  assert.ok(second.data[0].qc.length);
  assert.equal(second.nextCursor, null);
  const spatial = await observations(db, {
    limit: 100,
    bbox: [-112, 44, -110, 46],
    parameter: "temperature_c",
    altitude_min: 1550,
  });
  assert.equal(spatial.data.length, 1);
  assert.equal(spatial.data[0].values.temperature_c, 14);
  assert.equal(spatial.data[0].source_sha256, sha);
  assert.equal((await missions(db, { limit: 100 })).data.length, 1);
  assert.equal((await catalog(db, "teams")).length, 1);
  assert.equal((await catalog(db, "sites")).length, 1);
  await db.query("UPDATE missions SET site_id=NULL WHERE id=$1", [mission]);
  const fallback = await missions(db, { limit: 100 });
  assert.equal(
    fallback.data[0].latitude,
    45,
    "Missions without a site use their first valid committed observation",
  );
  await db.query("UPDATE missions SET site_id=$2 WHERE id=$1", [mission, site]);
  const retry = await saveImport(
    db,
    env,
    { name: "synthetic-test.csv" },
    bytes,
    sha,
    meta,
    ctx,
    normalized,
  );
  assert.equal(retry.duplicate, true);
  assert.equal(retry.id, imported.id);
  assert.equal(
    (await db.query("SELECT count(*)::int AS n FROM observations")).rows[0].n,
    3,
  );
  // A failure after archiving must roll back all new DB rows while retaining the original.
  const corrupt = structuredClone(normalized);
  corrupt.rows[0].values.unregistered_parameter = 1;
  await assert.rejects(() =>
    saveImport(
      db,
      env,
      { name: "rollback-test.csv" },
      bytes,
      "a".repeat(64),
      meta,
      ctx,
      corrupt,
    ),
  );
  assert.equal(
    (await db.query("SELECT count(*)::int AS n FROM data_files")).rows[0].n,
    1,
  );
  assert.equal(objects.size, 2);
  await db.query("UPDATE missions SET visibility='private' WHERE id=$1", [
    mission,
  ]);
  assert.equal((await observations(db, { limit: 100 })).data.length, 0);
  console.log(
    "PostGIS migration, provenance, spatial filtering, privacy, pagination, idempotency and rollback passed. R2 is an in-memory test adapter; live binding smoke test still required.",
  );
} finally {
  await db.end();
}
