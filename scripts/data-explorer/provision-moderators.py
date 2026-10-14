"""Create production Clerk moderators without sending email or storing credentials.

Run with an ignored local JSON roster: [{"email": "...", "name": "..."}].
An interactive prompt reads the production secret key without echoing it.
Writes owner-reviewed Neon SQL alongside the roster; apply that SQL as DB owner.
Requires email-code sign-in enabled in the production Clerk instance.
"""
import argparse
import getpass
import json
import pathlib
import re
import urllib.error
import urllib.parse
import urllib.request


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('roster', type=pathlib.Path)
    parser.add_argument('--apply', action='store_true', help='Create missing Clerk users; no emails sent')
    args = parser.parse_args()
    people = json.loads(args.roster.read_text())
    if not isinstance(people, list) or not 1 <= len(people) <= 100:
        raise SystemExit('Supply 1–100 roster entries.')
    emails = set()
    for row in people:
        email = row['email'].strip().lower()
        if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email) or email in emails:
            raise SystemExit('Invalid or duplicate roster email.')
        row['email'] = email
        row['name'] = row.get('name', email).strip()
        if not 1 <= len(row['name']) <= 80:
            raise SystemExit('Names must contain 1–80 characters.')
        emails.add(email)
    if not args.apply:
        print(f'Validated {len(people)} moderator entries. No accounts created. Use --apply when production is ready.')
        return
    key = getpass.getpass('Production Clerk secret key (hidden; never saved): ')
    if not key.startswith('sk_live_'):
        raise SystemExit('A production sk_live_ key is required.')

    def api(path, body=None):
        request = urllib.request.Request('https://api.clerk.com/v1' + path,
            data=json.dumps(body).encode() if body is not None else None,
            headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'},
            method='POST' if body is not None else 'GET')
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            raise SystemExit(f'Clerk request failed (HTTP {error.code}). Check production settings; completed accounts are safe to reuse on rerun.') from None

    statements = ['BEGIN;']
    for person in people:
        users = api('/users?' + urllib.parse.urlencode({'email_address[]': person['email']}))
        if len(users) > 1:
            raise SystemExit('Ambiguous email match; review in Clerk.')
        user = users[0] if users else api('/users', {
            'email_address': [person['email']], 'skip_password_requirement': True,
        })
        subject = user['id']
        if not re.fullmatch(r'user_[A-Za-z0-9]+', subject):
            raise SystemExit('Unexpected Clerk user ID.')
        name = person['name'].replace("'", "''")
        statements.append("INSERT INTO portal_accounts(subject,role,team_id,display_name,active) "
            f"VALUES('{subject}','moderator',NULL,'{name}',true) "
            "ON CONFLICT(subject) DO UPDATE SET role='moderator',display_name=EXCLUDED.display_name,active=true "
            "WHERE NOT portal_accounts.owner AND portal_accounts.role<>'administrator';")
    statements += ['COMMIT;', "SELECT display_name,role,active FROM portal_accounts WHERE role='moderator' ORDER BY display_name;"]
    output = args.roster.with_suffix('.accounts.sql')
    output.write_text('\n'.join(statements) + '\n')
    output.chmod(0o600)
    print(f'{len(people)} production Clerk accounts ready. Apply {output} in Neon to grant moderator access. No emails sent.')


if __name__ == '__main__':
    main()
