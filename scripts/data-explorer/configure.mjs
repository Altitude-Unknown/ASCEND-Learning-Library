import { writeFileSync } from "node:fs";
const required = [
  "ASCEND_WORKER_NAME",
  "ASCEND_HYPERDRIVE_ID",
  "ASCEND_ORIGINALS_BUCKET",
  "ASCEND_ALLOWED_ORIGIN",
];
for (const key of required)
  if (!process.env[key])
    throw new Error("Set " + key + " to the actual provisioned value.");
const origin = new URL(process.env.ASCEND_ALLOWED_ORIGIN);
if (
  origin.protocol !== "https:" ||
  origin.origin !== process.env.ASCEND_ALLOWED_ORIGIN
)
  throw new Error("Use the exact HTTPS website origin with no path.");
const config = {
  name: process.env.ASCEND_WORKER_NAME,
  main: "src/worker.js",
  compatibility_date: "2026-10-05",
  compatibility_flags: ["nodejs_compat"],
  workers_dev: true,
  vars: { ALLOWED_ORIGIN: origin.origin },
  hyperdrive: [{ binding: "HYPERDRIVE", id: process.env.ASCEND_HYPERDRIVE_ID }],
  r2_buckets: [
    { binding: "ORIGINALS", bucket_name: process.env.ASCEND_ORIGINALS_BUCKET },
  ],
};
writeFileSync(
  "data-api/wrangler.local.jsonc",
  JSON.stringify(config, null, 2) + "\n",
);
console.log("Wrote ignored local Worker configuration. No secrets included.");
