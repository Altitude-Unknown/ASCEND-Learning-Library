# Activate same-origin authentication

This is a Clerk Frontend API proxy, not a replacement authentication system.
See [the access audit](ACCESS-AUDIT-2026-10-16.md) for evidence and limitations.
Clerk documents proxying as advanced configuration. Keep the existing CNAME,
production publishable key, API issuer, and membership database.

## Ordered rollout

1. Validate with `npm run test:auth`, `npm run check:auth`, and the sign-in browser
   tests. Deploy `npx wrangler deploy --config auth-proxy/wrangler.jsonc`.
   The narrow route affects only `/__clerk/*`. The website continues to use its
   existing sign-in path until step 5.
2. In Clerk, select ASCEND's **production** instance and copy its secret from
   **API keys**. From the repository directory run:

   ```sh
   npx wrangler secret put CLERK_SECRET_KEY --config auth-proxy/wrangler.jsonc
   ```

   Enter it at the secret prompt. Do not put it in chat, a shell command argument,
   Pages build variables, source, or a committed `.env` file. Before it is set,
   the proxy intentionally returns a generic 503.
3. Verify the deployed proxy can reach Clerk. In Clerk's production
   **Configure → Developers → Domains** page, click **Configure** on the
   `ascendflight.org` row. Under **Frontend API**, choose **Set proxy config**.
   The form already supplies `https://ascendflight.org/`: enter only `__clerk`
   (two underscores, no leading slash) in the editable path and click **Use proxy**.
   The resulting URL is `https://ascendflight.org/__clerk`. Clerk must validate it
   successfully before switching the browser. The proxy must exist first.
4. Check `/__clerk/npm/@clerk/ui@1/dist/ui.browser.js` and
   `/__clerk/npm/@clerk/clerk-js@6/dist/clerk.browser.js`, including their redirects.
   Check `/__clerk/v1/environment` with Origin `https://ascendflight.org`.
   Confirm correct content types, no secret exposure, and no shared caching.
   `npm run check:auth-proxy` checks these public endpoints and redirects.
5. Publish the frontend changes with Pages production build variable
   `ASCEND_CLERK_PROXY_PATH=/__clerk`. Keep the production Clerk publishable key
   and `ASCEND_DATA_API_BASE=https://api.ascendflight.org`. Changing a variable
   requires a new Pages build. Do not enable the flag against the old frontend
   revision, which does not read it.
6. Run `npm run check:live-sign-in` (install Chromium and Firefox for Playwright
   first). Verify in network logs that Clerk scripts, UI chunks, environment,
   and client requests use `/__clerk/`. Verify real sign-in, session persistence
   after reload, sign-out, new-account verification, and authorized Community
   access with an appropriate test account. Never infer signup success just
   from a rendered form. Confirm the affected access path before calling the
   institutional issue fixed.

## Rollback

Unset `ASCEND_CLERK_PROXY_PATH` in Pages and rebuild the same frontend revision
to restore the direct Clerk connection. Verify direct sign-in before removing
the proxy setting from Clerk. Keep the Worker available until all cached pages
and active clients have moved off it. Do not delete identities or change JWT
issuers during rollback.

## Remaining institutional review

If the whole website is blocked, submit/review its classification with the
security vendor and request an organization-specific review where necessary.
For the current direct configuration, the primary destinations are
`ascendflight.org`, `clerk.ascendflight.org`, and `api.ascendflight.org`, on HTTPS
443. `accounts.ascendflight.org` hosts Clerk account flows. The audit also
observed `cdn.protect.clerk.com` for anti-abuse and optional
`static.cloudflareinsights.com` analytics. The exact additional requirements
depend on the enabled verification/OAuth flows; use failed-request evidence,
not blanket vendor-domain allowlisting. Ask IT for the exact hostname/URL,
timestamp, category/rule, and block action. Do not ask participants to disable
endpoint protection or bypass their organization's policy.
