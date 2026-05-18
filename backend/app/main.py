"""FastAPI application entry point."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .models import Greeks, PriceRequest, PriceResponse, StrategyRequest, StrategyResponse
from .pricing import greeks, price
from .strategies import compute_payoff

app = FastAPI(title="Strategy Visualizer API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
