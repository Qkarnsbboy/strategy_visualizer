# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A full-stack options strategy visualizer. Two independent services:

- **Backend** — FastAPI on `:8000`. Real Black-Scholes pricing/Greeks; multi-leg strategy payoff is stubbed.
- **Frontend** — Vite + React + TypeScript + Tailwind v3 + Recharts on `:5173`. Placeholder UI only.

The repo is a fresh scaffold intended for iterative build-out. Most real product logic does not exist yet.

## Common commands

### Backend (from `backend/`)

```bash
# One-time setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run dev server (auto-reload)
source venv/bin/activate
uvicorn app.main:app --reload
```

Backend has no test suite, lint config, or build step yet. Manual smoke test:

```bash
curl http://localhost:8000/api/health
curl -X POST http://localhost:8000/api/price -H "Content-Type: application/json" \
  -d '{"spot":100,"strike":100,"time":1,"vol":0.2,"rate":0.05,"option_type":"call"}'
# Expected price ≈ 10.4506 (ATM 1y, 20% vol, 5% rate). Use this as a regression check
# any time pricing.py changes.
```

Interactive API docs: `http://localhost:8000/docs`.

### Frontend (from `frontend/`)

```bash
npm install        # one-time
npm run dev        # dev server on :5173
npm run build      # tsc + vite build → dist/
npm run preview    # serve the built output locally
```

No test suite, no lint config yet. `npm run build` is the only type-check entry point (`tsc` runs as part of it).

## Architecture

### The two services agree by a hand-maintained contract

`backend/app/models.py` (Pydantic v2) and `frontend/src/lib/api.ts` (TypeScript interfaces) describe the same JSON shapes. They are not generated from each other — when you change one, change the other in the same commit. The pairings are:

| Pydantic | TypeScript |
|---|---|
| `PriceRequest`, `PriceResponse`, `Greeks` | `PriceRequest`, `PriceResponse`, `Greeks` |
| `Leg`, `StrategyRequest`, `StrategyResponse`, `PayoffPoint` | same names |
| `Literal["call","put"]` | `"call" \| "put"` |

`option_type` is the discriminator everywhere. `Leg.quantity` is **signed** — positive = long, negative = short — so a strategy is just a list of legs with appropriate signs and premiums.

### Black-Scholes Greeks are pre-scaled

`backend/app/pricing.py::greeks` returns practical, trader-facing units, not raw BS units:

- `theta` — per **calendar day** (raw annual θ divided by 365)
- `vega` — per **1% vol move** (raw vega divided by 100)
- `rho`  — per **1% rate move** (raw ρ divided by 100)
- `delta`, `gamma` — unscaled

Any future tests or UI that compares against textbook BS values must account for this. The price function and Greeks both short-circuit to intrinsic value when `T <= 0` or `sigma <= 0` to avoid divide-by-zero.

### Where the work goes

When extending this codebase:

- **Strategy payoff logic** → `backend/app/strategies.py::compute_payoff`. Current implementation returns a flat-zero curve. Real logic iterates `req.legs`, computes per-leg payoff at each spot (intrinsic value for the option type, times signed `quantity`, minus `premium * quantity`), and sums across legs. Vectorize with numpy over the `np.linspace` spot grid that's already there.
- **New endpoints** → add the Pydantic models in `models.py`, the handler in `main.py`, and the typed TS wrapper in `api.ts`. The `request<T>` helper in `api.ts` handles fetch boilerplate.
- **New UI components** → `frontend/src/components/` (currently empty). `App.tsx` is the shell; data fetching goes through `lib/api.ts`, not direct `fetch` calls.

### CORS

`main.py` allows exactly `http://localhost:5173`. If you change the frontend dev port or add a deployed origin, update `allow_origins` in `main.py`.

### Frontend module layout assumption

`tsconfig.json` uses `"moduleResolution": "bundler"` and `"jsx": "react-jsx"`. There's no Babel — Vite handles transforms. Don't add `import React from "react"` in components (the new JSX transform makes it unnecessary).

## Layout reference

```
backend/app/
  main.py        FastAPI app, CORS, route registration
  pricing.py     Black-Scholes price + Greeks (the only real logic)
  strategies.py  Multi-leg payoff (stub — returns flat curve)
  models.py      Pydantic request/response models
frontend/src/
  App.tsx        Shell UI (placeholder card, no real UI)
  lib/api.ts     Typed fetch client mirroring backend models
  components/    Empty
```
