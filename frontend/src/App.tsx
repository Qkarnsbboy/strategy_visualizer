import { useEffect, useState } from "react";
import StrategyDashboard from "./components/StrategyDashboard";

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <div className="flex items-baseline gap-3">
            <span className="h-2.5 w-2.5 rounded-sm bg-accent" aria-hidden />
            <h1 className="font-mono text-sm font-semibold uppercase tracking-[0.22em] text-accent">
              Strategy Visualizer
            </h1>
            <span className="font-mono text-[11px] text-ink-faint">
              options payoff terminal
            </span>
          </div>
          <Clock />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-5">
        <StrategyDashboard />
      </main>
    </div>
  );
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-xs tabular-nums text-ink-dim">
      {now.toLocaleTimeString("en-US", { hour12: false })}
    </span>
  );
}
