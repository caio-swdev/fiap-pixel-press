# Deployment Setup Log

## Entry format: `[date] what → why → result`

---

### 2026-06-11 — IaC Files Authored (agent-swe-devops-iac / deploy workflow)

**What:** Created `render.yaml` Blueprint Spec at repo root with two services:
  - `pixelpress-api` (Node web service, free, Oregon)
  - `pixelpress-web` (Static site, CDN, Oregon)

**Why:** Free-tier Render Blueprint is the chosen IaC artifact for this $0 assignment deploy. No Terraform/Pulumi required — Render's native Blueprint YAML declares the full topology.

**Result:** File created at `/render.yaml`. Not yet deployed — awaiting user to connect repo in Render Dashboard and set secrets.

---

**What:** CORS patch applied to `src/api/src/main.ts`.

**Why:** The Vite dev proxy worked around CORS in development. In production, the React SPA runs on a different origin (`pixelpress-web.onrender.com`) from the API (`pixelpress-api.onrender.com`). Browser preflight requests would fail without explicit CORS headers from the API.

**Result:** Added `app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true, credentials: true })` after `app.setGlobalPrefix`. `CORS_ORIGIN=https://pixelpress-web.onrender.com` set in `render.yaml`.

---

**What:** Added `CORS_ORIGIN` to `src/api/.env.example`.

**Why:** Document the new env var for local dev and production. Default value `http://localhost:5173` (Vite dev server) preserves local dev experience.

**Result:** `.env.example` updated with comment explaining the production value.

---

**What:** Created documentation at `documentation/iac/` (README.md, 03-deployment/_active.md, 03-deployment/setup-log.md).

**Why:** Per deploy workflow Phase 04 — topology, trade-offs, runbook, and status tracking are primary deliverables.

**Result:** Files written. See README.md for full topology diagram and dashboard runbook.

---

### Next entry: after first successful Render deploy

Record:
- Render service IDs (from Dashboard > Service > Settings)
- Actual API cold start time observed
- Seed data verification result
- Any build errors encountered and resolutions
