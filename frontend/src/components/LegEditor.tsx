import type { OptionType } from "../lib/api";
import Panel from "./ui/Panel";
import NumberField from "./ui/NumberField";

export interface LegForm {
  option_type: OptionType;
  strike: string;
  quantity: string;
  premium: string;
}

export interface MarketForm {
  spot: string;
  vol: string;
  rate: string;
  time: string;
}

export interface RangeForm {
  spot_min: string;
  spot_max: string;
  steps: string;
}

export default function LegEditor({
  legs,
  market,
  range,
  loading,
  error,
  onLegChange,
  onAddLeg,
  onRemoveLeg,
  onMarketChange,
  onRangeChange,
  onAutoRange,
  onSubmit,
}: {
  legs: LegForm[];
  market: MarketForm;
  range: RangeForm;
  loading: boolean;
  error: string | null;
  onLegChange: <K extends keyof LegForm>(i: number, key: K, value: LegForm[K]) => void;
  onAddLeg: () => void;
  onRemoveLeg: (i: number) => void;
  onMarketChange: <K extends keyof MarketForm>(key: K, value: MarketForm[K]) => void;
  onRangeChange: <K extends keyof RangeForm>(key: K, value: RangeForm[K]) => void;
  onAutoRange: () => void;
  onSubmit: () => void;
}) {
  return (
    <Panel title="Inputs" className="h-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex h-full flex-col gap-4"
      >
        {/* Legs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
              Legs
            </span>
            <button
              type="button"
              onClick={onAddLeg}
              className="font-mono text-[11px] text-accent hover:text-accent-soft"
            >
              + add leg
            </button>
          </div>
          {legs.map((leg, i) => (
            <LegRow
              key={i}
              leg={leg}
              index={i}
              canRemove={legs.length > 1}
              onChange={onLegChange}
              onRemove={onRemoveLeg}
            />
          ))}
        </div>

        {/* Market context (drives Greeks) */}
        <div className="space-y-2 border-t border-line pt-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            Market · Greeks
          </span>
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="Spot" value={market.spot} onChange={(v) => onMarketChange("spot", v)} step="0.01" min="0" />
            <NumberField label="Volatility" value={market.vol} onChange={(v) => onMarketChange("vol", v)} step="0.01" min="0" suffix="σ" />
            <NumberField label="Rate" value={market.rate} onChange={(v) => onMarketChange("rate", v)} step="0.01" suffix="r" />
            <NumberField label="Time (yrs)" value={market.time} onChange={(v) => onMarketChange("time", v)} step="0.01" min="0" suffix="T" />
          </div>
        </div>

        {/* Chart range */}
        <div className="space-y-2 border-t border-line pt-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
              Spot range
            </span>
            <button
              type="button"
              onClick={onAutoRange}
              className="font-mono text-[11px] text-accent hover:text-accent-soft"
            >
              auto from strikes
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <NumberField label="Min" value={range.spot_min} onChange={(v) => onRangeChange("spot_min", v)} step="1" min="0" />
            <NumberField label="Max" value={range.spot_max} onChange={(v) => onRangeChange("spot_max", v)} step="1" min="0" />
            <NumberField label="Steps" value={range.steps} onChange={(v) => onRangeChange("steps", v)} step="1" min="2" />
          </div>
        </div>

        <div className="mt-auto pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-accent px-4 py-2 font-mono text-sm font-semibold uppercase tracking-wider text-bg transition-colors hover:bg-accent-soft disabled:bg-accent-dim disabled:text-ink-dim"
          >
            {loading ? "Plotting…" : "Plot / Update"}
          </button>
          {error && <p className="mt-2 font-mono text-xs text-loss">{error}</p>}
        </div>
      </form>
    </Panel>
  );
}

function LegRow({
  leg,
  index,
  canRemove,
  onChange,
  onRemove,
}: {
  leg: LegForm;
  index: number;
  canRemove: boolean;
  onChange: <K extends keyof LegForm>(i: number, key: K, value: LegForm[K]) => void;
  onRemove: (i: number) => void;
}) {
  const qty = parseFloat(leg.quantity);
  const side = isNaN(qty) || qty === 0 ? null : qty > 0 ? "LONG" : "SHORT";

  return (
    <div className="rounded border border-line bg-panel-soft p-2">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-wider text-ink-faint">
          LEG {index + 1}
          {side && (
            <span className={qty > 0 ? "ml-1.5 text-profit" : "ml-1.5 text-loss"}>
              {side}
            </span>
          )}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="font-mono text-[11px] text-ink-faint hover:text-loss"
            aria-label={`Remove leg ${index + 1}`}
          >
            ✕
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            Type
          </span>
          <select
            value={leg.option_type}
            onChange={(e) => onChange(index, "option_type", e.target.value as OptionType)}
            className="rounded border border-line bg-panel-soft px-2 py-1.5 font-mono text-sm text-ink outline-none focus:border-accent"
          >
            <option value="call">Call</option>
            <option value="put">Put</option>
          </select>
        </label>
        <NumberField label="Qty (± = long/short)" value={leg.quantity} onChange={(v) => onChange(index, "quantity", v)} step="1" />
        <NumberField label="Strike" value={leg.strike} onChange={(v) => onChange(index, "strike", v)} step="0.01" min="0" />
        <NumberField label="Premium" value={leg.premium} onChange={(v) => onChange(index, "premium", v)} step="0.01" min="0" />
      </div>
    </div>
  );
}
