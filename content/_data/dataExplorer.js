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
  return { apiBase, demo: !apiBase };
}
