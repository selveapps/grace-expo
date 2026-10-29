Guests reply on a page served by the API, and the phone's sync channel cannot write those replies.

A member can save the page settings. A taken slug is refused. Settings are members only.
Issuing a link returns the public URL and a readable code once. Reissuing or revoking turns the old link off.
The page shows only that invitation's guests, by first name, and escapes names that look like markup.
A made-up token is refused. A code works only on its own wedding. An unknown wedding page is a 404.
Replies stop after the deadline day. The link stops working 30 days after the deadline.
A reply is recorded without writing the guest records through this request, and a later reply can change the answer.
A meal that is not on the list is rejected.
Guessing codes is slowed per address and per wedding, across addresses.
Devices cannot write replies through sync. Guest pages work without the app token. The API still requires it.

Every interpolated value is escaped.

The hidden tests import:
- `after, before, beforeEach, describe, it` from `node:test`
- `createAuthServer` from `../app.mjs`
- `openDatabase` from `../db.mjs`
- `escapeHtml, html, raw` from `./html.mjs`
- `RSVP_RATE_LIMITS` from `./routes.mjs`
- `normaliseCode, repliesOpen, validateSettings` from `./rsvp.mjs`
