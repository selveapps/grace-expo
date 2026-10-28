# Grace web — agent instructions

Thin card. `web/` is the Next.js Grace client on the shared grace-api. Do not restate the plan here.

## Docs

- Plan: `docs/web/PLAN.md`
- Tasks: `docs/web/TASKS.md`
- Tickets: `docs/web/TICKETS.md`

## Commands (`cd web`)

```bash
npm test
npm run typecheck
npm run build
npm run dev
```

`npm run dev` listens on port 3100. `GRACE_API_BASE` defaults to `https://grace-api-production.up.railway.app`.

## Rules

- Web must not fork grace-api. Do not copy `backend/`, add a second scripture store, or add a second auth issuer.
- Public scripture, stories, and Tea stay server-rendered.
- Client JavaScript only for onboarding, audio, and forms.
