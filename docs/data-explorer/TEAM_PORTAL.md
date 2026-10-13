# Team portal requirements — October 12, 2026

## Confirmed user requirements

- Prepare the system before real mission data or completed loggers exist.
- Support all 40 teams with one shared website login per team.
- Teams create their own missions and upload their own data.
- Only the program administrator approves public publication.
- Logger firmware and acquisition hardware remain in development; later firmware
  will target the versioned ASCEND CSV standard. Use synthetic data for readiness.

## Current live baseline

The administrator-only pipeline is deployed and smoke-tested: server validation,
private original-file archive with matching SHA-256, five committed observations,
and private mission exclusion from public queries. This does not demonstrate team
login, team isolation, onboarding, or mission creation; those are not implemented.

## Proposed authentication integration

Use managed Clerk authentication for email/password login and account recovery,
with team membership and authorization held in the existing Neon database. Each
team uses its own designated email address and one shared account; administrator
accounts are separate. Never give teams database passwords or ADMIN_TOKEN.
Account ownership/recovery email must be agreed during onboarding. Do not send
invitations or account emails until the user explicitly authorizes that action.

Keep identity-to-team assignment server-controlled. Signing in alone does not
grant access: an active membership is required. Use verified provider user IDs,
not browser-supplied team IDs, email strings, or unsigned claims, for authorization.
Verify token signature, issuer, expiry, and authorized frontend origin. Apply team
authorization on every private read, metadata write, preview, confirmation, and
original download. Bind preview tickets to the authenticated identity and team.

## Required implementation

1. Identity/membership migrations, upload attribution, and audit events.
2. Login/logout/account-recovery interface without administrator-token entry for teams.
3. Team workspace: private missions, upload history, and observation preview.
4. Team-scoped mission/platform/sensor creation with validated metadata and ownership.
5. Existing preview/confirmation pipeline scoped to the authenticated team.
6. Administrator console for team activation/deactivation and publication review.
7. Team-scoped retrieval of original archives and normalized private observations.
8. Repeatable 40-team setup/import using real team names and designated emails;
   create test identities first, without sending messages to real teams.

Teams cannot approve publication or reassign ownership. New missions remain
private/pending; uploads do not publish data. Revoked membership must stop access.
The administrator secret workflow can remain during migration, but it must not be
shown or distributed as the team login path.

## Readiness verification

- Two synthetic team identities and a separate administrator identity.
- Team A cannot list, fetch, change, import into, or download Team B's resources,
  including requests with deliberately substituted IDs and confirmation tickets.
- Expired, malformed, wrong-origin, and revoked identities fail access checks.
- Private mission/upload workflow works; only administrator publication reveals data.
- Repeated confirmation returns the same import without duplicate observations.
- Exercise complete provisioning/membership coverage for 40 teams.
- Confirm production identity configuration, runtime-role privileges, upload CPU
  capacity, rate limits, backups, retention, and recovery before onboarding.

Current V1 limits remain 2 MiB / 5,000 rows per CSV. Before logger firmware is
finalized, choose expected sampling rate and flight duration; larger recordings
may require staged/background imports. Do not claim readiness for unlimited files.

## External setup still needed

Create and configure the login provider application, supply its public application
configuration and securely install required server credentials. Configure the
production domain after ascendflight.org is connected. No login-provider purchase,
application creation, or production authentication setup has been completed yet.
