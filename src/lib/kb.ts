/** Hilfen für die Wissensseiten: Abschnitte (Inhaltsverzeichnis), Kurztext für Karten, Symbole je Kategorie. */

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "abschnitt";

/** Überschriften (# und ##) als Inhaltsverzeichnis, mit denselben IDs wie im Markdown. */
export function headings(text: string): { id: string; title: string }[] {
  const out: { id: string; title: string }[] = [];
  const seen = new Map<string, number>();
  for (const raw of (text || "").split("\n")) {
    const m = /^#{1,2}\s+(.*)$/.exec(raw.trimEnd());
    if (!m) continue;
    const title = m[1].replace(/\*\*/g, "").trim();
    let id = slugify(title);
    const n = seen.get(id) || 0;
    seen.set(id, n + 1);
    if (n) id = `${id}-${n + 1}`;
    out.push({ id, title });
  }
  return out;
}

/** Erster normaler Satz einer Seite – für die Vorschau auf den Karten. */
export function teaser(text: string, max = 110): string {
  for (const raw of (text || "").split("\n")) {
    const line = raw.trim();
    if (!line || /^(#|\||[-•]\s|\d+[.)]\s)/.test(line)) continue;
    const clean = line.replace(/\*\*/g, "").replace(/\[\[[^\]]*\]\]/g, "").replace(/\s+/g, " ").trim();
    if (clean.length < 20) continue;
    return clean.length > max ? clean.slice(0, max).replace(/\s+\S*$/, "") + " …" : clean;
  }
  return "";
}

/** Lesezeit in Minuten (ca. 200 Wörter pro Minute). */
export const readMinutes = (text: string) => Math.max(1, Math.round((text || "").split(/\s+/).length / 200));

export const KB_STYLE: Record<string, { icon: string; tone: string }> = {
  verkauf: { icon: "chat", tone: "bg-emerald-50 text-emerald-800" },
  produkte: { icon: "box", tone: "bg-amber-50 text-amber-800" },
  anleitungen: { icon: "tasks", tone: "bg-sky-50 text-sky-800" },
  start: { icon: "flag", tone: "bg-rose-50 text-rose-800" },
  shop: { icon: "home", tone: "bg-stone-100 text-stone-700" },
  store: { icon: "sparkle", tone: "bg-lime-50 text-lime-800" },
  digital: { icon: "video", tone: "bg-cyan-50 text-cyan-800" },
  team: { icon: "users", tone: "bg-violet-50 text-violet-800" },
  line: { icon: "bulb", tone: "bg-orange-50 text-orange-800" },
  q4: { icon: "box", tone: "bg-blue-50 text-blue-800" },
};
export const kbStyle = (c: string) => KB_STYLE[c] || { icon: "book", tone: "bg-sand-100 text-stone-700" };
