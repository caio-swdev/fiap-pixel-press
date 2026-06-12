# PixelPress — Infrastructure as Code

## Topology

```
                  ┌─────────────────────────────────────┐
                  │          Render.com (free tier)      │
                  │                                      │
  Browser ──────► │  pixelpress-web (Static Site / CDN)  │
                  │  https://pixelpress-web.onrender.com  │
                  │                                      │
                  │       VITE_API_BASE_URL ──────────►  │
                  │                                      │
                  │  pixelpress-api (Web Service / Node) │
                  │  https://pixelpress-api.onrender.com  │
                  │   ├─ NestJS 10 + Prisma 5            │
                  │   ├─ SQLite (ephemeral, /prisma/dev.db)│
                  │   └─ CORS ← CORS_ORIGIN env var      │
                  └─────────────────────────────────────┘
```

## IaC Artifact

| File | Purpose |
|------|---------|
| `/render.yaml` | Render Blueprint Spec — single source of truth for both services |

Render does not use Terraform or Pulumi. The Blueprint YAML is the IaC artifact.

## Why $0 / Free Tier

This is an academic assignment (FIAP MVP) requiring zero infrastructure cost. The free tier fully covers the demo use case.

## Trade-offs (Accepted)

| Trade-off | Impact | Mitigation |
|-----------|--------|------------|
| API cold start ~50s after 15 min idle | First request after idle wakes the service | Upgrade to $7/mo paid plan for always-on |
| Ephemeral SQLite filesystem | dev.db wiped on every restart or redeploy | startCommand runs `prisma db push` + `prisma db seed` on each boot. Runtime data (reviews, library items) is NOT persisted. Acceptable for demo. |
| Vite bakes VITE_API_BASE_URL at build time | Cannot use Render's `fromService` dynamic reference for static sites | URL hardcoded as `https://pixelpress-api.onrender.com/api/v1`. Two-step deploy required if API URL changes (deploy API first, then frontend). |
| pnpm workspace on Render native Node | Render native Node runtime sets rootDir as working dir. pnpm must be installed as part of buildCommand. | Build command: `npm install -g pnpm && pnpm install --frozen-lockfile && ...` |
| No persistent DB on free plan | Cannot upgrade to persistent disk without paid plan | Acceptable for MVP demo. Production deployment would require migration to Postgres (paid add-on) or an external DB. |

## Deploy Order

1. Deploy `pixelpress-api` first (API must be live before frontend can be tested).
2. Deploy `pixelpress-web` after API is healthy (Vite build bakes the API URL).

## Secrets (Dashboard Only — Never Committed)

| Variable | Where to Set | Notes |
|----------|-------------|-------|
| `JWT_SECRET` | Render Dashboard > pixelpress-api > Environment | Min 32 random chars |
| `RAWG_API_KEY` | Render Dashboard > pixelpress-api > Environment | Free key from rawg.io/apidocs. Leave USE_RAWG_MOCK=true if not set. |

## Services

| Service | URL | Plan | Region |
|---------|-----|------|--------|
| pixelpress-api | https://pixelpress-api.onrender.com | Free | Oregon |
| pixelpress-web | https://pixelpress-web.onrender.com | Free | Oregon |

## Further Reading

- [Render Blueprint Spec](https://render.com/docs/blueprint-spec)
- [Render Free Plan limits](https://render.com/docs/free)
- `documentation/iac/03-deployment/setup-log.md` — execution log
- `documentation/iac/03-deployment/_active.md` — current provider state
