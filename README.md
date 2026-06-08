# Would You Date Me? ✦

An interactive, mobile-first website to ask someone out on a first date. She answers,
picks the activity, time and place, leaves an optional note — and you get a **push
notification (ntfy)** the moment she replies.

All the personal content (her name, copy, venues, your song) lives in a **`config.json`
that is NOT in this repo** — it's provided at runtime. So the code can be public while
the date stays private.

## Stack
- **Frontend:** React + Vite + Framer Motion + GSAP (PT-BR, mobile-first)
- **Backend:** Hono on Bun — `POST /api/answer`, `GET /api/health`
- **Persistence:** SQLite (`bun:sqlite`) + backup `answers.jsonl`
- **Notification:** ntfy → phone
- **CI/Deploy:** GitHub Actions builds → GHCR → Dokploy pulls the image

## Structure
```
frontend/   React app
  public/config.example.json   template (committed)
  public/config.json           your real content (gitignored, runtime-mounted)
backend/    Hono/Bun API + storage + ntfy
Dockerfile  multi-stage: build frontend → Bun serves static + API
docker-compose.yml            Compose for Dokploy (image from GHCR)
.github/workflows/build.yml   CI: build & push image to GHCR
.env.example  NTFY_URL / NTFY_TOPIC / NTFY_TOKEN / NOTIFY_NAME
```

## The content file: `config.json`
Everything user-facing is data-driven. `frontend/public/config.json` defines:
- `girlName`, `theme` (song), all `copy`
- `activities` (with `buckets`: which time-of-day each is valid for)
- `slots` (days + times)
- `venues` (per activity → time bucket → list)

Time buckets are derived from the chosen time:
`manha` 08–11 · `almoco` 12–13 · `tarde` 14–17 · `noite` 18+.

> This file is **gitignored**. Start from the template:
> ```bash
> cp frontend/public/config.example.json frontend/public/config.json
> ```
> Then edit it with the real content. In production it's mounted at runtime (see Deploy).

## Run locally — one command
Needs [Bun](https://bun.sh). From the repo root:
```bash
bun run setup   # once: install deps (root + backend + frontend)

bun run dev     # hot-reload → API :3000, site :5173
bun run start   # prod-sim → build + serve on :3000 with .env (ntfy fires)
bun run docker  # full container via docker compose
```
- `bun run dev` → open `http://localhost:5173`. Phone (same wifi): `http://<pc-ip>:5173`.
- ntfy not set in dev? The push is skipped with a warning — flow still works.

## Deploy (Dokploy, image from GHCR)
The build runs on **GitHub Actions** (so the deploy host needs no npm/network for builds);
Dokploy just pulls the prebuilt image. Dokploy's embedded Traefik handles domain + HTTPS.

1. **Push to `main`** → the Action builds and publishes `ghcr.io/<owner>/wouldyoudateme:latest`.
2. **Make the image pullable:** GitHub → Packages → `wouldyoudateme` → Package settings →
   set **Public** (simplest), or keep private and add a GHCR registry (PAT `read:packages`)
   in Dokploy / `docker login ghcr.io` on the host.
3. **Dokploy app** (Compose) → repo + `docker-compose.yml` (uses `image:`, no build).
4. **Environment** (runtime, not build secrets):
   ```
   NTFY_URL=https://ntfy.example.com
   NTFY_TOPIC=my-topic
   NTFY_TOKEN=...        # optional
   NOTIFY_NAME=Fulana    # name shown in the push title
   ```
5. **Mount the real config** — Dokploy → Advanced → **Volumes / File Mount**:
   mount your `config.json` content at **`/app/public/config.json`** (read-only).
   This keeps personal content off GitHub. (Without it, the site falls back to
   `config.example.json`.)
6. **Domain** → `<your-domain>`, **Container Port 3000**, HTTPS on. **Deploy.**

Redeploy later: `git push` rebuilds the image on GitHub → **Redeploy** in Dokploy.

### Env vars vs Build Secrets
Use **Environment Variables** (runtime). The backend reads `NTFY_*` / `NOTIFY_NAME` via
`process.env`. The build needs **no** secrets — Actions uses the automatic `GITHUB_TOKEN`
only to publish to GHCR.

### Data persistence
Answers persist in `./data` (`answers.db` + `answers.jsonl`), mounted via the compose
volume. In Dokploy confirm `./data` (or a named volume) survives redeploys.

## What gets pushed to your phone
```
Title: <NOTIFY_NAME> respondeu!
Resposta: SIM! 🎉
Programa: Jantar
Quando: Sexta às 19:00
Onde: <lugar> (<bairro>)
Recado: "..."
Em: 07/06/2026 19:01
```
Install the ntfy app and subscribe to `NTFY_TOPIC`.
