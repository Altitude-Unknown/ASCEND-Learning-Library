import {
  FIELDS,
  UNIT_OPTIONS,
  parseCSV,
  detectMapping,
  normalizeCSV,
  checksum,
  MAX_BYTES,
} from "./core.js";
import { createMap } from "./map.js";
const $ = (id) => document.getElementById(id),
  api = $("data-upload").dataset.api;
let file,
  parsed,
  normalized,
  contexts = [],
  ticket = null,
  map,
  epoch = 0,
  previewEpoch = 0;
function invalidate() {
  epoch++;
  ticket = null;
  normalized = null;
  $("confirm-import").disabled = true;
  $("server-preview").disabled = true;
  $("qc-ack").checked = false;
  $("confirm-ack").checked = false;
}
function status(text) {
  $("upload-status").textContent = text;
}
function readMapping() {
  const mapping = {},
    units = {};
  for (const f of FIELDS) {
    const source = $("map-" + f)?.value;
    if (source) {
      mapping[f] = source;
      if (UNIT_OPTIONS[f].length) units[f] = $("unit-" + f).value;
    }
  }
  return { mapping, units };
}
function metadata() {
  const ctx = contexts[Number($("import-context").value)];
  if (!ctx) throw new Error("Select an import destination.");
  return {
    mission_id: ctx.mission_id,
    sensor_configuration_id: ctx.sensor_configuration_id,
    ...readMapping(),
  };
}
function showSummary(summary, rows) {
  $("preview-section").hidden = false;
  const text = document.createElement("p");
  text.textContent = `${summary.rowCount} rows · ${summary.positionCount} valid positions · ${summary.flaggedRows} rows with QC flags. All rows are retained.`;
  const stats = document.createElement("dl");
  for (const [name, s] of Object.entries(summary.statistics)) {
    if (!s.count) continue;
    const dt = document.createElement("dt"),
      dd = document.createElement("dd");
    dt.textContent = name;
    dd.textContent = `${s.count} values; min ${s.min.toFixed(2)}, max ${s.max.toFixed(2)}, mean ${s.mean.toFixed(2)}`;
    stats.append(dt, dd);
  }
  $("upload-summary").replaceChildren(text, stats);
  const title = document.createElement("p");
  title.textContent = summary.flaggedRows
    ? "QC flags — review before confirming:"
    : "No V1 screening flags. This does not establish scientific validity.";
  const list = document.createElement("ul");
  list.className = "data-warning-list";
  let count = 0;
  for (const r of rows)
    for (const q of r.qc) {
      if (count++ >= 200) continue;
      const li = document.createElement("li");
      li.textContent = `Source row ${r.source_row}: ${q.code} — ${q.detail}`;
      list.append(li);
    }
  const note = document.createElement("p");
  note.textContent = `Flag totals: ${JSON.stringify(summary.flags)}. At most 200 flag details shown; all flags are retained on import.`;
  $("upload-warnings").replaceChildren(title, list, note);
  map ||= createMap($("upload-map"));
  map.draw(rows, "pm25_ugm3");
  map.fit(rows);
}
$("csv-file").addEventListener("change", async () => {
  invalidate();
  const version = epoch;
  file = $("csv-file").files[0];
  parsed = null;
  $("mapping-section").hidden = true;
  $("preview-section").hidden = true;
  if (!file) return;
  try {
    if (file.size > MAX_BYTES) throw new Error("CSV exceeds 2 MiB.");
    const text = new TextDecoder("utf-8", { fatal: true }).decode(
      await file.arrayBuffer(),
    );
    if (version !== epoch) return;
    parsed = parseCSV(text);
    const detected = detectMapping(parsed.headers);
    $("column-mapping").replaceChildren();
    for (const field of FIELDS) {
      const group = document.createElement("div");
      group.className = "mapping-field";
      const label = document.createElement("label");
      label.textContent = field;
      const select = document.createElement("select");
      select.id = "map-" + field;
      for (const h of ["", ...parsed.headers]) {
        const o = document.createElement("option");
        o.value = h;
        o.textContent = h || "Not mapped";
        select.append(o);
      }
      select.value = detected[field] || "";
      label.append(select);
      group.append(label);
      if (UNIT_OPTIONS[field].length) {
        const ul = document.createElement("label");
        ul.textContent = "Source units for " + field;
        const us = document.createElement("select");
        us.id = "unit-" + field;
        for (const u of ["", ...UNIT_OPTIONS[field]]) {
          const o = document.createElement("option");
          o.value = u;
          o.textContent = u || "Confirm units…";
          us.append(o);
        }
        if (detected[field] === field) us.value = UNIT_OPTIONS[field][0];
        ul.append(us);
        group.append(ul);
      }
      $("column-mapping").append(group);
    }
    $("mapping-section").hidden = false;
    status(
      `Detected ${parsed.headers.length} columns and ${parsed.rows.length} rows. Review mappings and units.`,
    );
  } catch (e) {
    status(e.message);
  }
});
$("column-mapping").addEventListener("change", () => {
  invalidate();
  status("Mapping changed. Validate again before importing.");
});
$("validate-csv").addEventListener("click", () => {
  invalidate();
  try {
    const { mapping, units } = readMapping();
    normalized = normalizeCSV(parsed, mapping, units);
    showSummary(
      normalized.summary,
      normalized.rows.map((r) => ({ ...r, source_file_id: "local-preview" })),
    );
    $("server-preview").disabled = !api || !$("import-context").value;
    status("Local preview ready. Review QC flags and the track.");
  } catch (e) {
    status(e.message);
  }
});
async function request(path, options = {}) {
  const token = $("admin-token").value;
  if (!token) throw new Error("Enter an administrator token.");
  const r = await fetch(api + path, {
    ...options,
    headers: { Authorization: "Bearer " + token },
  });
  const body = await r.json();
  if (!r.ok) throw new Error(body.error || "Server request failed.");
  return body;
}
$("connect-admin").addEventListener("click", async () => {
  try {
    const body = await request("/api/admin/missions");
    contexts = body.data;
    const select = $("import-context");
    select.replaceChildren();
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = "Choose a configured destination";
    select.append(blank);
    contexts.forEach((c, i) => {
      const o = document.createElement("option");
      o.value = i;
      o.textContent = `${c.mission} / ${c.platform} / ${c.sensor}`;
      select.append(o);
    });
    ticket = null;
    $("confirm-import").disabled = true;
    status(
      contexts.length
        ? "Choose the mission and sensor configuration."
        : "No import destinations exist. Create mission metadata using the setup guide.",
    );
  } catch (e) {
    status(e.message);
  }
});
$("admin-token").addEventListener("input", () => {
  ticket = null;
  epoch++;
  $("confirm-import").disabled = true;
});
$("import-context").addEventListener("change", () => {
  ticket = null;
  epoch++;
  $("confirm-import").disabled = true;
  $("server-preview").disabled = !normalized || !$("import-context").value;
});
function formData() {
  if (!file) throw new Error("Select a file.");
  const form = new FormData();
  form.set("file", file);
  form.set("metadata", JSON.stringify(metadata()));
  return form;
}
$("server-preview").addEventListener("click", async () => {
  const version = ++epoch;
  ticket = null;
  $("confirm-import").disabled = true;
  $("server-preview").disabled = true;
  try {
    status("Validating with the server…");
    const result = await request("/api/admin/imports/preview", {
      method: "POST",
      body: formData(),
    });
    if (version !== epoch) return;
    ticket = result.ticket;
    previewEpoch = epoch;
    showSummary(
      result.summary,
      normalized.rows.map((r) => ({ ...r, source_file_id: "local-preview" })),
    );
    status(
      `Server preview verified SHA-256 ${result.sha256}. Review and confirm within 15 minutes.`,
    );
    updateConfirm();
  } catch (e) {
    status(e.message);
  } finally {
    $("server-preview").disabled = !normalized;
  }
});
function updateConfirm() {
  $("confirm-import").disabled = !(
    ticket &&
    previewEpoch === epoch &&
    $("qc-ack").checked &&
    $("confirm-ack").checked
  );
}
$("qc-ack").addEventListener("change", updateConfirm);
$("confirm-ack").addEventListener("change", updateConfirm);
$("confirm-import").addEventListener("click", async () => {
  $("confirm-import").disabled = true;
  try {
    const form = formData();
    form.set("ticket", ticket);
    form.set("confirmed", String($("confirm-ack").checked));
    form.set("acknowledgeQC", String($("qc-ack").checked));
    status("Archiving original and importing…");
    const result = await request("/api/admin/imports/confirm", {
      method: "POST",
      body: form,
    });
    ticket = null;
    status(
      `${result.duplicate ? "Previously imported file; no duplicate observations created." : "Import complete."} File ID: ${result.id}. ${result.message}`,
    );
  } catch (e) {
    status(e.message);
    updateConfirm();
  }
});
