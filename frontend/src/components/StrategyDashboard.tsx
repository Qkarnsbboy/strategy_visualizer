import { useEffect, useState } from "react";
import { postPrice, postStrategy, type Leg, type PayoffPoint } from "../lib/api";
import LegEditor, { type LegForm, type MarketForm, type RangeForm } from "./LegEditor";
import PayoffChart from "./PayoffChart";
import GreeksPanel, { type AggregateGreeks } from "./GreeksPanel";

const INITIAL_LEGS: LegForm[] = [
  { option_type: "call", strike: "100", quantity: "1", premium: "10.45" },
];
const INITIAL_MARKET: MarketForm = { spot: "100", vol: "0.20", rate: "0.05", time: "1" };

/** Pad the min/max strikes outward to a sensible plotting window. */
function autoRangeFrom(legs: LegForm[]): RangeForm {
  const strikes = legs.map((l) => parseFloat(l.strike)).filter((s) => !isNaN(s) && s > 0);
  if (strikes.length === 0) return { spot_min: "80", spot_max: "120", steps: "101" };
  const lo = Math.min(...strikes);
  const hi = Math.max(...strikes);
  return {
    spot_min: String(Math.max(0, Math.floor((lo * 0.7) / 5) * 5)),
    spot_max: String(Math.ceil((hi * 1.3) / 5) * 5),
    steps: "101",
  };
}

export default function StrategyDashboard() {
  const [legs, setLegs] = useState<LegForm[]>(INITIAL_LEGS);
  const [market, setMarket] = useState<MarketForm>(INITIAL_MARKET);
  const [range, setRange] = useState<RangeForm>(autoRangeFrom(INITIAL_LEGS));

  const [points, setPoints] = useState<PayoffPoint[] | null>(null);
  const [greeks, setGreeks] = useState<AggregateGreeks | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateLeg<K extends keyof LegForm>(i: number, key: K, value: LegForm[K]) {
    setLegs((prev) => prev.map((leg, j) => (j === i ? { ...leg, [key]: value } : leg)));
  }
  function addLeg() {
    setLegs((prev) => [
      ...prev,
      { option_type: "call", strike: "100", quantity: "-1", premium: "5.00" },
    ]);
  }
  function removeLeg(i: number) {
    setLegs((prev) => prev.filter((_, j) => j !== i));
  }
  function updateMarket<K extends keyof MarketForm>(key: K, value: MarketForm[K]) {
    setMarket((prev) => ({ ...prev, [key]: value }));
  }
  function updateRange<K extends keyof RangeForm>(key: K, value: RangeForm[K]) {
    setRange((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const parsedLegs: Leg[] = legs.map((l) => ({
        option_type: l.option_type,
        strike: parseFloat(l.strike),
        quantity: parseFloat(l.quantity),
        premium: parseFloat(l.premium),
      }));
      const m = {
        spot: parseFloat(market.spot),
        vol: parseFloat(market.vol),
        rate: parseFloat(market.rate),
        time: parseFloat(market.time),
      };

      const [strategyRes, legPrices] = await Promise.all([
        postStrategy({
          legs: parsedLegs,
          spot_min: parseFloat(range.spot_min),
          spot_max: parseFloat(range.spot_max),
          steps: Math.round(parseFloat(range.steps)),
        }),
        // A strategy's Greeks are the sum of its legs' — price each leg, scale by signed qty.
        Promise.all(
          parsedLegs.map((leg) =>
            postPrice({
              spot: m.spot,
              strike: leg.strike,
              time: m.time,
              vol: m.vol,
              rate: m.rate,
              option_type: leg.option_type,
            })
          )
        ),
      ]);

      const agg: AggregateGreeks = {
        delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0, netValue: 0, netPremium: 0,
      };
      legPrices.forEach((res, i) => {
        const q = parsedLegs[i].quantity;
        agg.delta += res.greeks.delta * q;
        agg.gamma += res.greeks.gamma * q;
        agg.theta += res.greeks.theta * q;
        agg.vega += res.greeks.vega * q;
        agg.rho += res.greeks.rho * q;
        agg.netValue += res.price * q;
        agg.netPremium += parsedLegs[i].premium * q;
      });

      setPoints(strategyRes.points);
      setGreeks(agg);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  // Plot the default strategy once on load so the dashboard isn't empty.
  useEffect(() => {
    void handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <LegEditor
          legs={legs}
          market={market}
          range={range}
          loading={loading}
          error={error}
          onLegChange={updateLeg}
          onAddLeg={addLeg}
          onRemoveLeg={removeLeg}
          onMarketChange={updateMarket}
          onRangeChange={updateRange}
          onAutoRange={() => setRange(autoRangeFrom(legs))}
          onSubmit={handleSubmit}
        />
      </div>
      <div className="lg:col-span-8">
        <PayoffChart points={points} />
      </div>
      <div className="lg:col-span-12">
        <GreeksPanel data={greeks} />
      </div>
    </div>
  );
}
