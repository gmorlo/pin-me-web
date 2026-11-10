# PinMe Web: local setup

Step-by-step local run on Windows. For the project overview see the [README](../README.md).

## Local setup (Windows)

### Prerequisites

- Node.js LTS (18+)
- Git
- **Docker Desktop** + running `pin-me-api` (Postgres, S3 mock, uvicorn on port **8000**) — see that repo’s README first

### Local run — command by command (Windows)

You need **two stacks**: API (+ Docker) in one terminal, this web app in another.

#### 0) Start Docker Desktop + API first

1. Open **Docker Desktop** and wait until the engine is running.
2. In a terminal, follow the **pin-me-api** setup guide (`docs/setup.md`) steps in order:
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
API_ORIGIN=http://localhost:8000
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
| Health panel “unreachable” / cannot reach API | Start uvicorn in `pin-me-api`; check `API_ORIGIN` |
| Boards work, upload fails | Ensure `docker compose` S3 service is up (`pinme-s3`); see API README |
| Docker pipe / engine errors | Start/restart Docker Desktop before `docker compose up -d` |
| Port 3001 busy | `npm run dev -- --port 3002` and update portfolio `NEXT_PUBLIC_PINME_URL` |
