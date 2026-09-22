/** Openingstijden per weekdag (1 = ma … 6 = za). Personeel is 30 minuten eerder aanwezig. */
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
export const OPENING_TEXT_DE = "Di 10:30–18:30 · Mi 09:30–17:30 · Do 10:30–18:30 · Fr 10:30–17:30 · Sa 09:30–16:00 · Mo geschlossen";
