# Railway v3 staging — dashboard setup

Isolated staging service for the `feat/tf-v1-feedback` (v3) backend, so v3 can be
tested on-device without touching the live API, its database, or its domain.

Execute in the Railway dashboard. Nothing here is automated, and nothing in this
document changes the production service.

---

## ⚠️ Production promotion risk — READ BEFORE MERGING ANYTHING

The live `grace-api` service **auto-deploys from `main`**, and `backend/railway.toml`
carries:

```toml
[deploy]
preDeployCommand = ["npm run migrate"]   # prisma migrate deploy
```

**Therefore: merging v3 into `main` will deploy v3 to the live API and run the v3
migration against the production database, automatically, with no further action.**

The v3 migration is not trivially reversible on a live database. It adds
`user.auth_provider`, two UNIQUE indexes on `user.apple_sub` / `user.google_sub`,
and the `review_prompt` table.

Until the CTO decides otherwise:

- v3 stays off `main`
- no PR merge to `main`
- production deployment stays untouched
- **do not disable the production trigger unilaterally** — it is the CTO's call

Options to put to the CTO once staging is proven:

| | Option | Effect |
|---|---|---|
| A | Disable production auto-deploy permanently | Deploys become deliberate; merge to `main` is safe |
| B | Keep auto-deploy | Merge to `main` **is** the production deploy action; treat it as one |
| C | Protected release branch | `main` stays a source of truth, a separate branch triggers deploys |

---

## What exists today (do not modify)

| | |
|---|---|
| Railway project | `grace-api-staging` · id `d8bf7ae3-bdaf-4500-924c-9f5ef36e652a` |
| Live service | `grace-api` → `https://grace-api-production.up.railway.app` |
| Live DB | Railway PostgreSQL plugin in the same project |
| Source | GitHub `selveapps/grace-expo`, root `backend`, auto-deploy from `main` |

> Railway names the default *environment* `production`, which is why the URL says
> production even though the *project* is named staging. It serves Build 4. Treat
> it as production.

---

## Setup checklist

### 1. Open the project

Railway dashboard → project **`grace-api-staging`**
(`d8bf7ae3-bdaf-4500-924c-9f5ef36e652a`).

Do not open the existing `grace-api` service except to read.

### 2. Create the service

**+ New** → **GitHub Repo** → `selveapps/grace-expo`.

Rename it immediately to **`grace-api-v3-staging`** (Settings → Service name), so
it is never confused with `grace-api` in a list.

### 3. Point it at the v3 branch

Service → **Settings → Source**:

- **Root Directory:** `backend`
- **Branch:** `feat/tf-v1-feedback`

Confirm the branch field reads `feat/tf-v1-feedback` before anything else.

### 4. Make sure it can never deploy `main`

Service → **Settings → Source → Automatic Deploys: OFF.**

Deploy manually from the Deployments tab instead. With auto-deploy off the branch
setting only governs what a manual deploy builds, so `main` cannot reach this
service even if someone pushes to it.

If your plan does not expose that toggle, leave the branch pinned to
`feat/tf-v1-feedback` and add a **Deploy Trigger** for that branch only. Never
leave it on `main`.

### 5. Add a separate Postgres

Project → **+ New** → **Database** → **PostgreSQL**.

Rename it to **`Postgres-v3`**. This is a second, empty database. Do not reuse,
fork, or restore from the existing Postgres.

### 6. Environment variables

Service `grace-api-v3-staging` → **Variables**. Names and what each references:

| Name | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `${{Postgres-v3.DATABASE_URL}}` | **Must reference `Postgres-v3`**, not `Postgres`. See step 9. |
| `JWT_SECRET` | **new** `openssl rand -base64 32` | Fresh. Do not copy production's. A different secret means staging tokens are worthless against production. |
| `NODE_ENV` | `production` | Runtime mode, not environment naming. |
| `CORS_ORIGINS` | `*` | Beta only; tighten later. |
| `BETA_REDEEM_CODE` | any staging value | Used by the paywall's beta path; need not match production. |
| `APPLE_BUNDLE_ID` | `com.selveapps.grace` | Audience claim checked by `POST /auth/apple`. Same bundle id, because it is the same iOS app. |

**Deliberately NOT set:** `ELEVENLABS_API_KEY`, `ELEVENLABS_*`, `OPENAI_API_KEY`,
`TTS_PROVIDER`. All narration is pre-rendered and committed; the running server
never calls a TTS or LLM provider. Setting them would add live-billing surface for
no benefit. `PORT` / `HOST` are injected by Railway.

### 7. Build / start / predeploy

`backend/railway.toml` is committed and already correct:

```toml
[build]  buildCommand      = "npm run build"      # prisma generate && tsc
[deploy] preDeployCommand  = ["npm run migrate"]  # prisma migrate deploy
         startCommand      = "npm start"          # node dist/index.js
         healthcheckPath   = "/health"
```

Leave it alone. Railway picks it up from the root directory; no service-level
override is needed, and editing it would change production's behaviour too.

### 8. Generate the staging domain

Service → **Settings → Networking → Generate Domain**.

Expect something like `grace-api-v3-staging-production.up.railway.app`. Copy it —
it becomes `EXPO_PUBLIC_API_BASE` for the staging EAS profile.

Do **not** touch the existing service's domain, and do not move a custom domain.

### 9. Inspect BEFORE clicking Deploy

`preDeployCommand` migrates whatever `DATABASE_URL` resolves to, so prove it
first. On the `grace-api-v3-staging` service:

- [ ] Service name is `grace-api-v3-staging`, **not** `grace-api`
- [ ] Source branch is `feat/tf-v1-feedback`, **not** `main`
- [ ] Root directory is `backend`
- [ ] Automatic deploys are OFF (or pinned to the v3 branch only)
- [ ] **Variables → `DATABASE_URL` → expand the reference and confirm it resolves
      to `Postgres-v3`.** Railway shows the resolved target. If it says `Postgres`,
      stop: that is the production database.
- [ ] `Postgres-v3` exists and is a *new, empty* database
- [ ] `JWT_SECRET` is set and is not production's
- [ ] No ElevenLabs / OpenAI keys present

Only then: **Deploy**.

After the first deploy, confirm the migration ran against staging by checking
`Postgres-v3` has a `review_prompt` table, and that the production Postgres does
**not**.

### 10. Seed minimal data

No production data is copied. From a machine with the staging `DATABASE_URL`:

```bash
cd backend
DATABASE_URL='<staging url>' npm run seed:prepare   # sample KJV
DATABASE_URL='<staging url>' npm run seed:bible
```

Users are created on demand by guest auth, so nothing else is needed.

---

## Rollback / removal

Staging is disposable and nothing depends on it.

1. Service `grace-api-v3-staging` → **Settings → Danger → Delete Service**
2. `Postgres-v3` → **Settings → Danger → Delete**
3. Optionally remove the generated domain (deleting the service removes it)

Build 4 keeps pointing at the production URL throughout, so deleting staging has
no effect on anything shipped. Production was never modified, so there is nothing
to restore.

If a staging deploy goes wrong mid-way, delete the service rather than trying to
repair it. Recreating it is ten minutes.
