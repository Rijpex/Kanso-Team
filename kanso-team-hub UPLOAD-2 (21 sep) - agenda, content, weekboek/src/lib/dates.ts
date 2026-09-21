export const TZ = "Europe/Berlin";

/** Vandaag in Lüneburg als "YYYY-MM-DD". */
export function today(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

export function parse(d: string): Date {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day));
}
export function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}
export function addDays(d: string, n: number): string {
  const x = parse(d);
  x.setUTCDate(x.getUTCDate() + n);
  return fmt(x);
}
/** 1 = maandag … 7 = zondag */
export function weekday(d: string): number {
  const w = parse(d).getUTCDay();
  return w === 0 ? 7 : w;
}
export function monday(d: string): string {
  return addDays(d, 1 - weekday(d));
}
export function isoWeek(d: string): number {
  const x = parse(d);
  x.setUTCDate(x.getUTCDate() + 4 - (x.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(x.getUTCFullYear(), 0, 1));
  return Math.ceil(((x.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
const loc = (lang: string) => (lang === "nl" ? "nl-NL" : "de-DE");
export function longDate(d: string, lang: string): string {
  return new Intl.DateTimeFormat(loc(lang), { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(parse(d));
}
export function shortDate(d: string, lang: string): string {
  return new Intl.DateTimeFormat(loc(lang), { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(parse(d));
}
export function dayName(d: string, lang: string): string {
  return new Intl.DateTimeFormat(loc(lang), { weekday: "short", timeZone: "UTC" }).format(parse(d));
}
export function monthName(d: string, lang: string): string {
  return new Intl.DateTimeFormat(loc(lang), { month: "long", year: "numeric", timeZone: "UTC" }).format(parse(d));
}
export function hm(t: string | null | undefined): string {
  return t ? t.slice(0, 5) : "";
}
export function dateTime(ts: string | Date, lang: string): string {
  return new Intl.DateTimeFormat(loc(lang), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(new Date(ts));
}
