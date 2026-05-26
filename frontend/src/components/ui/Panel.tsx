import type { ReactNode } from "react";

export default function Panel({
  title,
  right,
  children,
  className = "",
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex flex-col rounded-md border border-line bg-panel ${className}`}
    >
      <header className="flex items-center justify-between border-b border-line px-3 py-2">
        <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          {title}
        </h2>
        {right && <div className="text-xs text-ink-dim">{right}</div>}
      </header>
      <div className="flex-1 p-3">{children}</div>
    </section>
  );
}
