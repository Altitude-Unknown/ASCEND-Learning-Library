# Data Explorer setup and operations

See [architecture](../DATA_EXPLORER_ARCHITECTURE.md), [data standard](../ASCEND_DATA_STANDARD.md),
[API](API.md), and [schema](SCHEMA.md). Existing Pages hosting remains unchanged.

## What must be created

| Resource | Purpose | Configuration |
| --- | --- | --- |
| External PostgreSQL 15+ with PostGIS 3+ | Scientific metadata, measurements and spatial queries | Provider choice remains open; require TLS, extension support and backups |
| Cloudflare Hyperdrive | Worker-to-Postgres connection pooling | Bind as `HYPERDRIVE`; use actual provisioned ID |
| Private Cloudflare R2 bucket | Authoritative uploaded CSV originals | Bind as `ORIGINALS`; no public URL or public bucket access |
| Cloudflare Worker | Public read API and administrator import | Deploy this repository's `data-api/src/worker.js` |
| Administrator secret and import signing secret | Temporary V1 authorization and preview integrity | Independent cryptographically random secrets |

The existing public library R2 bucket must **not** be used for private scientific
uploads. No new resources have been provisioned by this code. There are no fake
service IDs or connection strings to replace in source. The configuration helper
requires actual values after resources exist.

## Local frontend and synthetic demonstration

```sh
npm ci
npm run demo:data       # optional: regenerate deterministic synthetic files
npm run dev            # bundles browser assets, then serves Eleventy
npm test
npm run test:browser
npm run check:api       # build-only dry run; does not publish
```

With no `ASCEND_DATA_API_BASE`, `/data/` clearly shows synthetic examples and
`/data/upload/` is browser-only preview. MapLibre and a coarse Natural Earth
basemap are bundled locally. No tile credentials, third-party requests or paid
map service are required. A detailed basemap can be added later after choosing a
provider, license and attribution policy. There is no deck.gl dependency yet.

## Database initialization

Create a database on the chosen host, a migration owner, and a separate runtime
role. Require verified TLS for remote connections. Store the connection string
in a secret manager or a private shell environment variable `DATABASE_URL`.
Do not put it in command arguments, repository files or screenshots. If your
provider requires a root certificate, configure trust through the driver's TLS
options / supported connection settings; do not disable certificate verification.

```sh
node scripts/data-explorer/migrate.mjs
```

The migration runner serializes migrations with a PostgreSQL advisory lock and
records applied versions. The migration includes `CREATE EXTENSION postgis`; on
managed services an administrator may need to enable PostGIS first. Do not run
schema creation with the Worker runtime role. Choose the actual runtime role in
these grants (the SQL variable is supplied through your database administration
tool, not a real role name embedded here):

```sql
GRANT USAGE ON SCHEMA public TO :runtime_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO :runtime_role;
GRANT INSERT ON data_files, observations, observation_values, observation_qc TO :runtime_role;
GRANT UPDATE (import_status) ON data_files TO :runtime_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO :runtime_role;
```

The runtime role cannot create metadata, approve missions, change visibility,
delete originals or run DDL. Review the grants with your host's SQL tooling.
V1's publication boundary is enforced in every public repository query; use
separate reader/writer connections or database RLS as defense in depth in V2.

Populate organizations, teams, sites, platforms, sensors, configurations, missions
and mission-platform assignments before uploading. See [SCHEMA.md](SCHEMA.md).
Import defaults to existing administrator-created destinations. No contributor
account or public metadata-write endpoint exists.

## Hyperdrive, R2 and Worker

In Cloudflare, create a Hyperdrive configuration for the database runtime role.
Disable Hyperdrive query caching for V1: visibility revocation must take effect
immediately, and imports have read-after-write semantics. Configure the database
connection through the dashboard to avoid exposing its URL in shell history.
Create the private R2 bucket and enable an appropriate retention/backup policy.

Set the nonsecret shell variables below to actual values you provisioned:

- `ASCEND_WORKER_NAME`: chosen Cloudflare Worker name.
- `ASCEND_HYPERDRIVE_ID`: actual Hyperdrive configuration ID.
- `ASCEND_ORIGINALS_BUCKET`: actual private bucket name.
- `ASCEND_ALLOWED_ORIGIN`: exact website HTTPS origin, with no trailing slash.

Then run:

```sh
node scripts/data-explorer/configure.mjs
npx wrangler secret put ADMIN_TOKEN --config data-api/wrangler.local.jsonc
npx wrangler secret put IMPORT_SIGNING_SECRET --config data-api/wrangler.local.jsonc
npx wrangler deploy --dry-run --config data-api/wrangler.local.jsonc
npx wrangler deploy --config data-api/wrangler.local.jsonc
```

Both secret commands prompt securely; use independently generated secrets with
at least 32 random bytes each. The generated configuration is ignored by Git.
Add Cloudflare rate limits for the administrator routes and API before broad
production use. Put Cloudflare Access in front of administrator routes if desired;
it complements rather than replaces the current bearer-secret check. Never expose
the token in an Eleventy build variable or a public JSON file. Do not log requests
or bodies containing CSV data, credentials, or authorization headers.

