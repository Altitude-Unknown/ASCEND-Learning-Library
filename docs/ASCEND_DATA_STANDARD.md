# ASCEND standard CSV v1

Use UTF-8, a single header row, comma separators, and RFC-style double quotes for
fields containing commas/newlines. Empty fields mean missing, never zero. Supply
only relevant measurements. Download `/assets/data/ascend-template.csv` from the
website; header-only templates intentionally contain no fictional measurements.
Synthetic practice CSVs live under `/assets/data/demo/` and are explicitly labeled.

| Field | Meaning / preferred unit |
| --- | --- |
| project | ASCEND (or ASCEND DEMO / SYNTHETIC for examples) |
| team_id | Database team UUID |
| mission_id | Database mission UUID |
| platform | Registered platform name |
| timestamp_utc | ISO 8601 with timezone, e.g. `2026-06-15T12:00:00Z` |
| latitude, longitude | WGS84 decimal degrees, −90…90 / −180…180 |
| altitude_msl_m | Meters above mean sea level; identify the vertical datum in mission notes |
| altitude_agl_m | Meters above ground; never substitute MSL for AGL |
| pm1_ugm3, pm25_ugm3, pm10_ugm3 | Mass concentration, µg/m³ |
| temperature_c | Degrees Celsius |
| relative_humidity_pct | Percent, 0…100 |
| pressure_hpa | Absolute pressure, hPa |
| wind_speed_ms | m/s |
| wind_direction_deg | Degrees clockwise from true north; record sensor convention in configuration |
| sensor | Registered sensor/package name |
| qc_flag | Source QC text, preserved as a source_qc annotation |

## Mapping and units

The importer suggests canonical headers and common aliases. The operator must
confirm units, especially ambiguous headers such as `altitude`, `pressure`, and
`temperature`. Mapped numeric fields require a unit selection. Supported input
conversions: feet to meters; mg/m³ to µg/m³; Fahrenheit/Kelvin to Celsius; humidity
fraction to percent; Pa/kPa to hPa; km/h/knots to m/s. Degrees are used for positions
and direction. Mixed units within a column are unsupported: separate files first.
No heuristic guesses silently convert values. Suspicious ranges prompt QC flags.

A timestamp mapping and one measurement mapping are required. Metadata comes
from the selected mission/platform/sensor configuration; differing file metadata
is flagged, not used to override the destination. Unknown columns remain in the
raw row and authoritative original. New supported parameters can be added to the
parameter registry and parser catalog without observation-table migrations.

## Validation and limitations

Structural errors (duplicate/empty headers, malformed CSV, inconsistent column
counts, unsupported encoding, invalid mappings or unconfirmed units) block import.
V1 limits: 2 MiB, 5,000 data rows, 100 columns. Empty physical lines are ignored; rows of comma-separated empty cells are retained;
`source_row` is the logical CSV record number, including the header as record 1,
not a physical line number when quoted multiline cells exist.

Missing/invalid timestamps and positions become null with flags. Every data row
is retained; original invalid strings remain in per-row raw JSON and the R2 file.
Non-finite or nonnumeric measurements become null with flags. Out-of-range finite
measurements remain unchanged with flags. Missing MSL altitude is flagged.
Duplicate timestamps within a file, backwards time, and >150 m/s GPS motion are
flagged. Duplicate timestamps across different files are not screened in V1;
multiple sensors may legitimately measure at the same instant.

Screening ranges: PM 0…10,000 µg/m³, temperature −100…70 °C, humidity 0…100%,
pressure 0.01…1,100 hPa, wind speed 0…150 m/s, direction 0…360°, altitude
−1,000…60,000 m. These broad thresholds are **not calibration, health guidance,
regulatory limits or scientific acceptance criteria**. Values outside them require
review rather than silent deletion. The server repeats all validation.

## Provenance and downloads

SHA-256 hashes cover exact original bytes (including encoding markers and line
endings). Confirmation binds the checksum, original filename, destination, column
mapping and units, and expires after 15 minutes. The parser version is recorded.
Same-file retries for a mission return the original import rather than duplicates.
To reprocess with a new parser, a future versioned reprocessing workflow is needed;
V1 does not overwrite historical imports.

Public CSV exports contain canonical values, source row/file/checksum/parser,
mission, institution, team, sensor, license, synthetic indicator and QC. Potential
spreadsheet formulas in textual metadata are apostrophe-prefixed on export only.
Original archives remain untouched. GeoJSON uses 2-D WGS84 coordinates; measured
MSL and AGL altitudes remain separate properties, avoiding incorrect ellipsoidal
height assumptions. Missing positions produce null geometry.
