export const PUBLIC_POLICY =
  "m.visibility='public' AND m.publication_status='approved' AND df.import_status='committed'";
const joins = `FROM observations o JOIN missions m ON m.id=o.mission_id JOIN teams t ON t.id=o.team_id JOIN organizations org ON org.id=t.organization_id JOIN platforms p ON p.id=o.platform_id JOIN sensor_configurations sc ON sc.id=o.sensor_configuration_id JOIN sensors s ON s.id=sc.sensor_id JOIN data_files df ON df.id=o.source_file_id`;
export function whereFilters(f) {
  const args = [],
    clauses = [PUBLIC_POLICY];
  const add = (sql, v) => {
    args.push(v);
    clauses.push(sql.replace("?", `$${args.length}`));
  };
  for (const [key, column] of Object.entries({
    team: "o.team_id",
    mission: "o.mission_id",
    institution: "org.id",
    platform: "p.type_id",
  }))
    if (f[key]) add(column + " = ?", f[key]);
  if (f.parameter)
    add(
      "EXISTS (SELECT 1 FROM observation_values v WHERE v.observation_id=o.id AND v.parameter_id=?)",
      f.parameter,
    );
  if (f.from) add("o.timestamp_utc >= ?::timestamptz", f.from);
  if (f.to) add("o.timestamp_utc <= ?::timestamptz", f.to);
  if (f.year) {
    add("o.timestamp_utc >= ?::timestamptz", `${f.year}-01-01T00:00:00Z`);
    add("o.timestamp_utc < ?::timestamptz", `${f.year + 1}-01-01T00:00:00Z`);
  }
  if (f.altitude_min !== undefined)
    add("o.altitude_msl_m >= ?", f.altitude_min);
  if (f.altitude_max !== undefined)
    add("o.altitude_msl_m <= ?", f.altitude_max);
  if (f.bbox) {
    const n = args.length;
    args.push(...f.bbox);
    clauses.push(
      `ST_Intersects(o.position,ST_MakeEnvelope($${n + 1},$${n + 2},$${n + 3},$${n + 4},4326))`,
    );
  }
  if (f.cursor) add("o.id > ?::bigint", f.cursor);
  return { args, where: clauses.join(" AND ") };
}
export async function observations(db, f) {
  const { where, args } = whereFilters(f);
  args.push(f.limit + 1);
  const { rows } = await db.query(
    `SELECT o.id::text, o.mission_id, m.name AS mission, m.synthetic, m.data_license, o.team_id, t.name AS team, org.id AS organization_id, org.name AS institution, p.name AS platform, p.type_id AS platform_type, s.name AS sensor, o.sensor_configuration_id, o.source_file_id, df.sha256 AS source_sha256, df.parser_version, o.source_row, o.timestamp_utc, ST_Y(o.position) AS latitude, ST_X(o.position) AS longitude, o.altitude_msl_m, o.altitude_agl_m, COALESCE((SELECT jsonb_object_agg(v.parameter_id,v.value) FROM observation_values v WHERE v.observation_id=o.id),'{}') AS values, COALESCE((SELECT jsonb_agg(jsonb_build_object('code',q.flag_code,'detail',q.detail)) FROM observation_qc q WHERE q.observation_id=o.id),'[]') AS qc ${joins} WHERE ${where} ORDER BY o.id LIMIT $${args.length}`,
    args,
  );
  const more = rows.length > f.limit;
  if (more) rows.pop();
  return { data: rows, nextCursor: more ? rows.at(-1).id : null };
}
export async function missions(db, f) {
  // Page mission IDs using a UUID cursor; observations cursor is not reused here.
  const { cursor, ...rest } = f;
  const { where, args } = whereFilters(rest);
  let clause = "";
  if (cursor) {
    args.push(cursor);
    clause = `AND m.id::text > $${args.length}`;
  }
  args.push(Math.min(f.limit, 100) + 1);
  const { rows } = await db.query(
    `SELECT m.id,m.name,m.mission_date,m.description,m.principal_investigator,m.notes,m.data_license,m.synthetic,t.id AS team_id,t.name AS team,org.id AS organization_id,org.name AS institution,ST_Y(COALESCE(site.location,first_position.position)) AS latitude,ST_X(COALESCE(site.location,first_position.position)) AS longitude,COALESCE((SELECT jsonb_agg(jsonb_build_object('id',p.id,'name',p.name,'type',p.type_id)) FROM mission_platforms mp JOIN platforms p ON p.id=mp.platform_id WHERE mp.mission_id=m.id),'[]') AS platforms FROM missions m JOIN teams t ON t.id=m.team_id JOIN organizations org ON org.id=t.organization_id LEFT JOIN sites site ON site.id=m.site_id LEFT JOIN LATERAL (SELECT position FROM observations first_observation JOIN data_files first_file ON first_file.id=first_observation.source_file_id WHERE first_observation.mission_id=m.id AND position IS NOT NULL AND first_file.import_status='committed' ORDER BY first_observation.timestamp_utc,first_observation.id LIMIT 1) first_position ON true WHERE m.id IN (SELECT o.mission_id ${joins} WHERE ${where}) ${clause} ORDER BY m.id LIMIT $${args.length}`,
    args,
  );
  const limit = Math.min(f.limit, 100),
    more = rows.length > limit;
  if (more) rows.pop();
  return { data: rows, nextCursor: more ? rows.at(-1).id : null };
}
export async function catalog(db, kind) {
  if (kind === "parameters")
    return (await db.query("SELECT * FROM parameters ORDER BY id")).rows;
  if (kind === "platforms")
    return (await db.query("SELECT * FROM platform_types ORDER BY id")).rows;
  if (kind === "teams")
    return (
      await db.query(
        `SELECT t.id,t.name,org.id AS organization_id,org.name AS institution FROM teams t JOIN organizations org ON org.id=t.organization_id WHERE EXISTS (SELECT 1 FROM missions m JOIN data_files df ON df.mission_id=m.id WHERE m.team_id=t.id AND ${PUBLIC_POLICY}) ORDER BY t.id LIMIT 1001`,
      )
    ).rows;
  return (
    await db.query(
      `SELECT site.id,site.name,site.team_id,ST_Y(site.location) AS latitude,ST_X(site.location) AS longitude FROM sites site WHERE EXISTS (SELECT 1 FROM missions m JOIN data_files df ON df.mission_id=m.id WHERE m.site_id=site.id AND ${PUBLIC_POLICY}) ORDER BY site.id LIMIT 1001`,
    )
  ).rows;
}
export async function importContexts(db) {
  return (
    await db.query(
      `SELECT m.id AS mission_id,m.name AS mission,m.team_id,m.visibility,m.publication_status,p.id AS platform_id,p.name AS platform,sc.id AS sensor_configuration_id,s.name AS sensor FROM missions m JOIN mission_platforms mp ON mp.mission_id=m.id JOIN platforms p ON p.id=mp.platform_id JOIN sensor_configurations sc ON sc.platform_id=p.id AND sc.team_id=m.team_id JOIN sensors s ON s.id=sc.sensor_id ORDER BY m.mission_date DESC,m.id,sc.id LIMIT 1000`,
    )
  ).rows;
}
export async function resolveContext(db, meta) {
  const { rows } = await db.query(
    `SELECT m.id AS mission_id,m.team_id,p.id AS platform_id,p.name AS platform,s.name AS sensor,sc.id AS sensor_configuration_id FROM missions m JOIN mission_platforms mp ON mp.mission_id=m.id JOIN platforms p ON p.id=mp.platform_id JOIN sensor_configurations sc ON sc.platform_id=p.id AND sc.team_id=m.team_id JOIN sensors s ON s.id=sc.sensor_id WHERE m.id=$1 AND sc.id=$2`,
    [meta.mission_id, meta.sensor_configuration_id],
  );
  if (rows.length !== 1)
    throw Object.assign(
      new Error("Select an existing mission and its sensor configuration."),
      { status: 400 },
    );
  return rows[0];
}
export async function saveImport(
  db,
  env,
  file,
  bytes,
  sha,
  meta,
  context,
  normalized,
) {
  const r2Key = `originals/${context.mission_id}/${sha}.csv`;
  // Archive first. Never delete an authoritative original to compensate for a DB failure.
  const stored = await env.ORIGINALS.put(r2Key, bytes, {
    onlyIf: { etagDoesNotMatch: "*" },
    httpMetadata: { contentType: "text/csv" },
    customMetadata: {
      sha256: sha,
      originalFilename: encodeURIComponent(file.name),
      parserVersion: normalized.parserVersion,
    },
  });
  if (!stored) {
    const existing = await env.ORIGINALS.head(r2Key);
    if (existing?.customMetadata?.sha256 !== sha)
      throw new Error("Archive checksum conflict");
  }
  await db.query("BEGIN");
  try {
    const inserted = await db.query(
      `INSERT INTO data_files(mission_id,platform_id,sensor_configuration_id,team_id,original_filename,r2_key,sha256,bytes,parser_version,mapping,units,import_status,row_count) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'importing',$12) ON CONFLICT(mission_id,sha256) DO NOTHING RETURNING id`,
      [
        context.mission_id,
        context.platform_id,
        context.sensor_configuration_id,
        context.team_id,
        file.name,
        r2Key,
        sha,
        bytes.byteLength,
        normalized.parserVersion,
        JSON.stringify(meta.mapping),
        JSON.stringify(meta.units),
        normalized.rows.length,
      ],
    );
    if (!inserted.rows.length) {
      const prior = await db.query(
        "SELECT id,import_status FROM data_files WHERE mission_id=$1 AND sha256=$2",
        [context.mission_id, sha],
      );
      await db.query("COMMIT");
      return { id: prior.rows[0].id, duplicate: true };
    }
    const id = inserted.rows[0].id;
    for (let i = 0; i < normalized.rows.length; i += 100) {
      const rows = normalized.rows.slice(i, i + 100);
      await db.query(
        `WITH input AS (SELECT * FROM jsonb_to_recordset($1::jsonb) AS r(source_row integer,timestamp_utc timestamptz,latitude double precision,longitude double precision,altitude_msl_m double precision,altitude_agl_m double precision,raw jsonb,"values" jsonb,qc jsonb)), inserted AS (INSERT INTO observations(mission_id,platform_id,sensor_configuration_id,team_id,source_file_id,source_row,timestamp_utc,position,altitude_msl_m,altitude_agl_m,raw_values) SELECT $2,$3,$4,$5,$6,source_row,timestamp_utc,CASE WHEN latitude IS NULL OR longitude IS NULL THEN NULL ELSE ST_SetSRID(ST_MakePoint(longitude,latitude),4326) END,altitude_msl_m,altitude_agl_m,raw FROM input RETURNING id,source_row), vals AS (INSERT INTO observation_values(observation_id,parameter_id,value) SELECT inserted.id,v.key,v.value::double precision FROM inserted JOIN input USING(source_row) CROSS JOIN LATERAL jsonb_each_text(input.values) v) INSERT INTO observation_qc(observation_id,flag_code,detail) SELECT inserted.id,q->>'code',q->>'detail' FROM inserted JOIN input USING(source_row) CROSS JOIN LATERAL jsonb_array_elements(input.qc) q ON CONFLICT DO NOTHING`,
        [
          JSON.stringify(rows),
          context.mission_id,
          context.platform_id,
          context.sensor_configuration_id,
          context.team_id,
          id,
        ],
      );
    }
    await db.query(
      "UPDATE data_files SET import_status='committed' WHERE id=$1",
      [id],
    );
    await db.query("COMMIT");
    return { id, duplicate: false };
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
}
