import { weekday } from "@/lib/dates";

type Hours = Record<number, { open: string; close: string } | null>;
/** Openingstijden per weekdag (1 = ma … 7 = zo) tot en met 15 november 2026. */
export const OPENING: Hours = {
  1: { open: "10:30", close: "18:30" },
  2: { open: "10:30", close: "18:30" },
  3: { open: "09:30", close: "17:30" },
  4: { open: "10:30", close: "18:30" },
  5: { open: "10:30", close: "17:30" },
  6: { open: "09:30", close: "16:00" },
  7: null,
};
/** Nieuwe openingstijden met ingangsdatum: vanaf 16 november 2026 vrijdag en zaterdag tot 18:30. */
export const OPENING_FROM: { from: string; hours: Hours }[] = [
  { from: "2026-11-16", hours: { ...OPENING, 5: { open: "10:30", close: "18:30" }, 6: { open: "09:30", close: "18:30" } } },
];
/** Openingstijden die op een datum gelden. */
export function openingOn(date: string): Hours {
  let h = OPENING;
  for (const x of OPENING_FROM) if (date >= x.from) h = x.hours;
  return h;
}
const addMin = (t: string, n: number) => { const [h, m] = t.split(":").map(Number); const x = h * 60 + m + n; return `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`; };
const minus30 = (t: string) => addMin(t, -30);
const spanMin = (a: string, b: string) => { const [h1, m1] = a.split(":").map(Number); const [h2, m2] = b.split(":").map(Number); return h2 * 60 + m2 - (h1 * 60 + m1); };
/** Werktijd op een weekdag (oude tijden): half uur voor opening tot sluiting. */
export const shiftFor = (wd: number) => { const o = OPENING[wd]; return o ? { start: minus30(o.open), end: o.close } : null; };
export const internShiftFor = shiftFor;
export const shiftForRole = (wd: number, _role?: string) => shiftFor(wd);
/**
 * Standaarddienst op een datum, per rol:
 * - Bas en Lea: 30 minuten voor opening tot sluiting.
 * - Stagiaires: idem, maar maximaal 8,5 uur aanwezig (8 uur netto bij 1 uur pauze is het wettelijke maximum).
 * - Verkoper (Mathias): de laatste 4 uur van de dag.
 */
export function shiftOn(date: string, role?: string) {
  const o = openingOn(date)[weekday(date)];
  if (!o) return null;
  if (role === "seller") return { start: addMin(o.close, -240), end: o.close };
  const start = minus30(o.open);
  let end = o.close;
  if (role === "intern" && spanMin(start, end) > 510) end = addMin(start, 510);
  return { start, end };
}
export const OPENING_TEXT_DE = "Mo 10:30–18:30 · Di 10:30–18:30 · Mi 09:30–17:30 · Do 10:30–18:30 · Fr 10:30–18:30 · Sa 09:30–18:30 (ab 16.11.)";
/* ───────── Urenrekenen (voor de urenteller van de stagiaires) ───────── */
export const toMin = (t?: string | null) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
};
export type TimeRow = { start_time: string | null; end_time: string | null; break_start?: string | null; break_end?: string | null; break2_start?: string | null; break2_end?: string | null; role?: string | null };
/** Vaste pauze per rol als er geen pauzetijden staan: stagiaires plannen hun uur pauze zelf. */
export const FLAT_BREAK: Record<string, number> = { intern: 60 };
const pauseOf = (s?: string | null, e?: string | null) => {
  const x = toMin(s), y = toMin(e);
  return x != null && y != null && y > x ? y - x : 0;
};
/** Pauze van één dienst in minuten: ingevulde tijden, anders de vaste pauze van de rol (vanaf 6 uur aanwezig). */
export function breakMinutes(r: TimeRow, role: string | null | undefined = r.role): number {
  const a = toMin(r.start_time), b = toMin(r.end_time);
  if (a == null || b == null || b <= a) return 0;
  const explicit = pauseOf(r.break_start, r.break_end) + pauseOf(r.break2_start, r.break2_end);
  if (explicit > 0) return explicit;
  const flat = role ? FLAT_BREAK[role] || 0 : 0;
  return b - a > 360 ? Math.min(flat, b - a) : 0;
}
/** Netto werktijd van één dienst in minuten: eindtijd − begintijd − pauze. */
export function shiftMinutes(r: TimeRow, role: string | null | undefined = r.role): number {
  const a = toMin(r.start_time), b = toMin(r.end_time);
  if (a == null || b == null || b <= a) return 0;
  return Math.max(0, b - a - breakMinutes(r, role));
}
/** Tekst voor de pauze in rooster en agenda: tijden als ze er staan, anders "1 Std. Pause". */
export function breakText(r: TimeRow, role: string | null | undefined, lang: "de" | "nl"): string | null {
  if (r.break_start && r.break_end) {
    const hm = (t: string) => t.slice(0, 5);
    return `${lang === "nl" ? "Pauze" : "Pause"} ${hm(r.break_start)}–${hm(r.break_end)}${r.break2_start && r.break2_end ? ` · ${hm(r.break2_start)}–${hm(r.break2_end)}` : ""}`;
  }
  const m = breakMinutes(r, role);
  if (!m) return null;
  const h = m % 60 === 0 ? `${m / 60} ${lang === "nl" ? "uur" : "Std."}` : `${m} min`;
  return lang === "nl" ? `${h} pauze` : `${h} Pause`;
}
/** 1350 → "22,5" (Duitse notatie, altijd één decimaal na de komma als er een rest is). */
export const fmtHours = (min: number) => (min / 60).toLocaleString("de-DE", { maximumFractionDigits: 1 });

