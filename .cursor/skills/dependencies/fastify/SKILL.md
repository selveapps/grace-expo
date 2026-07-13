---
name: fastify
description: >-
  Fastify server patterns for grace-api. Use when adding routes, plugins, or
  fixing TypeScript ESM import errors in backend/src/.
---

# Fastify (grace-api)

## Official docs

https://fastify.dev/docs/latest/

## Layout

```
backend/src/
├── index.ts          # App bootstrap, CORS, listen
├── db.ts             # Prisma client + checkDatabase()
└── routes/
    └── health.ts     # registerHealthRoutes(app)
```

## ESM rules (critical)

`package.json` has `"type": "module"`. All local imports need **`.js` extension**:

```typescript
import { registerHealthRoutes } from './routes/health.js';
import { checkDatabase } from '../db.js';  // from routes/ subfolder
```

`tsc` emits to `dist/`; `npm start` runs `node dist/index.js`.

## Adding a route

1. Create `src/routes/<name>.ts` with `export async function registerXRoutes(app)`
2. Import in `index.ts` and call `await registerXRoutes(app)`
3. Add integration test or curl verify step

## Health pattern

```typescript
app.get('/health', async () => {
  const db = await checkDatabase();
  return { ok: db, db };
});
```

## Verify

```bash
cd backend && npm run build && npm start &
curl -s http://127.0.0.1:3000/health
```

## Surprises

See `SURPRISES.md` — relative import paths, `.js` extensions.
