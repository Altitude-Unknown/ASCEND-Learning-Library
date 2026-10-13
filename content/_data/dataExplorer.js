export default function () {
  const apiBase = (process.env.ASCEND_DATA_API_BASE || "").replace(/\/$/, "");
  if (apiBase) {
    const url = new URL(apiBase);
    if (
      (url.protocol !== "https:" &&
        !(
          url.protocol === "http:" &&
          ["localhost", "127.0.0.1"].includes(url.hostname)
        )) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== "/"
    )
      throw new Error(
        "ASCEND_DATA_API_BASE must be an HTTPS origin (HTTP localhost is allowed for development).",
      );
  }
  const clerkKey = process.env.ASCEND_CLERK_PUBLISHABLE_KEY || "";
  let clerkDomain = "";
  if (clerkKey) {
    if (!/^pk_(test|live)_[A-Za-z0-9_-]+$/.test(clerkKey)) throw new Error("Invalid Clerk publishable key.");
    clerkDomain = Buffer.from(clerkKey.split("_")[2], "base64").toString("utf8").replace(/\$$/, "");
    if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)+$/.test(clerkDomain)) throw new Error("Invalid Clerk frontend domain.");
  }
  return { apiBase, demo: !apiBase, clerkKey, clerkDomain };
}
