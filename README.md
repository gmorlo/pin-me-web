# PinMe Web

Frontend for **PinMe** — timed drawing practice from personal reference boards, with progress tracking and (later) practice analytics.

Companion API: `pin-me-api`  
Product docs hub (private/local): `pin-me`

---

## Problem

Artists keep reference images in messy folders, then redraw the same favorites. PinMe helps you:

- organize references into boards,
- run timed practice sessions,
- mark images **Complete** or **Skip**,
- practice only from the **available** pool until a board reset,
- later: stats (GitHub-style heatmap) and user-owned Drive/Pinterest media.

This repository is the **Next.js UI**. Domain logic and persistence live in `pin-me-api`.

---

## Current status

| Item | State |
|------|--------|
| Stage | **006 — Split from portfolio hub** |
| Production-ready? | No — early scaffolding |
| Implemented | Next.js 15, Tailwind, TanStack Query, boards + practice UI at `/`, API health panel |
| Next | Local Compose smoke; auth; cloud harden |

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Data fetching | TanStack Query |
| Practice UI state (later) | Zustand |
| UI kit (later) | shadcn/ui |
| Deploy target | Vercel |

---

## Architecture (sketch)

```text
Browser (this repo)
        │ REST
        ▼
   PinMe API (pin-me-api)
        ├── PostgreSQL
        └── S3-compatible bootstrap storage
```

---

## Getting started

### Prerequisites

- Node.js LTS (18+)
- Git
- **Docker Desktop** + running `pin-me-api` (Postgres, S3 mock, uvicorn on port **8000**) — see that repo’s README first

### Local run — command by command (Windows)

You need **two stacks**: API (+ Docker) in one terminal, this web app in another.

#### 0) Start Docker Desktop + API first

1. Open **Docker Desktop** and wait until the engine is running.
2. In a terminal, follow **pin-me-api** README steps in order:
   - `docker compose up -d`
   - venv + `pip install -r requirements-dev.txt` (once)
   - `alembic upgrade head`
   - `uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`
3. Confirm API health: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health) → `{"status":"ok"}`

Leave that uvicorn terminal running.

#### 1) Open this project folder (second terminal)

Run every command below from the `pin-me-web` root (the folder that contains `package.json`).

#### 2) Env file (once)

**cmd**

```bat
copy .env.example .env.local
```

**PowerShell**

```powershell
Copy-Item .env.example .env.local
```

Default contents:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_PORTFOLIO_URL=http://localhost:3000
```

**Ports:** run **portfolio-web** on `:3000` and this app on `:3001` so the hub’s `NEXT_PUBLIC_PINME_URL` matches.

#### 3) Install dependencies (once, or after package.json changes)

```bat
npm install
```

#### 4) Start the web app (leave this running)

```bat
npm run dev
```

(`package.json` binds the app to port **3001** so portfolio can use **3000**.)

#### 5) Open in the browser

| Page | URL |
|------|-----|
| PinMe home + API health | [http://localhost:3001](http://localhost:3001) |
| Boards | [http://localhost:3001/boards](http://localhost:3001/boards) |
| Portfolio hub | [http://localhost:3000](http://localhost:3000) (`portfolio-web`) |

On the home page, the health panel should show `ok`. Then **Open boards** → create a board → upload JPEG/PNG/WebP (max 5 MB).

### Typical daily startup (after first-time setup)

1. Start **Docker Desktop** (wait for engine).
2. Terminal A — in `pin-me-api`:

```bat
docker compose up -d
.\.venv\Scripts\uvicorn.exe app.main:app --reload --host 127.0.0.1 --port 8000
```

3. Terminal B — in `pin-me-web`:

```bat
npm run dev
```

4. (Optional) Terminal C — in `portfolio-web`: `npm run dev` → [http://localhost:3000](http://localhost:3000)

5. Browser → [http://localhost:3001](http://localhost:3001)

### Quick troubleshooting

| Symptom | Fix |
|---------|-----|
| Health panel “unreachable” / cannot reach API | Start uvicorn in `pin-me-api`; check `NEXT_PUBLIC_API_URL` |
| Boards work, upload fails | Ensure `docker compose` S3 service is up (`pinme-s3`); see API README |
| Docker pipe / engine errors | Start/restart Docker Desktop before `docker compose up -d` |
| Port 3001 busy | `npm run dev -- --port 3002` and update portfolio `NEXT_PUBLIC_PINME_URL` |
---

## Testing / smoke

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Manual: with API running, open `/` and confirm the connectivity panel shows `status: ok` (or a clear error if the API is down).

---

## Project structure

```text
pin-me-web/
├── app/
│   ├── boards/          # list + board detail / upload
│   ├── components/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/api.ts
├── .env.example
├── next.config.ts
└── package.json
```

---

## Stages / changelog

| Stage | Date | Summary |
|-------|------|---------|
| 002 | 2026-10-03 | Web skeleton: Next.js 15, Tailwind, env, live `/health` UI |
| 003 | 2026-10-03 | Boards list/detail + LOCAL_UPLOAD grid (TanStack Query) |
| 003a | 2026-10-07 | Board settings form (edit name/description; modular for future source links) |
| 004 | 2026-10-08 | Practice UI: start form, timer (Zustand), Complete/Skip, summary, reset |
| 005 | 2026-10-25 | (superseded) Portfolio hub nested in this repo under `/pinme` |
| 006 | 2026-10-25 | Split: PinMe restored to `/`; hub lives in `portfolio-web` |
| 007 | 2026-10-25 | Login (Google + local allowlist), session cookie, protected boards/practice |

---

## Deploy notes

- Vercel project for this repo stays on `*.vercel.app` (or later `pinme.francke.tech`).
- Public hub domain **francke.tech** is owned by **`portfolio-web`**, not this repo.
- Set `NEXT_PUBLIC_PORTFOLIO_URL=https://francke.tech` in production.

---

## Roadmap (Web)

- Local Compose practice smoke (when Docker available)
- Resume unfinished sessions
- Stats dashboard with activity heatmap
- Cloud API harden (Railway migrations + R2); Drive/Pinterest import later (V3)

---

## Related repositories

| Repo | Role |
|------|------|
| `portfolio-web` | Public francke.tech hub |
| `pin-me-api` | FastAPI backend |
| `pin-me` | Private/local product docs hub |

---

## License

Personal / portfolio project — license TBD.
