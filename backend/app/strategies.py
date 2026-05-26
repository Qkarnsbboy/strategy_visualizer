"""Multi-leg strategy payoff at expiry.

P&L for a single leg at a given underlying price S is::

    quantity * (intrinsic(S) - premium)

where ``quantity`` is signed (positive = long, negative = short), so a long leg
pays its premium and a short leg receives it. The strategy P&L is the sum across
legs. Computed vectorized over the spot grid.
"""

from __future__ import annotations

import numpy as np

from .models import PayoffPoint, StrategyRequest, StrategyResponse


def compute_payoff(req: StrategyRequest) -> StrategyResponse:
    spots = np.linspace(req.spot_min, req.spot_max, req.steps)
    pnl = np.zeros_like(spots)
    for leg in req.legs:
        if leg.option_type == "call":
            intrinsic = np.maximum(spots - leg.strike, 0.0)
        else:
            intrinsic = np.maximum(leg.strike - spots, 0.0)
        pnl += leg.quantity * (intrinsic - leg.premium)
    points = [PayoffPoint(spot=float(s), pnl=float(p)) for s, p in zip(spots, pnl)]
    return StrategyResponse(points=points)
