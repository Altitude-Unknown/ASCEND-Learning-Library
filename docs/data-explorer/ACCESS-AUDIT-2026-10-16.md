# Community access audit — October 16, 2026

## Current production status: website and Clerk configuration rolled back

After the owner reported that multiple team members could no longer sign in or
receive verification codes, the website was rolled back to the pre-proxy Pages
deployment `2bf25775-77f4-47a3-a708-c2e632ac6684`. Production
`ASCEND_CLERK_PROXY_PATH` is now empty to prevent subsequent builds from
reactivating the proxy. This is an incident rollback; the email failure's exact
cause has not been established.

Cloudflare confirms that deployment as canonical. Live Community and Member
Login HTML no longer contain the proxy setting. At 19:57 UTC, both forms rendered
in Chromium and Firefox using `clerk.ascendflight.org`, with no HTTP errors.
The Chromium Member Login check observed aborted Clerk Protect probes; this is
recorded separately from form-loading success and has not been diagnosed.
The owner tested a fresh tab after rollback and still reached the code screen
without receiving an email. The website rollback did not resolve the incident.

The owner then removed the domain proxy configuration in Clerk. Their screenshot
shows the optional "Set proxy config" control, verified Frontend API and account
portal CNAME records, all three email DNS records verified, and SSL certificates
issued. This confirms configuration rollback, not successful email delivery.
The Worker remains deployed but is unused by the restored website. No account,
membership, email-delivery policy, DNS record, or database change was made during
rollback. Real-account sign-in after removal of the Clerk setting still needs
confirmation.
Post-removal checks at 20:03 UTC rendered Community and Member Login in Chromium
and Firefox using the direct Clerk host. All four checks recorded no failed
requests or HTTP errors. They did not submit credentials or request email.
Do not reactivate the proxy or call the incident resolved based solely on rendered
forms. The remaining sections record the investigation and superseded rollout.

## Findings and limits

The reported “Could not load sign-in. Please try again.” originates in
`src/data/session.js` when either initial Clerk script fires its download error
handler. This happens before account lookup, membership approval, or discussion
API requests. Resetting passwords or changing community roles cannot repair
this failure.

Live Chromium and Firefox both rendered the production Community sign-in form
with no failed requests in this audit. The initial scripts, version redirects,
UI chunks, `/v1/environment`, and `/v1/client` returned successfully. Public DNS
resolved and certificate verification passed for `ascendflight.org`,
`clerk.ascendflight.org`, `api.ascendflight.org`, and `accounts.ascendflight.org`.
The authentication host also accepted a connection restricted to TLS 1.2.
No universal DNS, certificate, or browser compatibility failure was reproduced.
These tests did not submit credentials or establish that an affected institution
can connect.

Blocking either initial script in an isolated live browser reproduced the exact
reported error. Blocking the Cloudflare analytics script did not prevent form
rendering. Blocking `cdn.protect.clerk.com` also allowed the initial form to
render; that test does **not** establish successful signup/sign-in with anti-abuse
services unavailable.

The likely failure class is selective access to the authentication dependency:
network/endpoint filtering, TLS inspection, or another request-level failure.
The exact cause for the latest participant is still unknown. A script error
cannot distinguish DNS failures, security blocks, HTTP failures, or CORS errors.
Earlier Windows Security evidence supports an institutional block for a separate
participant, not proof of the same cause for everyone.

The Cloudflare zone was created October 13. Clerk and API certificates were issued
October 14 and 16 respectively. These are newly introduced endpoints, but their
age alone is not evidence that a particular security product blocked them.

## Hosting inspection

Production Pages deployment `2bf25775-77f4-47a3-a708-c2e632ac6684` was successful.
The live page uses the production Clerk publishable key and
`https://api.ascendflight.org`. The Clerk DNS CNAME points to
`frontend-api.clerk.services`, then `worker.clerkprod-cloudflare.net`.

