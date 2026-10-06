const NS = "http://www.w3.org/2000/svg";
function node(name, attrs = {}, text) {
  const n = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (text !== undefined) n.textContent = text;
  return n;
}
export function chart(container, rows, parameter, profile = false) {
  container.replaceChildren();
  const points = rows
    .filter(
      (r) =>
        r.values[parameter.id] != null &&
        (profile ? r.altitude_msl_m != null : r.timestamp_utc),
    )
    .map((r) => ({
      x: profile ? r.values[parameter.id] : Date.parse(r.timestamp_utc),
      y: profile ? r.altitude_msl_m : r.values[parameter.id],
    }))
    .sort((a, b) => a.x - b.x);
  if (!points.length) {
    container.textContent = "No matching measurements for this plot.";
    return;
  }
  const xs = points.map((p) => p.x),
    ys = points.map((p) => p.y),
    xmin = Math.min(...xs),
    xmax = Math.max(...xs),
    ymin = Math.min(...ys),
    ymax = Math.max(...ys);
  const sx = (x) => 70 + ((x - xmin) / (xmax - xmin || 1)) * 570,
    sy = (y) => 240 - ((y - ymin) / (ymax - ymin || 1)) * 200;
  const svg = node("svg", {
    viewBox: "0 0 700 310",
    role: "img",
    "aria-label": `${parameter.label} ${profile ? "versus MSL altitude" : "versus UTC time"}. ${points.length} points; measurements and QC are available in the observation table.`,
  });
  svg.append(
    node("path", { d: "M70 30 V240 H650", fill: "none", stroke: "#52666b" }),
  );
  for (let i = 0; i <= 4; i++) {
    const y = ymin + ((ymax - ymin) * i) / 4;
    svg.append(
      node(
        "text",
        {
          x: 62,
          y: sy(y) + 4,
          "text-anchor": "end",
          "font-size": 12,
          fill: "#17343d",
        },
        y.toFixed(1),
      ),
    );
  }
  const label = (x) =>
    profile
      ? x.toFixed(1)
      : new Date(x).toISOString().slice(5, 19).replace("T", " ");
  svg.append(
    node(
      "text",
      { x: 70, y: 260, "font-size": 12, fill: "#17343d" },
      label(xmin),
    ),
    node(
      "text",
      {
        x: 640,
        y: 260,
        "text-anchor": "end",
        "font-size": 12,
        fill: "#17343d",
      },
      label(xmax),
    ),
    node(
      "text",
      {
        x: 350,
        y: 292,
        "text-anchor": "middle",
        fill: "#17343d",
        "font-size": 14,
      },
      profile ? `${parameter.label} (${parameter.unit})` : "UTC date and time",
    ),
    node(
      "text",
      { x: 70, y: 18, fill: "#17343d", "font-size": 14 },
      profile ? "Altitude (m MSL)" : `${parameter.label} (${parameter.unit})`,
    ),
  );
  // Scatter points avoid inventing continuity across missing values, files or QC gaps.
  for (const p of points)
    svg.append(
      node("circle", { cx: sx(p.x), cy: sy(p.y), r: 2.8, fill: "#31688e" }),
    );
  container.append(svg);
}
