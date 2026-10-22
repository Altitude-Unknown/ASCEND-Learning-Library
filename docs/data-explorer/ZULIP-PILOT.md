# ASCEND Zulip pilot

Prepared October 22, 2026. The owner supplied the pilot organization URL:
https://ascendflight.zulipchat.com/.
The Community page now includes a direct pilot link before the existing board's
sign-in controls. Organization permissions and school access still need testing.

## Hosting and ownership

Start with Zulip Cloud Free to test access without provisioning a server.
The owner created the ASCEND workspace. The selected billing plan has not been
independently verified; the Free plan is sufficient for this pilot.

The Free plan currently provides 10,000 messages of search history and 5 GB
total file storage. Check https://zulip.com/plans/ before broader rollout.
Education/research sponsorship may be available; eligibility is not confirmed.

## Proposed configuration

- Require invitations to join; keep discussions accessible to members only.
- Do not enable web-public channels or unrestricted public invitation links.
- Use individual accounts and test email/password login independently of Clerk.
- Keep the project owner as organization owner; grant staff roles deliberately.
- Begin with channels for announcements, introductions, technical help,
  flight operations, and data and science. Use topics for individual questions.
- Start with a small owner-selected group, including someone at an affected
  school. Do not bulk invite the existing roster during setup.

## Access test

Test on an affected school's managed device and campus network, without a VPN
or personal hotspot. Record school, browser, time, and exact error if any.

1. Open the actual organization URL and load the sign-in page.
2. Complete an invitation and verify email delivery.
3. Sign in, reload, sign out, and sign in again.
4. Post a topic and exchange replies between two pilot accounts.
5. Upload and download a harmless sample file; test search and unread messages.
6. Check that an uninvited account and a signed-out browser cannot read messages.

A hosted pilot is not proof that a future self-hosted domain will work at the
same school. If blocked, collect the failing hostname/request and work with
school IT before choosing a migration or hosting change.

## Website integration after provisioning

Use the actual verified organization URL; do not assume the suggested subdomain
was registered. Add a clearly labeled Zulip pilot link accessible without Clerk
login. Open Zulip as its own page rather than embedding it behind the current
community sign-in. Keep the existing discussion board during the pilot.

Zulip accounts do not grant data-upload access. The existing member workspace,
Clerk authentication, and dataset permissions remain separate.

After school access is verified, decide whether to retain managed hosting or
self-host at community.ascendflight.org. A custom subdomain requires a supported
hosting/DNS arrangement; it is not established by creating a website link.
Plan history migration separately before retiring the current board.

## References

- https://zulip.com/help/create-an-organization
- https://zulip.com/plans/
- https://zulip.com/help/configure-authentication-methods
- https://zulip.com/self-hosting/
