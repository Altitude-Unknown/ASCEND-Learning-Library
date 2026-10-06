import { PARAMETERS, exportCSV, exportGeoJSON } from "./core.js";
import { parseFilters, matches } from "./filters.js";
import { createMap, PALETTE } from "./map.js";
import { chart } from "./charts.js";
const $ = (id) => document.getElementById(id),
  root = $("data-explorer"),
  api = root.dataset.api,
  form = $("explorer-filters");
let demo,
  parameters = PARAMETERS,
  missions = [],
  rows = [],
  nextCursor = null,
  tablePage = 0,
  generation = 0,
  controller,
  appliedQuery = null;
const current = () =>
  parameters.find((p) => p.id === $("parameter").value) || parameters[0];
function option(select, value, label) {
  const o = document.createElement("option");
  o.value = value;
  o.textContent = label;
  select.append(o);
}
const map = createMap(
  $("mission-map"),
  inspect,
  () => {
    if (demo || api) load();
  },
  selectMission,
);
function filterParams(includeExtent = true) {
  const p = new URLSearchParams();
  for (const [k, v] of new FormData(form)) if (v) p.set(k, v);
  for (const k of ["from", "to"])
    if (p.has(k))
      p.set(k, p.get(k) + (k === "from" ? "T00:00:00.000Z" : "T23:59:59.999Z"));
  if (includeExtent && map.extent()) p.set("bbox", map.extent().join(","));
  p.set("limit", "1000");
  return p;
}
async function get(path, signal) {
  const response = await fetch(api + path, { signal });
  if (!response.ok) {
    let message = "Data service unavailable.";
    try {
      message = (await response.json()).error || message;
    } catch {}
    throw new Error(message);
  }
  return response.json();
}
async function load(append = false) {
  const epoch = ++generation;
  controller?.abort();
  controller = new AbortController();
  $("explorer-status").textContent = "Loading observations…";
  $("load-more").disabled = true;
  $("download-csv").disabled = true;
  $("download-geojson").disabled = true;
  try {
    const params = filterParams();
    const queryKey = params.toString();
    if (append && queryKey !== appliedQuery) append = false;
    if (append && nextCursor) params.set("cursor", nextCursor);
    const filters = parseFilters(params);
    let result, matchingMissions;
    if (demo) {
      const filtered = demo.observations.filter((r) => matches(r, filters));
      const ids = new Set(filtered.map((r) => r.mission_id));
      matchingMissions = missions.filter((m) => ids.has(m.id));
      result = {
        data: filtered.slice(0, 1000),
        nextCursor: filtered.length > 1000 ? filtered[999].id : null,
      };
    } else {
      const missionParams = new URLSearchParams(params);
      missionParams.delete("cursor");
      missionParams.set("limit", "100");
      const [observations, found] = await Promise.all([
        get("/api/observations?" + params, controller.signal),
        get("/api/missions?" + missionParams, controller.signal),
      ]);
      result = observations;
      matchingMissions = found.data;
      $("map-limit-notice").textContent = found.nextCursor
        ? "Showing the first 100 matching mission markers. Narrow filters to see other missions."
        : "";
    }
    if (epoch !== generation) return;
    appliedQuery = queryKey;
    map.missions(matchingMissions);
    rows = append ? [...rows, ...result.data] : result.data;
    nextCursor = result.nextCursor;
    tablePage = 0;
    render();
    $("explorer-status").textContent =
      `${rows.length} observations displayed${nextCursor ? " — partial result; load another page to continue" : ""}. ${rows.filter((r) => r.qc.length).length} rows have QC flags. Filters apply to the current map extent.`;
    $("load-more").disabled = !nextCursor || rows.length >= 5000;
    $("load-more").textContent =
      rows.length >= 5000 && nextCursor
        ? "5,000 point display limit — narrow filters"
        : "Load next 1,000 observations";
  } catch (e) {
    if (e.name === "AbortError") return;
    map.missions([]);
    rows = [];
    nextCursor = null;
    render();
    $("explorer-status").textContent = e.message;
  }
}
function render() {
  const p = current();
  map.draw(rows, p.id);
  const values = rows.map((r) => r.values[p.id]).filter((n) => n != null);
  $("legend").replaceChildren();
  const text = document.createElement("span");
  text.textContent = values.length
    ? `${p.label} (${p.unit}): ${Math.min(...values).toFixed(2)} to ${Math.max(...values).toFixed(2)}. `
    : "No measurements in this selection. ";
  $("legend").append(text);
  PALETTE.forEach((color, i) => {
    const swatch = document.createElement("span");
    swatch.className = "legend-swatch";
    swatch.style.background = color;
    swatch.setAttribute("aria-hidden", "true");
    $("legend").append(swatch);
  });
  const note = document.createElement("span");
  note.textContent =
    " Low → high; gray = missing. Numeric values appear in the table.";
  $("legend").append(note);
  chart($("time-chart"), rows, p);
  chart($("profile-chart"), rows, p, true);
  renderTable();
  $("point-detail").textContent =
    "Select a map point or an Inspect button to see its metadata and QC flags.";
  $("download-csv").disabled = !rows.length;
  $("download-geojson").disabled = !rows.length;
}
function renderTable() {
  const body = $("observation-rows");
  body.replaceChildren();
  const p = current();
  for (const [i, r] of rows
    .slice(tablePage * 20, tablePage * 20 + 20)
    .entries()) {
    const tr = document.createElement("tr");
    const val = r.values[p.id];
    for (const s of [
      r.timestamp_utc || "Missing time",
      r.mission,
      r.altitude_msl_m == null ? "Missing" : r.altitude_msl_m.toFixed(1),
      val == null ? "Missing" : val.toFixed(2),
      r.qc.length ? "Flagged (" + r.qc.length + ")" : "No screening flags",
    ]) {
      const td = document.createElement("td");
      td.textContent = s;
      tr.append(td);
    }
    const td = document.createElement("td"),
      button = document.createElement("button");
    button.type = "button";
    button.textContent = "Inspect";
    button.className = "button outline";
    button.setAttribute(
      "aria-label",
      `Inspect observation ${tablePage * 20 + i + 1}`,
    );
    button.addEventListener("click", () => inspect(tablePage * 20 + i));
    td.append(button);
    tr.append(td);
    body.append(tr);
  }
  $("value-column").textContent = `${p.label} (${p.unit})`;
  $("table-page").textContent =
    `Page ${tablePage + 1} of ${Math.max(1, Math.ceil(rows.length / 20))}`;
  $("table-prev").disabled = tablePage === 0;
  $("table-next").disabled = (tablePage + 1) * 20 >= rows.length;
}
function inspect(index) {
  const r = rows[index];
  if (!r) return;
  const p = current();
  const dl = document.createElement("dl");
  for (const [key, value] of Object.entries({
    Mission: r.mission,
    Institution: r.institution,
    Team: r.team,
    Platform: r.platform,
    Sensor: r.sensor,
    "UTC timestamp": r.timestamp_utc,
    Latitude: r.latitude,
    Longitude: r.longitude,
    "Altitude MSL (m)": r.altitude_msl_m,
    "Altitude AGL (m)": r.altitude_agl_m,
    [`${p.label} (${p.unit})`]: r.values[p.id],
    "QC status": r.qc.length
      ? r.qc.map((q) => q.code + ": " + q.detail).join("; ")
      : "No V1 screening flags; not scientific approval",
    "Source file": r.source_file_id,
    "Source row": r.source_row,
    "Source SHA-256": r.source_sha256,
    "Parser version": r.parser_version,
    License: r.data_license,
    Synthetic: r.synthetic ? "Yes — demonstration only" : "No",
  })) {
    const dt = document.createElement("dt"),
      dd = document.createElement("dd");
    dt.textContent = key;
    dd.textContent = value ?? "Missing";
    dl.append(dt, dd);
  }
  $("point-detail").replaceChildren(dl);
}
function selectMission(id) {
  $("mission").value = id;
  const m = missions.find((m) => m.id === id);
  if (m) map.focus(m);
  load();
}
function download(format) {
  const metadata = {
    synthetic: !!demo,
    filters: Object.fromEntries(new URLSearchParams(appliedQuery)),
    count: rows.length,
    partial: !!nextCursor,
    nextCursor,
    generatedAt: new Date().toISOString(),
    scope:
      "Displayed, filtered observations only; no hidden full-dataset export",
  };
  const content =
    format === "csv"
      ? exportCSV(rows)
      : JSON.stringify(exportGeoJSON(rows, metadata), null, 2);
  save(
    content,
    `ascend-${demo ? "SYNTHETIC-" : ""}observations.${format}`,
    format === "csv" ? "text/csv" : "application/geo+json",
  );
  if (format === "csv")
    save(
      JSON.stringify(metadata, null, 2),
      "ascend-export-metadata.json",
      "application/json",
    );
}
function save(content, name, type) {
  const url = URL.createObjectURL(new Blob([content], { type })),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
form.addEventListener("submit", (e) => {
  e.preventDefault();
  load();
});
$("mission").addEventListener("change", () =>
  selectMission($("mission").value),
);
$("parameter").addEventListener("change", () => load());
$("reset-filters").addEventListener("click", () => {
  form.reset();
  map.reset();
  load();
});
$("load-more").addEventListener("click", () => load(true));
$("table-prev").addEventListener("click", () => {
  tablePage--;
  renderTable();
});
$("table-next").addEventListener("click", () => {
  tablePage++;
  renderTable();
});
$("download-csv").addEventListener("click", () => download("csv"));
$("download-geojson").addEventListener("click", () => download("geojson"));
async function start() {
  try {
    let teams;
    if (!api) {
      const response = await fetch("/assets/data/demo/dataset.json");
      if (!response.ok)
        throw new Error("Synthetic examples could not be loaded.");
      demo = await response.json();
      missions = demo.missions;
      teams = demo.teams;
    } else {
      const [teamResult, missionResult, parameterResult, platformResult] =
        await Promise.all([
          get("/api/teams"),
          get("/api/missions?limit=100"),
          get("/api/parameters"),
          get("/api/platforms"),
        ]);
      parameters = parameterResult.data;
      $("parameter").replaceChildren();
      parameters.forEach((p) => option($("parameter"), p.id, p.label));
      $("parameter").value = parameters.some((p) => p.id === "pm25_ugm3")
        ? "pm25_ugm3"
        : parameters[0]?.id;
      $("platform").replaceChildren();
      option($("platform"), "", "All platforms");
      platformResult.data.forEach((p) => option($("platform"), p.id, p.label));
      teams = teamResult.data;
      missions = missionResult.data;
      let cursor = missionResult.nextCursor;
      while (cursor && missions.length < 1000) {
        const page = await get("/api/missions?limit=100&cursor=" + cursor);
        missions.push(...page.data);
        cursor = page.nextCursor;
      }
      if (cursor || teamResult.truncated)
        $("catalog-notice").textContent =
          "Directory display is limited to 1,000 entries; use the API for additional mission pages.";
    }
    teams.forEach((t) => option($("team"), t.id, t.name));
    const institutions = new Map(
      teams.map((t) => [t.organization_id, t.institution]),
    );
    institutions.forEach((name, id) => option($("institution"), id, name));
    missions.forEach((m) => option($("mission"), m.id, m.name));
    [...new Set(missions.map((m) => String(m.mission_date).slice(0, 4)))]
      .sort()
      .reverse()
      .forEach((y) => option($("year-options"), y, y));
    map.missions(missions);
    await load();
  } catch (e) {
    $("explorer-status").textContent = e.message;
  }
}
start();
