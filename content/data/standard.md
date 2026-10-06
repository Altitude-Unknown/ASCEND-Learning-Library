---
layout: layouts/article.njk
title: ASCEND Data Standard
description: Prepare atmospheric CSV files for the ASCEND Data Explorer.
permalink: /data/standard/
---

The preferred format is a UTF-8 CSV with one header row and ISO timestamps with
an explicit timezone. Empty cells mean missing data. Only populate relevant fields.

[Download the CSV template](/assets/data/ascend-template.csv) · [Open upload preview](/data/upload/) · [Explore data](/data/)

## Columns and units

| Columns | Preferred unit or format |
| --- | --- |
| project, team_id, mission_id | Project and registered identifiers |
| platform, sensor | Registered platform and sensor names |
| timestamp_utc | ISO 8601, for example 2026-06-15T12:00:00Z |
| latitude, longitude | WGS84 decimal degrees |
| altitude_msl_m, altitude_agl_m | Meters; MSL and AGL remain distinct |
| pm1_ugm3, pm25_ugm3, pm10_ugm3 | µg/m³ |
| temperature_c | °C |
| relative_humidity_pct | Percent |
| pressure_hpa | hPa |
| wind_speed_ms, wind_direction_deg | m/s and degrees clockwise from true north |
| qc_flag | Source quality-control notes |

## Review before import

The upload preview accepts alternative column names and lets you confirm units.
V1 accepts CSV files up to 2 MiB, 5,000 rows and 100 columns. Map a timestamp and at
least one measurement. Ambiguous unit choices must be confirmed; mixed units in a
single column are unsupported.

Invalid positions and timestamps, missing altitude, repeated timestamps, GPS
jumps and questionable measurements receive QC flags. Rows are retained; invalid
numeric values remain in the original file and raw record. Structural CSV errors
must be corrected before import. Screening does not establish scientific validity.

Administrator imports preserve original bytes, a SHA-256 checksum, upload time,
parser version, mappings, units and the connection to every observation. New data
requires separate mission approval before public access.

## Synthetic examples

These generated files are for practice only. They are not real ASCEND observations.

- [Fixed-wing UAS example](/assets/data/demo/fixed_wing_uas.csv)
- [High-altitude balloon example](/assets/data/demo/hab.csv)
- [Radiosonde profile example](/assets/data/demo/radiosonde.csv)

## Download scope

Explorer downloads include only the observations currently displayed, with their
metadata and QC flags. Load additional pages or narrow filters before exporting.
GeoJSON stores MSL and AGL altitude as separate properties. Public files are
subject to each mission’s data license.
