# Grace legal pages — static deploy bundle

> **This folder is a mirror, not the deployment source.** The live pages at
> `selveapps.xyz/grace/{privacy,terms,support}` are served from a separate
> Next.js site and are already deployed. Changing files here does **not** change
> what users see; the Next.js site has to be updated too. The markdown in
> `docs/legal/` remains the source of truth for the copy, and this bundle is
> kept in step with it so the wording can be diffed and reviewed in one repo.

Static HTML for App Store–required legal URLs:

- `/grace/privacy`
- `/grace/terms`
- `/grace/support`

Source of truth for copy: `docs/legal/PRIVACY.md`, `docs/legal/TERMS.md` and `docs/legal/SUPPORT.md`.

## Target URLs (App Store)

`src/legal.js` points at:

- `https://www.selveapps.xyz/grace/privacy`
- `https://www.selveapps.xyz/grace/terms`
- `https://www.selveapps.xyz/grace/support`

All three must return **200** before App Store submission. Verified 17 Aug 2026.

The apex is not dead: `selveapps.xyz/grace/*` returns a `308` to the `www` host,
which then returns `200`. The constants use the `www` form anyway so the links
resolve in one hop and cannot break if the apex redirect is ever reconfigured.

---

## Deploy to Selve Apps Vercel team

Deploy under the **Selve Apps** team (`selveapps`), not a personal Vercel account.

### Prerequisites (dashboard — do once)

1. **Team membership** — A Selve Apps team owner invites your Vercel account:
   - [vercel.com](https://vercel.com) → **Selve Apps** team → **Settings → Members → Invite**
   - Accept the invite in email / notifications.
2. **Confirm team slug** — After invite, run `npx vercel teams ls` and note the slug (likely `selveapps`).
3. **Project access** — For an existing `selveapps.xyz` project, ensure your role is **Member** or higher (Developer can deploy; Admin needed to add domains).

### CLI setup

Vercel CLI is not required globally; `npx vercel` works (currently v58+).

```bash
# 1. Authenticate (opens browser)
npx vercel login

# 2. Confirm identity and team
npx vercel whoami
npx vercel teams ls
# Expect a row for Selve Apps (slug: selveapps)

# 3. Switch default team (optional — or pass --scope on every command)
npx vercel teams switch selveapps
```

If `selveapps` does not appear in `teams ls`, you are not on the team yet — finish the dashboard invite first.

### New project vs existing selveapps.xyz site

| Approach | When to use | Result on selveapps.xyz |
|----------|-------------|-------------------------|
| **A — Add to existing Next.js site** | You have the selveapps website repo | Native `/grace/*` routes (best UX) |
| **B — Separate static project + rewrites** | Website repo not available locally | `/grace/*` via rewrite from main project |
| **C — Copy into `public/grace/`** | Next.js site uses static assets | Same as A, minimal code |

**Do not** change the main selveapps.xyz project's **Root Directory** to `docs/legal/web` — that would break the marketing site.

---

## Option A — Add to existing selveapps.xyz Next.js site (preferred)

If you have the selveapps website repo (Next.js App Router on Vercel), add:

```
app/grace/privacy/page.tsx
app/grace/terms/page.tsx
```

Render markdown from `docs/legal/` or copy HTML from this folder. Deploy from that repo with team scope:

```bash
cd /path/to/selveapps-website
npx vercel link --yes --scope selveapps --project <selveapps-xyz-project-name>
npx vercel deploy --prod --yes --scope selveapps
```

Or push to the connected Git branch — Vercel auto-deploys if the project is already linked to the Selve team.

**Simplest variant** — copy static files into the Next.js tree:

```
public/grace/privacy/index.html
public/grace/terms/index.html
```

---

## Option B — Standalone project on Selve team (this folder)

Use when the selveapps Next.js source is not in this repo.

### One-time link

```bash
cd docs/legal/web

# Create + link a new project under Selve Apps (non-interactive)
npx vercel link \
  --yes \
  --scope selveapps \
  --project grace-legal
```

This writes `.vercel/project.json` locally (gitignored). Pick a project name like `grace-legal` or `selveapps-grace-legal`.

### Deploy

```bash
cd docs/legal/web

# Preview
npx vercel deploy --yes --scope selveapps

# Production
npx vercel deploy --prod --yes --scope selveapps
```

Or without a prior link (single shot):

```bash
npx vercel deploy docs/legal/web \
  --prod \
  --yes \
  --scope selveapps \
  --project grace-legal
```

After deploy, note the production URL (e.g. `https://grace-legal.vercel.app`).

### Wire selveapps.xyz/grace/* (main project dashboard)

In the **existing selveapps.xyz** Vercel project (Selve team), add rewrites so App Store URLs resolve:

**Project → Settings → Redirects** (or `vercel.json` in the website repo):

```json
{
  "rewrites": [
    { "source": "/grace/privacy", "destination": "https://grace-legal.vercel.app/grace/privacy" },
    { "source": "/grace/terms", "destination": "https://grace-legal.vercel.app/grace/terms" }
  ]
}
```

No new domain needed — `selveapps.xyz` already points at the main project; rewrites proxy the legal paths.

**Verify:**

```bash
curl -sI https://selveapps.xyz/grace/privacy | head -1
curl -sI https://selveapps.xyz/grace/terms | head -1
# Expect: HTTP/2 200
```

---

## Option C — Monorepo (future)

If `grace-expo` is later connected to Vercel under Selve Apps, use **Root Directory** `docs/legal/web` only for a dedicated legal sub-project (`vercel link --repo`), not for the main site project.

---

## Verify locally

```bash
cd docs/legal/web
python3 -m http.server 8080
# open http://localhost:8080/grace/privacy/
# open http://localhost:8080/grace/terms/
```

Or:

```bash
npx serve docs/legal/web -p 8080
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `teams ls` shows only personal team | Accept Selve Apps invite; re-run `vercel login` |
| Deploy lands on personal account | Add `--scope selveapps` (or `vercel teams switch selveapps`) |
| `Not authorized` | Run `npx vercel login` |
| 404 on selveapps.xyz/grace/* | Add rewrites on main project (Option B) or merge routes (Option A) |
| Wrong team linked | Delete `docs/legal/web/.vercel/` and re-run `vercel link --scope selveapps` |
