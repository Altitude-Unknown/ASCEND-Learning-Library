import pg from "pg";
import { readFileSync } from "node:fs";
if (!process.env.DATABASE_URL)
  throw new Error(
    "Set DATABASE_URL in your shell or secret manager; never commit it.",
  );
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await db.connect();
  await db.query("SELECT pg_advisory_lock(81462026)");
  const exists = await db.query(
    "SELECT to_regclass('public.ascend_schema_migrations') AS table_name",
  );
  const applied = exists.rows[0].table_name
    ? (await db.query("SELECT version FROM ascend_schema_migrations")).rows.map(
        (r) => r.version,
      )
    : [];
  if (!applied.includes(1)) {
    await db.query(
      readFileSync("data-api/migrations/001_scientific_data.sql", "utf8"),
    );
    console.log("Applied scientific schema version 1.");
  } else console.log("Scientific schema is current.");
} finally {
  await db.end();
}
