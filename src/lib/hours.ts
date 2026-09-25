/** Openingstijden per weekdag (1 = ma … 6 = za). Bas en Lea zijn 30 minuten eerder aanwezig, stagiaires beginnen bij opening. */
export const OPENING: Record<number, { open: string; close: string } | null> = {
  1: null,
  2: { open: "10:30", close: "18:30" },
  3: { open: "09:30", close: "17:30" },
  4: { open: "10:30", close: "18:30" },
  5: { open: "10:30", close: "17:30" },
  6: { open: "09:30", close: "16:00" },
  7: null,
};
const minus30 = (t: string) => { const [h, m] = t.split(":").map(Number); const x = h * 60 + m - 30; return `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`; };
/** Werktijd op een dag: half uur voor opening tot sluiting. */
export const shiftFor = (wd: number) => { const o = OPENING[wd]; return o ? { start: minus30(o.open), end: o.close } : null; };
/** Werktijd stagiaires: vanaf opening tot sluiting. */
export const internShiftFor = (wd: number) => { const o = OPENING[wd]; return o ? { start: o.open, end: o.close } : null; };
/** Standaardtijd per rol. */
export const shiftForRole = (wd: number, role?: string) => (role === "intern" ? internShiftFor(wd) : shiftFor(wd));
/* ───────── Urenrekenen (voor de urenteller van de stagiaires) ───────── */
export const toMin = (t?: string | null) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
};
export type TimeRow = { start_time: string | null; end_time: string | null; break_start?: string | null; break_end?: string | null; break2_start?: string | null; break2_end?: string | null };
/** Netto werktijd van één dienst in minuten: eindtijd − begintijd − de pauzes. */
export function shiftMinutes(r: TimeRow): number {
  const a = toMin(r.start_time), b = toMin(r.end_time);
  if (a == null || b == null || b <= a) return 0;
  const pause = (s?: string | null, e?: string | null) => {
    const x = toMin(s), y = toMin(e);
    return x != null && y != null && y > x ? y - x : 0;
  };
  return Math.max(0, b - a - pause(r.break_start, r.break_end) - pause(r.break2_start, r.break2_end));
}
/** 1350 → "22,5" (Duitse notatie, altijd één decimaal na de komma als er een rest is). */
export const fmtHours = (min: number) => (min / 60).toLocaleString("de-DE", { maximumFractionDigits: 1 });

export const OPENING_TEXT_DE = "Di 10:30–18:30 · Mi 09:30–17:30 · Do 10:30–18:30 · Fr 10:30–17:30 · Sa 09:30–16:00 · Mo geschlossen";
