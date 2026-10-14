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
