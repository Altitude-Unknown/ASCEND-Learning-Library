BEGIN;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TABLE IF NOT EXISTS ascend_schema_migrations (
  version integer PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL
);
CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations,
  name text NOT NULL
);
CREATE TABLE platform_types (
  id text PRIMARY KEY,
  label text NOT NULL
);
INSERT INTO platform_types VALUES ('fixed_wing_uas','Fixed-wing UAS'),('multirotor_uas','Multirotor UAS'),('hab','High-altitude balloon'),('radiosonde','Radiosonde'),('ground_station','Ground station');
CREATE TABLE sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams,
  name text NOT NULL,
  location geometry(Point,4326),
  description text
);
CREATE INDEX sites_location_idx ON sites USING gist(location);
CREATE TABLE platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams,
  type_id text NOT NULL REFERENCES platform_types,
  name text NOT NULL,
  UNIQUE(id,team_id)
);
CREATE TABLE sensors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams,
  name text NOT NULL,
  model text,
  serial_number text,
  UNIQUE(id,team_id)
);
CREATE TABLE sensor_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id uuid NOT NULL,
  team_id uuid NOT NULL,
  platform_id uuid NOT NULL,
  configuration jsonb NOT NULL DEFAULT '{}',
  valid_from timestamptz,
  valid_until timestamptz,
  FOREIGN KEY(sensor_id,team_id) REFERENCES sensors(id,team_id),
  FOREIGN KEY(platform_id,team_id) REFERENCES platforms(id,team_id),
  UNIQUE(id,platform_id,team_id),
  CHECK(valid_until IS NULL OR valid_from IS NULL OR valid_until>=valid_from)
);
CREATE TABLE missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams,
  site_id uuid REFERENCES sites,
  name text NOT NULL,
  mission_date date NOT NULL,
  description text NOT NULL DEFAULT '',
  principal_investigator text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  data_license text NOT NULL,
  visibility text NOT NULL DEFAULT 'private' CHECK(visibility IN ('private','public')),
  publication_status text NOT NULL DEFAULT 'pending' CHECK(publication_status IN ('pending','approved')),
  synthetic boolean NOT NULL DEFAULT false,
  UNIQUE(id,team_id)
);
CREATE INDEX missions_team_date_idx ON missions(team_id,mission_date);
CREATE TABLE mission_platforms (
  mission_id uuid NOT NULL,
  platform_id uuid NOT NULL,
  team_id uuid NOT NULL,
  PRIMARY KEY(mission_id,platform_id,team_id),
  FOREIGN KEY(mission_id,team_id) REFERENCES missions(id,team_id),
  FOREIGN KEY(platform_id,team_id) REFERENCES platforms(id,team_id)
);
CREATE TABLE parameters (
  id text PRIMARY KEY,
  label text NOT NULL,
  unit text NOT NULL
);
INSERT INTO parameters VALUES ('pm1_ugm3','PM1','µg/m³'),('pm25_ugm3','PM2.5','µg/m³'),('pm10_ugm3','PM10','µg/m³'),('temperature_c','Temperature','°C'),('relative_humidity_pct','Relative humidity','%'),('pressure_hpa','Pressure','hPa'),('wind_speed_ms','Wind speed','m/s'),('wind_direction_deg','Wind direction','°');
CREATE TABLE qc_flags (
  code text PRIMARY KEY,
  description text NOT NULL
);
INSERT INTO qc_flags VALUES ('invalid_timestamp','Missing or invalid ISO timestamp with timezone'),('invalid_position','Missing or invalid WGS84 position'),('invalid_numeric','Non-numeric measurement retained in raw row'),('missing_altitude','MSL altitude missing'),('range','Value outside V1 screening range; not scientific rejection'),('duplicate_timestamp','Timestamp repeats within the source file'),('gps_jump','Apparent ground speed exceeds 150 m/s'),('time_order','Timestamps are not increasing'),('source_qc','Original source includes a QC annotation'),('metadata_mismatch','Source metadata differs from the selected import context');
CREATE TABLE data_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid NOT NULL,
  platform_id uuid NOT NULL,
  sensor_configuration_id uuid NOT NULL,
  team_id uuid NOT NULL,
  original_filename text NOT NULL,
  r2_key text NOT NULL UNIQUE,
  sha256 text NOT NULL CHECK(sha256 ~ '^[a-f0-9]{64}$'),
  bytes integer NOT NULL CHECK(bytes>0),
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  parser_version text NOT NULL,
  mapping jsonb NOT NULL,
  units jsonb NOT NULL,
  import_status text NOT NULL CHECK(import_status IN ('importing','committed')),
  row_count integer NOT NULL,
  UNIQUE(mission_id,sha256),
  UNIQUE(id,mission_id,platform_id,sensor_configuration_id,team_id),
  FOREIGN KEY(mission_id,platform_id,team_id) REFERENCES mission_platforms,
  FOREIGN KEY(sensor_configuration_id,platform_id,team_id) REFERENCES sensor_configurations(id,platform_id,team_id)
);
CREATE TABLE observations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  mission_id uuid NOT NULL,
  platform_id uuid NOT NULL,
  sensor_configuration_id uuid NOT NULL,
  team_id uuid NOT NULL,
  source_file_id uuid NOT NULL,
  source_row integer NOT NULL CHECK(source_row>=2),
  timestamp_utc timestamptz,
  position geometry(Point,4326),
  altitude_msl_m double precision,
  altitude_agl_m double precision,
  raw_values jsonb NOT NULL,
  UNIQUE(source_file_id,source_row),
  FOREIGN KEY(source_file_id,mission_id,platform_id,sensor_configuration_id,team_id) REFERENCES data_files(id,mission_id,platform_id,sensor_configuration_id,team_id),
  CHECK(position IS NULL OR (ST_X(position) BETWEEN -180 AND 180 AND ST_Y(position) BETWEEN -90 AND 90))
);
CREATE INDEX observations_position_idx ON observations USING gist(position);
CREATE INDEX observations_geography_idx ON observations USING gist((position::geography));
CREATE INDEX observations_mission_time_idx ON observations(mission_id,timestamp_utc,id);
CREATE INDEX observations_team_time_idx ON observations(team_id,timestamp_utc,id);
CREATE INDEX observations_platform_time_idx ON observations(platform_id,timestamp_utc,id);
CREATE INDEX observations_time_idx ON observations(timestamp_utc,id);
CREATE INDEX observations_altitude_idx ON observations(altitude_msl_m);
CREATE TABLE observation_values (
  observation_id bigint NOT NULL REFERENCES observations ON DELETE CASCADE,
  parameter_id text NOT NULL REFERENCES parameters,
  value double precision NOT NULL,
  PRIMARY KEY(observation_id,parameter_id)
);
CREATE INDEX observation_values_parameter_idx ON observation_values(parameter_id,observation_id);
CREATE TABLE observation_qc (
  observation_id bigint NOT NULL REFERENCES observations ON DELETE CASCADE,
  flag_code text NOT NULL REFERENCES qc_flags,
  detail text NOT NULL,
  PRIMARY KEY(observation_id,flag_code,detail)
);
INSERT INTO ascend_schema_migrations(version) VALUES (1);
COMMIT;
