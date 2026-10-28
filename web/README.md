# Grace web

Next.js client in `web/`. It uses the existing grace-api. It does not fork that API and it does not embed a Bible.

The plan stays in [`docs/web/PLAN.md`](../docs/web/PLAN.md). This file does not copy it. Task slices: [`docs/web/TASKS.md`](../docs/web/TASKS.md). Ticket map: [`docs/web/TICKETS.md`](../docs/web/TICKETS.md). Agent card: [`AGENTS.md`](./AGENTS.md).

## Commands

```bash
cd web && npm test
npm run typecheck
npm run build
npm run dev
```

`npm run dev` listens on port 3100.

`GRACE_API_BASE` defaults to `https://grace-api-production.up.railway.app`.
