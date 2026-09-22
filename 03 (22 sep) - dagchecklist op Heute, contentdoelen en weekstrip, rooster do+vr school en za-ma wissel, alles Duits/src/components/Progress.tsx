/** Doelbalk: donker = gehaald, licht = gepland. */
export function GoalBar({ label, done, planned = 0, goal, hint }: { label: string; done: number; planned?: number; goal: number; hint?: string }) {
  const pct = (n: number) => `${Math.min(100, goal > 0 ? (n / goal) * 100 : 0)}%`;
  const reached = goal > 0 && done >= goal;
  return (
    <div className="card">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</span>
        {reached && <span className="badge bg-emerald-100 text-emerald-800">✓</span>}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{done.toLocaleString("de-DE")}<span className="text-base font-normal text-stone-400"> / {goal ? goal.toLocaleString("de-DE") : "–"}</span></div>
      <div className="relative mt-2 h-2.5 overflow-hidden rounded-full bg-sand-100">
        <div className="absolute inset-y-0 left-0 rounded-full bg-sand-300" style={{ width: pct(done + planned) }} />
        <div className={`absolute inset-y-0 left-0 rounded-full ${reached ? "bg-emerald-600" : "bg-ink"}`} style={{ width: pct(done) }} />
      </div>
      {hint && <div className="mt-1.5 text-xs text-stone-500">{hint}</div>}
    </div>
  );
}

/** Kleine lijn van een reeks waarden. */
export function Sparkline({ values, color = "#7a6a4f" }: { values: number[]; color?: string }) {
  if (values.length < 2) return null;
  const w = 160, h = 40, min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * (w - 6) + 3},${h - 4 - ((v - min) / span) * (h - 8)}`);
  const last = pts[pts.length - 1].split(",");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-40" role="img" aria-label="Verlauf">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
    </svg>
  );
}
