# ASCEND Data Explorer architecture

## Repository review (October 5, 2026)

The existing website is Eleventy 3, Nunjucks, Markdown, vanilla JavaScript and
shared CSS (`public/assets/site.css`). `content/` routes use explicit permalinks;
`content/_includes/layouts/base.njk` owns navigation. Pagefind provides search.
GitHub Actions runs Node checks and Playwright. Git pushes to `main` trigger the
existing Cloudflare Pages build (`npm run build`, output `_site`). Keep this
workflow and existing library resources intact.

The repository documents an existing R2 library bucket. That public bucket is
not suitable for private scientific originals. There is no existing Worker,
Hyperdrive binding, Postgres service, authentication system or Wrangler config.
These findings describe checked-in configuration, not an account-wide audit.
No credentials or account access are assumed.

## V1 plan

1. Add portable PostgreSQL/PostGIS migrations, parameter catalog and provenance.
2. Share CSV parsing, mapping, unit conversion and QC between browser and Worker.
3. Implement a bounded Worker API using `pg` via Hyperdrive, private R2 originals,
   an administrator bearer secret, and explicit preview/confirm import.
4. Add `/data/`, `/data/upload/`, and `/data/standard/` in existing Eleventy layouts.
   Use MapLibre, accessible tables, time series and radiosonde altitude profiles.
5. Add synthetic fixed-wing, HAB and radiosonde examples, exports, tests and
   operational documentation. Keep service-dependent deployment explicit.

## Boundaries

Browser → Worker API → Hyperdrive → PostgreSQL/PostGIS.
Worker → private R2 archive (unchanged CSV bytes).
Eleventy continues to deploy independently to the existing Pages site.

The frontend uses a build-time API base URL. An empty value selects the clearly
labeled, small static synthetic demonstration; a configured API failure never
falls back to synthetic data. A dedicated Worker URL works with restricted CORS;
a same-origin `/api/*` route is also possible once an owned domain exists.
Do not assume Worker routes can be attached to the current pages.dev hostname.

The database is provider independent: standard PostgreSQL SQL plus PostGIS, no
provider SDK, no D1. Change hosting by migrating the database and updating
Hyperdrive. Each request creates and closes its own `pg.Client`.

## Scientific model

Organizations → teams → missions; sites locate studies, platforms and sensor
configurations describe acquisition. Data files retain SHA-256, exact filename,
upload time, mappings, units, parser version and import status. Each observation
references its mission, platform, sensor configuration, team and source row/file.
Measurement values are normalized into a parameter/value table with canonical
units, so adding a parameter does not require altering observation columns.
Position uses nullable WGS84 Point geometry and a geography index. MSL/AGL
altitudes remain distinct; neither is inferred from the other.

QC flags are attached to observations. Invalid parsed fields become null with an
explicit flag; original values remain in archived CSV and per-row raw JSON.
No questionable rows are silently removed. Parse/structure failures prevent
import, while scientific warnings require acknowledgement. V1 makes no claim
of scientific QC approval or calibrated accuracy.

## Privacy and bounded work

Public queries require both public mission visibility and approved publication
state, and only include committed files. New imports never publish themselves.
Public exports apply the same policy. No database or administrator secret is
included in site assets. The V1 administrator workflow is intentionally narrow;
future roles should replace its authorization adapter, not public query logic.

V1 limits uploads and paginates all observations. API filters run in SQL before
pagination. Map requests use extent filters and bounded pages; the UI discloses
partial tracks. This is not a national dataset download into the browser.
Original files are immutable R2 objects; a failed database transaction may leave
an unreferenced archive object, which is retained for reconciliation/recovery.

## Extensions

A renderer-independent observation contract retains actual altitude for future
deck.gl layers. No fabricated 3-D height. Vertical profiles are ordinary
parameter/altitude data and can later feed Skew-T/log-P. Larger imports should use
R2 staged uploads, Queues and resumable jobs; large exports should use asynchronous
R2 artifacts. Vector tiles, temporal/spatial aggregates, NetCDF, KML, OGC services,
calibration histories, NASA dataset adapters and telemetry are separate extensions.

## V1 implementation result

The planned routes, Worker API, migration, original-file archive adapter, shared
CSV pipeline, sample data and documentation are implemented. The demonstration
is explicitly synthetic. The map uses bundled MapLibre and Natural Earth land
boundaries; no map account or tiles URL is assumed. Mission markers honor filters
and use a launch/study site or the first valid committed position.

The public UI loads at most 1,000 observations per request and 5,000 for display.
Mission markers are bounded to 100 matches per query, with a notice when partial.
Exports say when they are partial; the API supports further keyset pagination.
The single-team filter and scatter plots are V1; multiple-team selection and
comparison styling remain V2. There is no 3-D mode presented as implemented.

Database behavior is checked in CI against an actual disposable PostGIS instance.
R2 is a test adapter in that integration test. No production scientific database,
Hyperdrive binding, private archive or authentication secret has been provisioned.
The code lives on a feature branch for review rather than changing production main.