The existing Cloudflare OAuth login can read Pages and Worker configuration.
Zone DNS-record, settings, certificate-pack, ruleset, firewall, and Access API
reads returned 403. Public DNS and TLS were checked independently; dashboard
firewall configuration was **not** verified. A successful request from the audit
connection cannot exclude location/IP-specific WAF rules.

The website response has no Content-Security-Policy blocking Clerk. The repository's
headers use `nosniff`, DENY framing, a referrer policy, and feature restrictions;
those do not explain the observed script download failure. Authentication
scripts returned JavaScript content types and cross-origin permission. No code
change to roles, database access, or JWT verification is indicated by this error.
This access audit is not a malware certification or exhaustive penetration test.

## Changes prepared

- A separate Worker can serve the Clerk Frontend API through
  `https://ascendflight.org/__clerk`, using Clerk's documented proxy headers.
  It uses a fixed upstream, trusted Cloudflare client IP, manual redirects,
  preserved authentication responses, and no shared caching. The secret belongs
  only in a Worker secret binding. Request logging is disabled.
- `ASCEND_CLERK_PROXY_PATH=/__clerk` switches Community, Member Login, and the
  uploader to the proxy. It must remain unset until the proxy is provisioned,
  enabled in Clerk, and verified. The existing issuer and publishable key remain
  valid; this is not an identity migration.
- Sign-in downloads and initialization now time out, offer a reload button, and
  show safe support details identifying stage, service, page, and UTC time.
  These details contain no credentials, query strings, or provider error bodies.
- New tests cover initial script failures, initialization failure, a stalled
  download, direct/proxy configuration, cookie/body forwarding, trusted IP,
  redirect handling, secret isolation, and cache behavior.
- `npm run check:live-sign-in` checks real production Community and Member Login
  forms in Chromium and Firefox. It does not submit credentials. Local browser
  tests continue to use fixtures and do not substitute for production checks.

This proxy removes the separate authentication hostname/CNAME chain from the
browser's primary sign-in path. It cannot override a block on `ascendflight.org`
itself, and Clerk anti-abuse/OAuth services may still use other hosts. Treat it as
a candidate mitigation until affected access is confirmed. Do not disable
security controls or claim that this change has resolved institutional filtering.

## Validation

- Site build, 87-page link checks, material checks, and practice checks passed.
- 47 existing data/security tests and 5 proxy tests passed.
- 11 targeted browser tests passed (sign-in failure handling, Community, admin).
- Authentication Worker build-only validation passed.
- Live Chromium/Firefox Community form checks passed.
- The reusable live check also passed for Member Login in both browsers.
  It observed randomized `*.client.protect.clerk.com` anti-abuse probes; an
  aborted probe at browser teardown is not evidence of institutional blocking.
- After production Clerk configuration, all public proxy endpoint checks passed.
  Candidate frontend tests against the real proxy rendered Community and Member
  Login in Chromium and Firefox with no JavaScript errors and no direct requests
  to `clerk.ascendflight.org`. Script redirects, UI chunks, environment, and
  client requests all used `/__clerk/`.
- Authenticated session persistence, signup/verification, and affected-network
  access still require verification. Rendering the forms does not prove them.

Raw diagnostics are ignored under `artifacts/access-audit/`. They are not
published with the site. No participant account records were changed.

## Rollout checkpoint

The proxy Worker was deployed at `ascendflight.org/__clerk/*`, version
`0f80437c-868c-4128-9ca4-0e506384c6d6`. Before secret provisioning, a live request
correctly returned 503 with `Cache-Control: no-store`. The owner subsequently
stored the production secret through Wrangler's secret prompt. Both initial
scripts and their version redirects then passed live proxy checks. The
environment endpoint returned HTTP 400 / `host_invalid` before dashboard proxy
validation, then HTTP 200 after the owner saved the proxy path in production
Clerk. Frontend commit `4d9975d` is deployed in Pages deployment
`a6d9364c-9696-4adc-86f6-86293e6c1cca` with the production proxy flag enabled.
The published Community and Member Login forms passed all four Chromium/Firefox
checks with no direct Clerk-host requests or request failures. Full GitHub build,
browser, and PostGIS checks passed. Real account sign-in and affected-institution
access still need confirmation. See `SESSION-2026-10-16.md` for the deployment record.

