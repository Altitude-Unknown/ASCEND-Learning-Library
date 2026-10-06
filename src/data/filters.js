import { validTimestamp } from "./core.js";
export const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function parseFilters(params) {
  const f = { limit: 1000 };
  for (const k of ["team", "mission", "institution"])
    if (params.get(k)) {
      if (!UUID.test(params.get(k))) throw new Error("Invalid " + k + " ID.");
      f[k] = params.get(k);
    }
  for (const k of ["platform", "parameter"])
    if (params.get(k)) {
      if (!/^[a-z0-9_]{1,64}$/.test(params.get(k)))
        throw new Error("Invalid " + k);
      f[k] = params.get(k);
    }
  for (const k of ["from", "to"])
    if (params.get(k)) {
      const s = params.get(k);
      if (
        !/^\d{4}-\d\d-\d\d(?:T.*(?:Z|[+-]\d\d:\d\d))?$/.test(s) ||
        !validTimestamp(s.length === 10 ? s + "T00:00:00Z" : s)
      )
        throw new Error("Invalid " + k + " date.");
      f[k] = new Date(s).toISOString();
    }
  if (f.from && f.to && f.from > f.to)
    throw new Error("Start must precede end.");
  for (const k of ["altitude_min", "altitude_max", "year", "limit"])
    if (params.has(k) && params.get(k) !== "") {
      const n = Number(params.get(k));
      if (!Number.isFinite(n)) throw new Error("Invalid " + k);
      f[k] = n;
    }
  if (!Number.isInteger(f.limit) || f.limit < 1 || f.limit > 1000)
    throw new Error("Limit must be 1–1000.");
  if (
    f.year !== undefined &&
    (!Number.isInteger(f.year) || f.year < 1900 || f.year > 2200)
  )
    throw new Error("Invalid year.");
  if (
    f.altitude_min !== undefined &&
    f.altitude_max !== undefined &&
    f.altitude_min > f.altitude_max
  )
    throw new Error("Altitude minimum must not exceed maximum.");
  if (params.get("bbox")) {
    const parts = params.get("bbox").split(",");
    f.bbox = parts.map(Number);
    if (
      parts.length !== 4 ||
      parts.some((x) => !x.trim()) ||
      !f.bbox.every(Number.isFinite) ||
      f.bbox[0] < -180 ||
      f.bbox[2] > 180 ||
      f.bbox[1] < -90 ||
      f.bbox[3] > 90 ||
      f.bbox[0] > f.bbox[2] ||
      f.bbox[1] > f.bbox[3]
    )
      throw new Error(
        "bbox must be west,south,east,north; split antimeridian queries.",
      );
  }
  if (params.get("cursor")) {
    if (
      !/^\d{1,19}$/.test(params.get("cursor")) ||
      BigInt(params.get("cursor")) > 9223372036854775807n
    )
      throw new Error("Invalid cursor.");
    f.cursor = params.get("cursor");
  }
  return f;
}
export function matches(row, f) {
  return (
    (!f.mission || row.mission_id === f.mission) &&
    (!f.team || row.team_id === f.team) &&
    (!f.institution || row.organization_id === f.institution) &&
    (!f.platform || row.platform_type === f.platform) &&
    (!f.parameter || row.values[f.parameter] != null) &&
    (!f.year || row.timestamp_utc?.startsWith(String(f.year))) &&
    (!f.from || (row.timestamp_utc && row.timestamp_utc >= f.from)) &&
    (!f.to || (row.timestamp_utc && row.timestamp_utc <= f.to)) &&
    (f.altitude_min === undefined ||
      (row.altitude_msl_m !== null && row.altitude_msl_m >= f.altitude_min)) &&
    (f.altitude_max === undefined ||
      (row.altitude_msl_m !== null && row.altitude_msl_m <= f.altitude_max)) &&
    (!f.bbox ||
      (row.longitude !== null &&
        row.latitude !== null &&
        row.longitude >= f.bbox[0] &&
        row.longitude <= f.bbox[2] &&
        row.latitude >= f.bbox[1] &&
        row.latitude <= f.bbox[3])) &&
    (!f.cursor || BigInt(row.id) > BigInt(f.cursor))
  );
}
