# ASCEND Data API v1

All database access is server-side. Responses are JSON except explicit exports.
`GET /api/health` reports whether bindings are configured (not connectivity).

| Endpoint | Response |
| --- | --- |
| GET /api/teams | Public teams and institutions; explicit 1,000 entry cap/truncated flag |
| GET /api/platforms | Extensible platform type catalog |
| GET /api/parameters | Parameter IDs, labels and canonical units |
| GET /api/sites | Public mission sites; explicit 1,000 entry cap/truncated flag |
| GET /api/missions | Filtered mission metadata, up to 100 per page |
| GET /api/missions/{UUID} | Same envelope restricted to one approved public mission |
| GET /api/missions/{UUID}/observations | Mission observations, keyset-paginated |
| GET /api/observations | Filtered observations, keyset-paginated |
| GET /api/admin/missions | Administrator-only import destinations (up to 1,000) |
| POST /api/admin/imports/preview | Server CSV validation and signed confirmation ticket |
| POST /api/admin/imports/confirm | Verify ticket, archive exact original, transactional import |

Public results always require mission visibility `public`, publication status
`approved`, and file status `committed`. Unknown/private missions return an empty
data envelope. No public endpoint retrieves raw originals or writes data.

## Filters and pagination

`team`, `mission`, `institution` are UUIDs; `platform` is a type ID;
`parameter` is a registered measurement ID. `from` and `to` are inclusive ISO UTC
date/time bounds; `year` filters observation time; `bbox=west,south,east,north`
uses WGS84 degrees. `altitude_min` and `altitude_max` filter MSL meters.
Bounding boxes crossing the antimeridian must be split into two requests.
Missing positions are excluded from spatial filters, not deleted from storage.

Observation pages use `limit` (1–1,000, default 1,000), ordered by immutable
observation ID, and `cursor` (the last observation ID as a decimal string).
Never convert bigint IDs to JavaScript numbers. Mission pages use UUID cursors.
The envelope contains `data` and `nextCursor`; null means completion. Follow the
cursor with identical filters until null. New concurrent imports can appear in
later pages: V1 exports are not transactionally frozen snapshots. Observation
records carry mission/team/institution/platform/sensor, canonical values, QC,
source file/row/checksum/parser, license and synthetic indicator.

```text
/api/observations?parameter=pm25_ugm3&bbox=-112,44,-110,47&limit=500
/api/observations?parameter=pm25_ugm3&bbox=-112,44,-110,47&limit=500&cursor=500
```

The above bbox and cursor are query examples, not claims about actual datasets.
Filters use bound SQL parameters; limits and coordinate bounds are validated.
SQL statement deadlines and request limits bound synchronous V1 work. Millions
of observations will require query-plan monitoring, aggregation and vector tiles.

## Downloads

Add `format=csv` or `format=geojson` to observation endpoints. These return **one
page**, not a silent full-database dump. `X-Next-Cursor` is empty at the final page;
`X-Result-Count` reports rows. CSV includes metadata columns on every row. GeoJSON
includes filter/export metadata and null geometry for missing positions.
Use subsequent page requests to retrieve a complete filtered dataset.

The website exports its displayed selection (maximum 5,000 points) and clearly
states this scope. It includes a metadata sidecar for CSV. Neither API nor client
silently downsamples. Trajectories omit connections across source files, gaps and
GPS-jump/time-order flags. Charts display points rather than invent continuity.

## Administrator uploads

Send `Authorization: Bearer <administrator secret>` over HTTPS. The browser stores
this token only in memory. No cookies, credentialed CORS or public signup.
Only the configured origin receives CORS access; CORS is not authorization.

Both upload endpoints accept `multipart/form-data` containing:

- `file`: UTF-8 CSV, ≤2 MiB, ≤5,000 records, ≤100 columns.
- `metadata`: JSON with `mission_id`, `sensor_configuration_id`, `mapping`
  (canonical field → source header), and `units` (canonical field → source unit).

Preview returns summary/QC counts, first 100 normalized records, SHA-256, parser
version and a signed ticket. Final confirmation resubmits the exact file and
metadata plus `ticket`, `confirmed=true`, and `acknowledgeQC=true` for flagged
files. Tickets expire after 15 minutes. A changed file/name/mapping/destination
invalidates confirmation. Duplicate mission/checksum returns the previous file
ID with `duplicate=true`. New imports return HTTP 201 and a file ID.

Errors use `{ "error": "..." }`: 400 invalid input/expired confirmation, 401
unauthorized, 403 origin rejection, 404 route not found, 405 method rejected,
413 oversized request, 503 unconfigured/unavailable service. Responses do not
leak SQL exceptions or secrets. No shared cache is enabled in V1.
