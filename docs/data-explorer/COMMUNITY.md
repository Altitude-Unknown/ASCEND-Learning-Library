# ASCEND community and publication policy

## Policy agreed October 13, 2026

Discussions are visible to active, signed-in ASCEND members only. All members can
read all groups, create topics and reply across teams. Moderators and administrators
create groups, pin/unpin, lock/unlock, move and hide topics, and hide posts. Messages
are plain text, paginated, and attributed to display name/team/institution. No
real-time chat, email notifications, private groups, or attachments are implemented.

Member accounts are individual; multiple people may belong to the same team.
Administrators manage account assignments, roles and activation through the member
workspace. The owner account is protected, and only the owner can assign or change
administrator accounts. Up to 12 active helper administrators are allowed in
addition to the owner. No invitation emails are sent by these tools.

Scientific data is publicly readable/downloadable without login after a successful
member import. Automated file/unit/time/coordinate checks and QC flags remain.
Import and publication commit together. Administrators may withdraw erroneous
datasets; withdrawal blocks additional uploads to that mission until restored.
Team ownership restricts writing, not public reading. Existing private test
missions are not automatically published by the migration.

## Rollout

1. Run data-api/migrations/005_community_members.sql once in Neon as owner.
   It removes the single-account-per-team constraint, migrates existing test team
   accounts to members, records owner/display names, adds discussion tables and
   six starter groups, and adds a persistent withdrawal flag. Expect versions 1–5.
2. Deploy the updated Worker and website together after migration.
3. Test /community/ signed out, as members A/B, and as moderator/administrator.
   Members should share discussions and have no moderation actions. Disabled
   members should lose API access. Verify topics/posts stay out of public search.
4. Verify a new synthetic member upload is publicly downloadable automatically;
   withdraw it and check public queries no longer return it. Check replay/duplicate
   imports and wrong-team destinations remain protected.
5. Configure production Clerk before inviting real members. Real roster is deferred
   until spring; don't substitute development test accounts for production users.

## Operational limits

Posts are limited to 8,000 characters and 10 posts per member per minute. Topics
and replies are returned 50 at a time, with a next-offset marker. Moderation hides
content rather than deleting history and is audited. Discussion API replies use
Cache-Control: no-store and require server-verified sessions plus active membership.
Rate limits, content validation and bounded paging supplement authentication.
Testing membership/deactivation and content moderation on the live database remains
part of rollout; local browser fixtures are not live identity verification.

## Membership approval and group deletion — October 14, 2026

Run migration 006 once as Neon owner before deploying this revision. New verified
Clerk sessions can request membership from Community, but cannot read discussions
or upload until approved. Moderators and administrators review pending requests in
Community. Approval grants only ordinary membership, without a team assignment;
a team assignment remains necessary to create missions or upload. Rejected and
disabled accounts cannot bypass the decision by submitting again. Only the project
owner grants or changes moderator/administrator roles. Moderator access is prepared
for 12 leadership members; accounts await the actual names/email roster.

Administrators can Delete group after a confirmation. This archives the group:
its topics and replies disappear from member views, and new posts/moves into it
are rejected. Content and audit history remain in the database.

Production Clerk is a separate identity instance. Create the production owner
login and map its new user subject explicitly before changing live keys/issuer.
Never assume development users or their IDs transfer. Verify Clerk DNS/certificates,
configure production publishable key in Pages and issuer in Worker, and test owner
access plus pending/approved member access. No secret keys belong in this repository.

### Moderator provisioning

October 16 correction: local provisioning records did not match the production
Clerk dashboard. Verify each live production identity before assigning staff roles;
do not treat the roster or generated SQL as proof of successful account creation.
Users must create an account before using Sign in. See
[the current checkpoint](SESSION-2026-10-16.md).

The owner-authorized October 14 list contains 13 moderators (all 13 confirmed).
The actual roster is kept locally in ignored `artifacts/onboarding/moderators.json`,
not in GitHub. `python3 scripts/data-explorer/provision-moderators.py <roster>`
validates the roster without network requests. With `--apply`, the script prompts
for the production Clerk secret key without echoing/saving it, reuses matching
users or creates accounts with email-code sign-in, and writes local Neon SQL to
assign moderator roles. It sends no emails and creates no shared passwords.
Enable production email-code sign-in first. Apply the resulting SQL as DB owner;
review verified production identities before granting access. Where names were
not supplied, email addresses are initial display names and can be edited later.
