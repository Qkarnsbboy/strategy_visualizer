export default function NumberField({
  label,
  value,
  onChange,
  step,
  min,
  suffix,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
  min?: string;
  suffix?: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
        {label}
      </span>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          step={step}
          min={min}
          className="w-full rounded border border-line bg-panel-soft px-2 py-1.5 font-mono text-sm tabular-nums text-ink outline-none transition-colors focus:border-accent"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-ink-faint">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}
