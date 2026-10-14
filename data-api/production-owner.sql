-- Run as neondb_owner before switching the website to production Clerk.
BEGIN;
INSERT INTO portal_accounts(subject,role,team_id,display_name,active,owner)
VALUES('user_3Kgw9SmOzG8S75VussYWhMKPR0L','administrator',NULL,'Mike Walach',true,true)
ON CONFLICT(subject) DO UPDATE
SET role='administrator',team_id=NULL,display_name='Mike Walach',active=true,owner=true;
COMMIT;
SELECT subject,role,active,owner FROM portal_accounts
WHERE subject='user_3Kgw9SmOzG8S75VussYWhMKPR0L';
