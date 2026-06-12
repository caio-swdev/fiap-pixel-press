# Render Dashboard Runbook — PixelPress First Deploy

Step-by-step instructions to deploy PixelPress using the `render.yaml` Blueprint.

## Prerequisites

- GitHub repo pushed and up to date (branch: `main` or `atividade-2`)
- Render.com account (free — https://render.com/register)
- RAWG API key (optional — free from https://rawg.io/apidocs) OR leave `USE_RAWG_MOCK=true`

---

## Step 1 — Create Render Account

1. Go to https://render.com/register
2. Sign up with GitHub (recommended — simplifies repo connection)
3. Authorize Render to access your GitHub repositories

---

## Step 2 — New Blueprint Deploy

1. In the Render Dashboard, click **New** > **Blueprint**
2. Select your GitHub repo: `fiap-pixel-press`
3. Render detects `render.yaml` at the repo root automatically
4. Branch: `main` (or `atividade-2` if you want to deploy from that branch)
5. Click **Apply**

Render will parse `render.yaml` and show a preview of the two services it will create:
- `pixelpress-api` (Web Service)
- `pixelpress-web` (Static Site)

---

## Step 3 — Set Secret Environment Variables

Before clicking Deploy, set the `sync: false` secrets in the Render Dashboard.

For **pixelpress-api**, navigate to its Environment tab and add:

| # | Key | Value | Notes |
|---|-----|-------|-------|
| 1 | `JWT_SECRET` | (your secret string) | Min 32 random chars. Use: `openssl rand -hex 32` |
| 2 | `RAWG_API_KEY` | (your RAWG key) | Optional. If skipped, leave `USE_RAWG_MOCK=true` |

To generate JWT_SECRET locally:
```bash
openssl rand -hex 32
```

If you do NOT have a RAWG key, the default `USE_RAWG_MOCK=true` in `render.yaml` uses the local fixture data — the API still works for demo purposes.

---

## Step 4 — Deploy

1. Click **Apply** / **Deploy** in the Blueprint preview
2. Render queues both services for build + deploy
3. **Deploy pixelpress-api first** — the static site build works independently (URL is hardcoded), but testing requires the API to be live

Monitor build logs in real time via Dashboard > pixelpress-api > Logs.

### Expected build sequence for pixelpress-api:
```
npm install -g pnpm
pnpm install --frozen-lockfile
pnpm --filter pixelpress-backend exec prisma generate
pnpm --filter pixelpress-backend run build
```

### Expected start sequence for pixelpress-api:
```
cd api
npx prisma db push --skip-generate   # creates dev.db schema
npx prisma db seed                    # populates seed data
node dist/main.js                     # starts NestJS on $PORT
```

---

## Step 5 — Grab URLs

After successful deploy, note the following URLs from the Dashboard:

| # | Service | URL | Dashboard Location |
|---|---------|-----|--------------------|
| 1 | API | `https://pixelpress-api.onrender.com` | pixelpress-api > Settings > URL |
| 2 | Web | `https://pixelpress-web.onrender.com` | pixelpress-web > Settings > URL |
| 3 | API Service ID | `srv-xxxxxxxxxx` | pixelpress-api > Settings > Service ID |
| 4 | Web Service ID | `srv-xxxxxxxxxx` | pixelpress-web > Settings > Service ID |

Record the service IDs — they are needed if you set up CI/CD (deploy hooks via Render API).

---

## Step 6 — Smoke Test

### API health check (allow up to 60s for cold start):
```bash
# Health check via games endpoint (no auth required)
curl -s -o /dev/null -w "%{http_code}" https://pixelpress-api.onrender.com/api/v1/games
# Expected: 200

# Swagger UI
open https://pixelpress-api.onrender.com/api/docs
```

### Frontend:
```bash
# Open SPA
open https://pixelpress-web.onrender.com
# Expected: PixelPress login page loads, can register + login
```

### Full auth flow:
```bash
# Register
curl -s -X POST https://pixelpress-api.onrender.com/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","nome":"Test User","senha":"Test@1234"}'

# Login
curl -s -X POST https://pixelpress-api.onrender.com/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","senha":"Test@1234"}'
# Expected: access_token + refresh_token in response
```

---

## Outputs Contract

| # | Key | Value |
|---|-----|-------|
| 1 | `app_url` (API) | `https://pixelpress-api.onrender.com` |
| 2 | `app_url` (Web) | `https://pixelpress-web.onrender.com` |
| 3 | `service_id` (API) | Retrieved from Dashboard after deploy |
| 4 | `service_id` (Web) | Retrieved from Dashboard after deploy |

---

## Redeployment

On every `git push` to the connected branch, Render auto-redeploys both services.

**Important:** Because SQLite is ephemeral, every redeploy wipes the database and reseeds from scratch. Runtime data (reviews, library items added after seed) is lost. This is expected behavior for the MVP demo.

---

## If VITE_API_BASE_URL Changes

If the API service URL changes (e.g., you rename the service), you must:

1. Update `VITE_API_BASE_URL` in `render.yaml` (or in the pixelpress-web Environment tab in the Dashboard)
2. Trigger a new deploy for `pixelpress-web` (the static build must re-run to bake in the new URL)

This is the "two-step deploy" trade-off documented in README.md.