## Follow-up: missing verification email

After cutover, the owner reported reaching the emailed-code entry screen after
credentials, but not receiving the code. A single resend displayed a sent message
without an email arriving. The owner found no matching production Email Logs
entry. End-to-end owner sign-in is therefore **not confirmed**.

Read-only comparisons found that both direct and proxied environment/client
requests returned 200, with Clerk client cookies scoped to `ascendflight.org`.
Deliberately empty sign-in POSTs returned the same 422 / `form_param_nil` through
both routes, without using an identity or requesting an email. A temporary,
sanitized Worker tail observed code-preparation POSTs returning HTTP 200 with no
Worker exceptions. Only method, redacted path, status, and outcome were retained;
no request body, credentials, cookie values, or verification codes were captured.
HTTP 200 establishes transport success, not delivery or completion of sign-in.

Public DNS showed the Clerk mail CNAME/SPF chain and DKIM CNAMEs, but no apex MX
or TXT records and no `_dmarc.ascendflight.org` TXT record. Missing DMARC and a
receiving mailbox are deliverability gaps, not an established cause of the absent
email-log entry. No DNS, account roles, verification policy, or delivery templates
were changed. Do not disable verification merely to hide this issue.

The owner subsequently supplied a production Application Logs screenshot. The
selected attempt is dated October 16, 2026, 1:44:42 PM as displayed in the dashboard
(the screenshot does not label the timezone). Its sequence includes
`sign_in.client_trust.required`,
`sign_in.email_address.verification.code_sent`,
`sign_in.prepare_second_factor.passed`, `sign_in.email_address.verified`,
`sign_in.attempt_second_factor.passed`, `sign_in.client_trust.passed`,
`session.created`, and `sign_in.completed`.

This confirms that one production attempt passed email verification and device
trust and established a Clerk session. It does not establish that this was the
owner's missing-email attempt, that the community groups opened, or that the
original affected institutional network now works. The owner subsequently
confirmed that no code arrived and that the successful attempt may belong to
someone else. Owner sign-in remains unresolved. Filter Application Logs by the
owner's identifier and attempt time before diagnosing delivery templates or
Protect policy. Account identifiers and IP addresses from the screenshot are
intentionally omitted from this record.

The owner then reported no recent Application Log events when filtering by their
email. This is not proof that no requests reached Clerk: the Identifier filter
matches a stored identifier exactly and returns events where its user is actor
or subject. A public configuration comparison confirmed that both live sign-in
pages use the live key for `clerk.ascendflight.org` and `/__clerk`. Direct and
proxied environment endpoints both identify `ASCEND Flight`, `production`, and
`https://ascendflight.org`; their display, authentication, and user-settings
configurations match. No production instance mismatch was found. The next
evidence requested is the actual code-entry screen's domain/path and whether its
displayed recipient matches the mailbox being checked. No additional login
attempt or email send was triggered by this comparison.

## References

- [Clerk Frontend API proxy requirements](https://clerk.com/docs/guides/dashboard/dns-domains/proxy-fapi)
- [Clerk JavaScript installation](https://clerk.com/docs/js-frontend/getting-started/quickstart)
- [Clerk log filters and retention](https://clerk.com/docs/guides/dashboard/logs/overview)
- [Microsoft network protection](https://learn.microsoft.com/defender-endpoint/network-protection)
- [Microsoft web content filtering](https://learn.microsoft.com/en-us/defender-endpoint/web-content-filtering/)

Microsoft's documentation distinguishes organization policy/category blocks from
threat reputation blocks. Obtain the exact blocked URL, category, and rule from
the organization's security logs before attributing a root cause. The earlier
SmartScreen review submission is recorded in `SESSION-2026-10-16.md`; no review
outcome is known.
