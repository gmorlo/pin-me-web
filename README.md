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
| Stage | **003 — Boards + upload** |
| Production-ready? | No — early scaffolding |
| Implemented | Next.js 15, Tailwind, TanStack Query, `/boards` list/create, board detail upload + grid, board settings edit, API health panel |
| Next | Practice session UI (timer, Complete/Skip, summary) |

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
```

#### 3) Install dependencies (once, or after package.json changes)

```bat
npm install
```

#### 4) Start the web app (leave this running)

```bat
npm run dev
```

#### 5) Open in the browser

| Page | URL |
|------|-----|
| Home + API health | [http://localhost:3000](http://localhost:3000) |
| Boards | [http://localhost:3000/boards](http://localhost:3000/boards) |

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

4. Browser → [http://localhost:3000](http://localhost:3000)

### Quick troubleshooting

| Symptom | Fix |
|---------|-----|
| Health panel “unreachable” / cannot reach API | Start uvicorn in `pin-me-api`; check `NEXT_PUBLIC_API_URL` |
| Boards work, upload fails | Ensure `docker compose` S3 service is up (`pinme-s3`); see API README |
| Docker pipe / engine errors | Start/restart Docker Desktop before `docker compose up -d` |
| Port 3000 busy | `npm run dev -- --port 3001` (then open that port) |
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

---

## Roadmap (Web)

- Boards list / detail + bootstrap image upload
- Practice session UI (timer, Complete / Skip, summary)
- Auth screens + resume unfinished sessions
- Stats dashboard with activity heatmap
- Deploy to Vercel against Railway API

---

## Related repositories

| Repo | Role |
|------|------|
| `pin-me-api` | FastAPI backend |
| `pin-me` | Private/local product docs hub (not the public portfolio face) |

---

## License

Personal / portfolio project — license TBD.
