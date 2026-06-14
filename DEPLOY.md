# Deploy

Split deploy: **backend → Render**, **frontend → Vercel/Netlify**. The backend
streams Server-Sent Events (the live agent trajectory), so it must run as a real
server — not a serverless function (those buffer SSE and time out).

## 1. Backend → Render

1. Push this repo to GitHub.
2. Render → **New + → Blueprint**, select the repo. It reads `render.yaml`.
3. Set env vars in the dashboard:
   - `GEMINI_API_KEY` — required for the real Gemini provider.
   - `ANTHROPIC_API_KEY` — optional; enables the real Claude provider (mocks without it).
   - `ALLOWED_ORIGINS` — your frontend URL, e.g. `https://your-app.vercel.app`.
4. Deploy. Note the URL, e.g. `https://vectorshift-backend.onrender.com`.

> Free instances cold-start (~50s) after idle. Saved agents persist to
> `backend/data/agents.json` on the instance disk, which is ephemeral on the free
> plan — localStorage in the browser remains the source of truth. Add a Render
> disk mounted at `backend/data` for durable cross-device sync.

## 2. Frontend → Vercel

1. Vercel → **New Project**, import the repo, set **Root Directory** to `frontend`.
   (CRA is auto-detected: build `npm run build`, output `build`.)
2. Add env var `REACT_APP_API_URL` = your Render backend URL.
3. Deploy.

## 3. Wire CORS

Set the backend's `ALLOWED_ORIGINS` to the deployed frontend origin and redeploy
the backend (or add both the Vercel URL and `http://localhost:3000` for local dev).

## Local dev

```bash
# backend
cd backend && python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add your keys
uvicorn app.main:app --reload

# frontend
cd frontend && npm install && npm start   # proxies to http://localhost:8000
```
