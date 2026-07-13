# grace-api

Grace backend API (Node 20 + TypeScript + Fastify). Deployed on **Railway Hobby**.

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
curl http://localhost:3000/health
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev with hot reload |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run production build |
| `npm run typecheck` | Typecheck without emit |

## Railway

See [`../docs/RAILWAY_DEPLOYMENT.md`](../docs/RAILWAY_DEPLOYMENT.md).

- **Root directory:** `backend/`
- **Build:** `npm run build`
- **Start:** `npm start`
- **Health:** `GET /health`

## Spec

HTTP contract: [`../BACKEND.md`](../BACKEND.md)  
Milestones: [`../docs/BACKEND_ARCHITECTURE.md`](../docs/BACKEND_ARCHITECTURE.md)
