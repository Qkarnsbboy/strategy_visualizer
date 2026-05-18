"""Black-Scholes pricing and Greeks for European options."""

from __future__ import annotations

import math
from typing import Literal

from scipy.stats import norm

OptionType = Literal["call", "put"]


def _d1_d2(S: float, K: float, T: float, sigma: float, r: float) -> tuple[float, float]:
    vol_sqrt_t = sigma * math.sqrt(T)
    d1 = (math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / vol_sqrt_t
    d2 = d1 - vol_sqrt_t
    return d1, d2


def price(S: float, K: float, T: float, sigma: float, r: float, option_type: OptionType) -> float:
    if T <= 0 or sigma <= 0:
        intrinsic = max(S - K, 0.0) if option_type == "call" else max(K - S, 0.0)
        return intrinsic

    d1, d2 = _d1_d2(S, K, T, sigma, r)
    discount = math.exp(-r * T)
    if option_type == "call":
        return S * norm.cdf(d1) - K * discount * norm.cdf(d2)
    return K * discount * norm.cdf(-d2) - S * norm.cdf(-d1)


def greeks(S: float, K: float, T: float, sigma: float, r: float, option_type: OptionType) -> dict[str, float]:
    """Return Greeks scaled for practical use:
    - delta: per $1 spot move
    - gamma: per $1 spot move
    - theta: per calendar day (annual / 365)
    - vega:  per 1% volatility move (annual / 100)
    - rho:   per 1% rate move (annual / 100)
    """
    if T <= 0 or sigma <= 0:
        if option_type == "call":
            delta = 1.0 if S > K else (0.5 if S == K else 0.0)
        else:
            delta = -1.0 if S < K else (-0.5 if S == K else 0.0)
        return {"delta": delta, "gamma": 0.0, "theta": 0.0, "vega": 0.0, "rho": 0.0}

    d1, d2 = _d1_d2(S, K, T, sigma, r)
    pdf_d1 = norm.pdf(d1)
    discount = math.exp(-r * T)
    sqrt_t = math.sqrt(T)

    gamma = pdf_d1 / (S * sigma * sqrt_t)
    vega_annual = S * pdf_d1 * sqrt_t

    if option_type == "call":
        delta = norm.cdf(d1)
        theta_annual = -(S * pdf_d1 * sigma) / (2 * sqrt_t) - r * K * discount * norm.cdf(d2)
        rho_annual = K * T * discount * norm.cdf(d2)
    else:
        delta = norm.cdf(d1) - 1.0
        theta_annual = -(S * pdf_d1 * sigma) / (2 * sqrt_t) + r * K * discount * norm.cdf(-d2)
        rho_annual = -K * T * discount * norm.cdf(-d2)

    return {
        "delta": delta,
        "gamma": gamma,
        "theta": theta_annual / 365.0,
        "vega": vega_annual / 100.0,
        "rho": rho_annual / 100.0,
    }
