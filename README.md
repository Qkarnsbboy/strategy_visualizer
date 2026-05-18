# Strategy Visualizer

A full-stack options strategy visualizer.

- **Backend**: FastAPI + Black-Scholes pricing/Greeks on `http://localhost:8000`
- **Frontend**: Vite + React + TypeScript + Tailwind + Recharts on `http://localhost:5173`

## Backend

Setup (one-time):

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Run:

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`. Interactive docs: `http://localhost:8000/docs`.

## Frontend

Setup (one-time):

```bash
cd frontend
npm install
```

Run:

```bash
cd frontend
npm run dev
```

The dev server runs at `http://localhost:5173`.

## Smoke test

With the backend running:

```bash
curl http://localhost:8000/api/health
# {"status":"ok"}

curl -X POST http://localhost:8000/api/price \
  -H "Content-Type: application/json" \
  -d '{"spot":100,"strike":100,"time":1,"vol":0.2,"rate":0.05,"option_type":"call"}'
# {"price":~10.45,"greeks":{...}}
```

## Endpoints

- `GET  /api/health` — liveness
- `POST /api/price` — Black-Scholes price + Greeks for a single option
- `POST /api/strategy` — payoff curve for a multi-leg strategy (stub, returns flat curve for now)

## Layout

```
backend/app/
  main.py        FastAPI app, CORS, routes
  pricing.py     Black-Scholes price + Greeks (real)
  strategies.py  Multi-leg payoff (stub)
  models.py      Pydantic request/response models

frontend/src/
  App.tsx        Shell UI (placeholder)
  main.tsx       React entry
  lib/api.ts     Typed fetch helper for the backend
  components/    (empty)
```
