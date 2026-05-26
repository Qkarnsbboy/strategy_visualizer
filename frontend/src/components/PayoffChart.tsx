import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PayoffPoint } from "../lib/api";
import Panel from "./ui/Panel";

const PROFIT = "#22c55e";
const LOSS = "#f43f5e";
const ACCENT = "#ffae00";

/** Linear-interpolate the spot prices where the P&L curve crosses zero. */
function breakevens(points: PayoffPoint[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (a.pnl === 0) out.push(a.spot);
    if ((a.pnl < 0 && b.pnl > 0) || (a.pnl > 0 && b.pnl < 0)) {
      const t = a.pnl / (a.pnl - b.pnl);
      out.push(a.spot + t * (b.spot - a.spot));
    }
  }
  return out;
}

export default function PayoffChart({ points }: { points: PayoffPoint[] | null }) {
  if (!points || points.length === 0) {
    return (
      <Panel title="Payoff at Expiry" className="h-full">
        <div className="flex h-full min-h-[20rem] items-center justify-center font-mono text-xs text-ink-faint">
          Build a strategy and hit Plot to see its payoff diagram.
        </div>
      </Panel>
    );
  }

  const values = points.map((p) => p.pnl);
  const max = Math.max(...values);
  const min = Math.min(...values);
  // Where y=0 sits as a fraction from the top of the plot, for the gradient split.
  const offset = max <= 0 ? 0 : min >= 0 ? 1 : max / (max - min);
  const be = breakevens(points);

  return (
    <Panel
      title="Payoff at Expiry"
      right={
        <span className="font-mono">
          max <span className="text-profit">+{max.toFixed(2)}</span> · min{" "}
          <span className="text-loss">{min.toFixed(2)}</span>
        </span>
      }
      className="h-full"
    >
      <div className="h-full min-h-[20rem]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 24, right: 16, bottom: 4, left: 0 }}>
            <defs>
              <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset={0} stopColor={PROFIT} stopOpacity={0.45} />
                <stop offset={offset} stopColor={PROFIT} stopOpacity={0.05} />
                <stop offset={offset} stopColor={LOSS} stopOpacity={0.05} />
                <stop offset={1} stopColor={LOSS} stopOpacity={0.45} />
              </linearGradient>
              <linearGradient id="pnlStroke" x1="0" y1="0" x2="0" y2="1">
                <stop offset={offset} stopColor={PROFIT} stopOpacity={1} />
                <stop offset={offset} stopColor={LOSS} stopOpacity={1} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#2a2a31" strokeDasharray="2 4" />
            <XAxis
              dataKey="spot"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(v: number) => v.toFixed(0)}
              tick={{ fill: "#9a9aa3", fontSize: 11, fontFamily: "ui-monospace" }}
              stroke="#2a2a31"
            />
            <YAxis
              tickFormatter={(v: number) => v.toFixed(0)}
              tick={{ fill: "#9a9aa3", fontSize: 11, fontFamily: "ui-monospace" }}
              stroke="#2a2a31"
              width={44}
            />
            <Tooltip content={<PayoffTooltip />} cursor={{ stroke: ACCENT, strokeWidth: 1 }} />

            <ReferenceLine y={0} stroke="#4a4a55" strokeWidth={1} />
            {be.map((x, i) => (
              <ReferenceLine
                key={i}
                x={x}
                stroke={ACCENT}
                strokeDasharray="3 3"
                label={{
                  value: `B/E ${x.toFixed(2)}`,
                  position: "top",
                  fill: ACCENT,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "ui-monospace",
                }}
              />
            ))}

            <Area
              type="linear"
              dataKey="pnl"
              stroke="url(#pnlStroke)"
              strokeWidth={2}
              fill="url(#pnlFill)"
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 3, fill: ACCENT, stroke: "none" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

function PayoffTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: PayoffPoint }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const { spot, pnl } = payload[0].payload;
  return (
    <div className="rounded border border-line bg-panel px-2.5 py-1.5 font-mono text-xs shadow-lg">
      <div className="text-ink-faint">
        spot <span className="tabular-nums text-ink">{spot.toFixed(2)}</span>
      </div>
      <div className="text-ink-faint">
        P&L{" "}
        <span className={`tabular-nums ${pnl >= 0 ? "text-profit" : "text-loss"}`}>
          {pnl >= 0 ? "+" : ""}
          {pnl.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
