"""FastAPI application entry point."""

from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .models import Greeks, PriceRequest, PriceResponse, StrategyRequest, StrategyResponse
from .pricing import greeks, price
from .strategies import compute_payoff

# The local Vite dev server. Always allowed so local development keeps working.
LOCAL_DEV_ORIGIN = "http://localhost:5173"


def get_allowed_origins() -> list[str]:
    """Return the browser origins that may call this API.

    Reads ALLOWED_ORIGINS, a comma-separated list such as
    "https://my-app.vercel.app,https://other.example.com".
    The local dev origin is always included.
    """
    origins = [LOCAL_DEV_ORIGIN]

    raw_value = os.environ.get("ALLOWED_ORIGINS", "")
    for item in raw_value.split(","):
        # Remove spaces and a trailing slash, because the browser sends neither.
        origin = item.strip().rstrip("/")
        if origin and origin not in origins:
            origins.append(origin)

    return origins


app = FastAPI(title="Strategy Visualizer API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/price", response_model=PriceResponse)
def price_endpoint(req: PriceRequest) -> PriceResponse:
    args = (req.spot, req.strike, req.time, req.vol, req.rate, req.option_type)
    return PriceResponse(price=price(*args), greeks=Greeks(**greeks(*args)))


@app.post("/api/strategy", response_model=StrategyResponse)
def strategy_endpoint(req: StrategyRequest) -> StrategyResponse:
    return compute_payoff(req)
