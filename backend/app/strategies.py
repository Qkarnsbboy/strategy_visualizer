"""Multi-leg strategy payoff construction. Real leg combination logic TBD."""

from __future__ import annotations

import numpy as np

from .models import PayoffPoint, StrategyRequest, StrategyResponse


def compute_payoff(req: StrategyRequest) -> StrategyResponse:
    spots = np.linspace(req.spot_min, req.spot_max, req.steps)
    pnl = np.zeros_like(spots)
    points = [PayoffPoint(spot=float(s), pnl=float(p)) for s, p in zip(spots, pnl)]
    return StrategyResponse(points=points)
