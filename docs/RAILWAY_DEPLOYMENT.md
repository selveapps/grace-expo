# Grace API — Railway Hobby deployment

**Decision (locked):** Staging + beta API on **Railway Hobby** (~$5/mo plan, $5 usage credit included).

**Linear:** [SEL-6](https://linear.app/selve-apps/issue/SEL-6) Postgres · [SEL-21](https://linear.app/selve-apps/issue/SEL-21) deploy

---

## Why Railway Hobby for Grace beta

| Benefit | Detail |
|---------|--------|
| Always-on | No 15-min spin-down (unlike Render free) |
| Integrated Postgres | One-click DB, `DATABASE_URL` auto-injected |
| Expo Go friendly | Stable HTTPS for remote beta testers |
| Cost | ~$5–15/mo for API + small Postgres at beta scale |

---

## Architecture on Railway

```
Railway Project: grace-api-staging
├── Service: grace-api     (Node 20 + Fastify, root: backend/)
└── Plugin:  PostgreSQL    (DATABASE_URL → grace-api)
```

Public URL → `EXPO_PUBLIC_API_BASE` in the Expo app.

---

## One-time setup

### 1. Create Railway project

1. Sign up at [railway.app](https://railway.app) → upgrade to **Hobby** ($5/mo).
2. **New Project** → **Deploy from GitHub repo** → `selveapps/grace-expo`.
3. Set **Root Directory** to `backend` (after GRACE-003 lands on `main`).
4. Set **Branch** to `backend-dev` (staging) or `main` (production later).

### 2. Add PostgreSQL

1. In the project: **+ New** → **Database** → **PostgreSQL**.
2. In `grace-api` service **Variables**, add:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<generate-32+-char-secret>
NODE_ENV=production
```

Generate JWT secret:

```bash
openssl rand -base64 32
```

### 3. Networking

1. `grace-api` → **Settings** → **Networking** → **Generate Domain**.
2. Copy the URL (e.g. `https://grace-api-staging.up.railway.app`).
3. Verify: `curl https://<your-domain>/health` → `{"ok":true}`.

### 4. CORS (Expo Go)

Set in Railway variables (comma-separated origins, or `*` for beta only):

```
CORS_ORIGINS=*
```

Tighten before production.

### 5. Expo app env

In `grace-expo` (or EAS env):

```
EXPO_PUBLIC_API_BASE=https://<your-railway-domain>
```

---

## Local dev with Railway Postgres (optional)

```bash
cd backend
cp .env.example .env
# Paste DATABASE_URL from Railway Postgres → Connect tab
npm install
npm run dev
curl http://localhost:3000/health
```

---

## Deploy workflow

| Trigger | How |
|---------|-----|
| Auto | Push to linked branch → Railway rebuilds |
| Manual | `cd backend && railway up` (Railway CLI) |
| Migrations | `npm run migrate` in deploy command or CI step (GRACE-005) |

**Recommended deploy command** (once migrations exist):

```
npm run build && npm run migrate && npm start
```

---

## Cost guardrails (Hobby)

1. **Settings → Usage** → set a **spending limit** (e.g. $10/mo).
2. One Postgres instance shared by staging (no duplicate DBs).
3. Single `grace-api` replica until beta traffic grows.
4. Monitor **Metrics** tab for RAM/CPU; right-size if idle.

Typical beta stack: **$5–12/mo** total.

---

## Product decisions (beta)

| Area | Choice |
|------|--------|
| Hosting | Railway Hobby |
| Auth | Guest + email magic link |
| Premium | Beta redeem codes (`POST /beta/redeem`) |
| Search | Required (GRACE-010 on critical path) |
| Repo | Monorepo `grace-expo/backend/` |

---

## Checklist (GRACE-019)

- [ ] Railway Hobby plan active
- [ ] GitHub repo connected, root `backend/`
- [ ] Postgres plugin added
- [ ] `DATABASE_URL`, `JWT_SECRET` set
- [ ] Public domain generated
- [ ] `curl /health` returns 200 from phone network (LTE)
- [ ] `EXPO_PUBLIC_API_BASE` set in Expo app
- [ ] Spending limit configured
