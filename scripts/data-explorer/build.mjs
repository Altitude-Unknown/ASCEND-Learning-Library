import { build } from "esbuild";
import { mkdirSync, copyFileSync, writeFileSync, readFileSync } from "node:fs";
import { feature } from "topojson-client";
const output = "public/assets/data/dist";
mkdirSync(output, { recursive: true });
await build({
  entryPoints: ["src/data/explorer.js", "src/data/upload.js"],
  outdir: output,
  bundle: true,
  format: "esm",
  minify: true,
  target: ["es2022"],
  legalComments: "eof",
});
copyFileSync(
  "node_modules/maplibre-gl/dist/maplibre-gl.css",
  output + "/maplibre.css",
);
for (const name of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"])
  copyFileSync("node_modules/maplibre-gl/dist/" + name, output + "/" + name);
const world = JSON.parse(
  readFileSync("node_modules/world-atlas/land-110m.json", "utf8"),
);
writeFileSync(
  output + "/land.geojson",
  JSON.stringify(feature(world, world.objects.land)),
);
writeFileSync(
  output + "/licenses.txt",
  [
    "MapLibre GL JS (BSD-3-Clause):",
    readFileSync("node_modules/maplibre-gl/LICENSE.txt", "utf8"),
    "\nNatural Earth / world-atlas: public domain map data. https://www.naturalearthdata.com/about/terms-of-use/",
    "\nPapaParse (MIT):",
    readFileSync("node_modules/papaparse/LICENSE", "utf8"),
  ].join("\n"),
);
