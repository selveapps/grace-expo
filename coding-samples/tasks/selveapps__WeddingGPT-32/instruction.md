Add account export and account deletion on the auth server.

Export requires a session. It returns that account and every wedding it belongs to, with records. It contains nothing secret and nothing from a wedding they are not in.
Delete requires the session and the password, and refuses anything else. Another person's password does nothing.
A shared wedding is handed to the partner. A solo wedding is deleted with its records.
After deletion, nothing still points at that account, every session ends, the email can be used again, and invites they sent stop working.
A partner who leaves loses only their part.
Password guesses are limited per account, including from a new address each time, and a stolen session cannot guess without that limit.

The graded file is server/auth/account.test.mjs. It uses node:sqlite and node:test. Do not add a new auth issuer.

The hidden tests import:
- `after, before, beforeEach, describe, it` from `node:test`
- `rmSync` from `node:fs`
- `tmpdir` from `node:os`
- `join` from `node:path`
- `DatabaseSync` from `node:sqlite`
- `createAuthServer` from `./app.mjs`
- `openDatabase` from `./db.mjs`
- `DELETED_USER` from `./account.mjs`
- `Op` from `./sync.mjs`
- `Role` from `./workspaces.mjs`
