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
| Stage | **002 — Web skeleton** |
| Production-ready? | No — early scaffolding |
| Implemented | Next.js 15 App Router, Tailwind, `NEXT_PUBLIC_API_URL`, home page live `/health` check |
| Next | Boards UI, upload, practice session screen |

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Data fetching (later) | TanStack Query |
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
- Running `pin-me-api` on `http://localhost:8000` (for the health check)
- Git

### 1. Enter the repo

```bash
cd pin-me-web
```

### 2. Environment file

```bash
cp .env.example .env.local
```

Default:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The home page should show API health `ok` when the backend is up.

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
│   ├── components/   # client UI (API health status)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── .env.example
├── next.config.ts
└── package.json
```

---

## Stages / changelog

| Stage | Date | Summary |
|-------|------|---------|
| 002 | 2026-10-03 | Web skeleton: Next.js 15, Tailwind, env, live `/health` UI |

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