For local Worker development, supply `ADMIN_TOKEN`, `IMPORT_SIGNING_SECRET` and
`ALLOWED_ORIGIN=http://localhost:8080` in ignored `data-api/.dev.vars`. Set the
private environment variable
`CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE` to your local database
connection. Use the configured binding file:

```sh
npx wrangler dev --config data-api/wrangler.local.jsonc
```

Wrangler emulates the R2 binding locally; do not enable remote R2 for development.
Without bindings, `npm run dev:api` provides a health response and correctly
returns 503 for data routes. It is not a simulated production database.

## Connect the website

Set `ASCEND_DATA_API_BASE` to the deployed Worker's **actual HTTPS origin** in the
existing Pages project's build environment, then rebuild the site. This is a
public URL, never a secret. The client app appends `/api/...` paths. For local
integration, set it to Wrangler's printed localhost origin before `npm run dev`.
Set `ALLOWED_ORIGIN` on the Worker to the exact frontend origin in each environment.
No synthetic fallback occurs after selecting a real API.

A custom domain is optional for V1: a Worker-issued URL and explicit CORS work.
A future same-origin API route requires a hostname you control; do not assume a
Worker route can be attached to `pages.dev`. Keep existing Pages build command
`npm run build`, output `_site`, Node 22+, and Git integration.

The upload interface keeps the administrator token in memory. Server preview
validates the file but does not archive it. Final confirmation archives exact bytes
then commits the complete database import transaction. Warning acknowledgement is
mandatory. Preview tokens expire after 15 minutes. Repeated confirmation is
idempotent for a mission/checksum pair. No upload publishes a mission by itself.

## Publication review

Review source provenance, QC, license, site privacy and mission metadata using a
database administrator account. Publish only the intended mission:

```sql
-- Bind the actual mission UUID through your SQL client's parameter interface.
UPDATE missions SET visibility = 'public', publication_status = 'approved'
WHERE id = :mission_id;
```

Withdraw by setting visibility to `private`. API responses use `Cache-Control:
no-store`; keep Hyperdrive caching disabled. The database role used by the Worker
cannot execute this publication change. Original-file download is intentionally
not public in V1; normalized approved observations are downloadable. An authenticated
archive-retrieval workflow should be added before contributor rollout.

## Backup, failure recovery and observability

Enable provider PITR and automated snapshots. Keep encrypted independent backups
and periodically restore into a separate PostGIS instance. R2 is authoritative:
retain original objects independently, restrict deletion permissions, and configure
retention/lifecycle policies that do not expire scientific originals. R2 storage
alone is not a backup; maintain an independent copy and checksum inventory.

An import stores R2 first, then uses one PostgreSQL transaction. If the transaction
fails, no partial observations are committed, but an orphan R2 object may remain.
Do not delete it automatically. Reconcile `originals/<mission UUID>/<sha256>.csv`
objects with `data_files.r2_key`; verify object SHA-256 and retry the same CSV to
recover. Database failures return a generic error without credentials or raw data.
Do not reparse historical originals with a new parser silently: retain versions.

Restore PostgreSQL and original files together; check each file's SHA-256 and
observation count, migrate Hyperdrive to the restored database, and test privacy
before resuming traffic. Keep an operational log of imports, publication changes,
backups and restoration drills. Long-running import jobs and detailed audit-event
storage are V2 work; V1 records upload metadata and parser provenance only.

## Verification boundaries and remaining work

Local tests cover shared parsing/conversion/QC, authorization, signed confirmation,
R2-before-database behavior, exports, frontend interaction/accessibility and existing
site regression checks. `npm run test:integration` requires an empty disposable PostGIS
database, `ASCEND_DISPOSABLE_DATABASE=1`, and either a private `TEST_DATABASE_URL`
or standard `PGHOST`, `PGPORT`, `PGUSER`, `PGDATABASE` and authentication settings; it checks real migration/import/spatial queries.
GitHub's data integration job runs this against an isolated PostGIS service.
Cloud resources must still receive an end-to-end smoke test after provisioning.
No local/mock test demonstrates a deployed Hyperdrive or R2 connection.

V2: background uploads/exports, spatial/temporal aggregates and vector tiles,
multiple team selection, cross-mission comparison styling, administrator metadata
editing, role-based identities, authenticated original retrieval, calibrated QC,
versioned reprocessing, deck.gl altitude rendering, Skew-T/log-P, KML/NetCDF,
GeoServer/OGC, NASA adapters, and real-time telemetry.

## Reference documentation

- [Cloudflare Hyperdrive and PostgreSQL](https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/)
- [Hyperdrive setup](https://developers.cloudflare.com/hyperdrive/get-started/)
- [R2 Worker API and conditional writes](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)
- [MapLibre examples](https://maplibre.org/maplibre-gl-js/docs/examples/)

## Dependency audit at implementation

The audit reports existing Eleventy development-tool dependencies (`braces` and
`sprintf-js`, with transitive entries). Its suggested automatic fix downgrades
Eleventy to 0.6.0; that incompatible change was not applied. These packages do not
run in the scientific Worker or browser bundles. Track upstream compatible fixes
separately. Re-run `npm audit` as advisory data changes.
