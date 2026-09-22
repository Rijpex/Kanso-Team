export const IDEA_CHECKS: { key: string; de: string; nl: string }[] = [
  { key: "value", de: "Stärkt mindestens einen unserer sechs Werte", nl: "Versterkt minstens één van onze zes waarden" },
  { key: "world", de: "Passt in eine unserer Welten im Laden", nl: "Past in een van onze werelden in de winkel" },
  { key: "unique", de: "Gibt es nicht schon überall (Amazon, Depot, dm …)", nl: "Is niet al overal te koop (Amazon, Depot, dm …)" },
  { key: "gift", de: "Gutes Geschenk oder Mitnahmeprodukt", nl: "Goed cadeau of meeneemproduct" },
  { key: "story", de: "Material und Herkunft kann ich in zwei Sätzen erklären", nl: "Materiaal en herkomst kan ik in twee zinnen uitleggen" },
  { key: "supply", de: "Lieferant liefert nach Deutschland, Nachbestellen ist möglich", nl: "Leverancier levert in Duitsland, nabestellen kan" },
];
export const WORLDS = ["Tisch & Gastgeben", "Feuer & Licht", "Geschenk", "KANSO SPICES", "Duft", "Pflanzen & Gefäße", "Textil", "Outdoor Cooking", "Terrasse & Möbel"];

export type Calc = { landed: number; net: number; margin: number; pct: number; factor: number; invest: number | null; breakEven: number | null; profitAll: number | null };
export function calc(ek?: number | null, vk?: number | null, vat = 19, extra?: number | null, moq?: number | null): Calc | null {
  if (!ek || !vk) return null;
  const landed = ek + (extra || 0);
  const net = vk / (1 + vat / 100);
  const margin = net - landed;
  const invest = moq ? moq * landed : null;
  return { landed, net, margin, pct: (margin / net) * 100, factor: vk / ek, invest, breakEven: invest ? Math.ceil(invest / net) : null, profitAll: moq ? moq * margin : null };
}
export const eur = (x: number) => x.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
