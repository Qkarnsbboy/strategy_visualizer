"""Pydantic request/response models."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

OptionType = Literal["call", "put"]


class PriceRequest(BaseModel):
    spot: float = Field(..., gt=0)
    strike: float = Field(..., gt=0)
    time: float = Field(..., ge=0, description="Time to expiry in years")
    vol: float = Field(..., ge=0, description="Annualized volatility, e.g. 0.20 for 20%")
    rate: float = Field(..., description="Annualized risk-free rate, e.g. 0.05 for 5%")
    option_type: OptionType


class Greeks(BaseModel):
    delta: float
    gamma: float
    theta: float
    vega: float
    rho: float


class PriceResponse(BaseModel):
    price: float
    greeks: Greeks


class Leg(BaseModel):
    option_type: OptionType
    strike: float = Field(..., gt=0)
    quantity: float = Field(..., description="Signed: positive = long, negative = short")
    premium: float = Field(..., description="Per-contract premium paid (long) or received (short)")


class StrategyRequest(BaseModel):
    legs: list[Leg]
    spot_min: float = Field(..., gt=0)
    spot_max: float = Field(..., gt=0)
    steps: int = Field(101, ge=2, le=2000)


class PayoffPoint(BaseModel):
    spot: float
    pnl: float


class StrategyResponse(BaseModel):
    points: list[PayoffPoint]
