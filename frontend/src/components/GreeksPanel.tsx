import type { Greeks } from "../lib/api";
import Panel from "./ui/Panel";

export interface AggregateGreeks extends Greeks {
  /** Σ leg theoretical price × signed quantity (net value of the position). */
  netValue: number;
  /** Σ premium × signed quantity. Positive = net debit paid, negative = net credit received. */
  netPremium: number;
}

const GREEK_ROWS: Array<[keyof Greeks, string, string]> = [
  ["delta", "Delta", "Δ / $1 spot"],
  ["gamma", "Gamma", "Γ / $1 spot"],
  ["theta", "Theta", "Θ / day"],
  ["vega", "Vega", "ν / 1% vol"],
  ["rho", "Rho", "ρ / 1% rate"],
];

export default function GreeksPanel({ data }: { data: AggregateGreeks | null }) {
  return (
    <Panel
      title="Greeks"
      right={data ? "at current spot" : undefined}
      className="h-full"
    >
      {!data ? (
        <p className="font-mono text-xs text-ink-faint">
          Plot a strategy to see aggregate Greeks.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {GREEK_ROWS.map(([key, name, unit]) => (
              <Tile key={key} name={name} unit={unit} value={data[key]} />
            ))}
          </div>
          <div className="flex flex-wrap gap-6 border-t border-line pt-3 font-mono text-xs">
            <Metric label="NET VALUE" value={data.netValue.toFixed(2)} />
            <Metric
              label={data.netPremium >= 0 ? "NET DEBIT" : "NET CREDIT"}
              value={Math.abs(data.netPremium).toFixed(2)}
              tone={data.netPremium >= 0 ? "loss" : "profit"}
            />
          </div>
        </div>
      )}
    </Panel>
  );
}

function Tile({ name, unit, value }: { name: string; unit: string; value: number }) {
  return (
    <div className="rounded border border-line bg-panel-soft p-2">
      <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
        {name}
      </div>
      <div className="mt-0.5 font-mono text-base font-semibold tabular-nums text-ink">
        {value.toFixed(4)}
      </div>
      <div className="mt-0.5 font-mono text-[10px] text-ink-faint">{unit}</div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "profit" | "loss";
}) {
  const color =
    tone === "profit" ? "text-profit" : tone === "loss" ? "text-loss" : "text-ink";
  return (
    <div>
      <span className="text-[10px] uppercase tracking-wider text-ink-faint">
        {label}
      </span>{" "}
      <span className={`tabular-nums ${color}`}>{value}</span>
    </div>
  );
}
