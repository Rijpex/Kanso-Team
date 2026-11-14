/**
 * Produktfotos aus dem Webshop (kanso-outdoor.com) für die Wissensseiten.
 * Jeder Block wird einmalig direkt unter der genannten Überschrift eingefügt (v20) –
 * nur wenn die Überschrift noch existiert und die Seite noch keine Shop-Bilder hat.
 */
const U = "https://kanso-outdoor.com/wp-content/uploads/";
const img = (caption: string, path: string) => `![${caption}](${U}${path})`;

export const KB_PHOTOS: { slug: string; after: string; block: string }[] = [
  {
    slug: "verkauf-tenderflame",
    after: "## Was gut läuft – verkauf Sets, nicht einzelne Teile",
    block: [
      img("Lilly 10 Geschenkset inkl. 0,5 l Tenderfuel · 29,95 €", "2026/10/tenderflame-lilly-10-geschenkset-schwarz-1-500x500.png"),
      img("Lilly 8 & 10 Duo Pack · 29,90 €", "2026/08/tenderflame-lilly-8-und-10-duo-pack-gun-metal-500x500.webp"),
      img("Cycloflame Table · 119,90 €", "2026/10/tenderflame-cycloflame-table-black-1-768x768.png"),
      img("Café 14 Lava Black · 49,90 €", "2026/10/kns-tf-0410012-g1-500x500.png"),
    ].join("\n"),
  },
  {
    slug: "verkauf-tenderflame",
    after: "## Dazu verkaufen – jedes Mal",
    block: [
      img("Tenderfuel Organic 1,0 l · 11,99 €", "2026/10/kns-tf-700010-tf-1-500x500.png"),
      img("Tenderfuel Organic 2,5 l · 27,99 €", "2026/10/kns-tf-700025-tf-1-500x500.png"),
      img("Pen Torch Feuerzeug · 14,95 €", "2026/10/tenderflame-pen-torch-feuerzeug-black-1-500x500.png"),
    ].join("\n"),
  },
  {
    slug: "kamado-grills-moddern",
    after: "## Unsere Modelle: Moddern (Design aus den Niederlanden)",
    block: [
      img("Moddern Compact · ab 749 €", "2026/08/moddern-kamado-mini-gruen-offener-keramikgrill.webp"),
      img("Moddern Solo (Einbau) · ab 1.349 €", "2026/08/moddern-kamado-gruen-frontansicht-geschlossen.webp"),
      img("Moddern Special in Sand · ab 1.699 €", "2026/08/moddern-kamado-sandstein-rollwagen-frontansicht-seitentische-eingeklappt-deckel-geschlosse.webp"),
      img("Eingebaut in eine KANSŌ Outdoor-Küche", "2026/08/IMG_4129-1152x1536.jpg"),
    ].join("\n"),
  },
  {
    slug: "kamado-grills-moddern",
    after: "## Zubehör – immer mit anbieten",
    block: [
      img("Platesetter (2-teilig) · 79,95 €", "2026/08/moddern-kamado-deflektorstein-halbmond-2er-set.webp"),
      img("Pizzastein · 49,95 €", "2026/08/moddern-kamado-pizzastein.webp"),
      img("Wetterhaube · 119,95 €", "2026/08/moddern-kamado-abdeckhaube.webp"),
      img("Edelstahl-Kohlekorb · 79,95 €", "2026/08/moddern-kamado-kohlekorb-edelstahl.webp"),
    ].join("\n"),
  },
  {
    slug: "verkauf-lueneburg-haeuschen",
    after: "## Die fünf Motive",
    block: [
      img("Alle fünf Motive", "2026/10/lueneburg-windlicht-skyline-set-5-motive.jpg"),
      img("In der Geschenkbox mit Teelicht und Karte", "2026/10/lueneburg-windlicht-haeuschen-geschenkverpackung-klappschachtel-1024x1024.jpg"),
      img("Am Sande", "2026/10/lueneburg-am-sande-windlicht-stahl-freisteller-1024x1024.jpg"),
      img("Alter Kran", "2026/10/lueneburg-alter-kran-windlicht-stahl-freisteller-1024x1024.jpg"),
    ].join("\n"),
  },
  {
    slug: "verkauf-luca-lifestyle",
    after: "## Was wir haben",
    block: [
      img("Grigio New Egg Pot 55 × 46 · Naturbeton", "2026/06/luca-lifestyle-pflanzgefaess-grigio-new-egg-pot-55x46-naturbeton-1-500x500.jpg"),
      img("Grigio Metallic Tall Balloon · Champagne", "2026/06/luca-lifestyle-pflanzkuebel-grigio-metallic-tall-balloon-55x68-champagne-500x500.jpeg"),
      img("Grigio Cylinder · Antikweiß", "2026/06/luca-lifestyle-pflanzzylinder-grigio-cylinder-60x41-antikweiss-1-500x500.jpg"),
      img("Wallhanger Organic #1 · Earth · 85 €", "2026/10/luca-lifestyle-wallhanger-organic-1-earth-40-x-35-cm-1-500x500.jpg"),
      img("Wallhanger Organic #2 · Earth · 85 €", "2026/10/luca-lifestyle-wallhanger-organic-2-earth-35-x-40-cm-1-500x500.jpg"),
      img("Wallhanger Organic #3 · Earth · 85 €", "2026/10/luca-lifestyle-wallhanger-organic-3-earth-35-x-40-cm-1-500x500.jpg"),
    ].join("\n"),
  },
  {
    slug: "verkauf-koala-kitchens",
    after: "## Die drei Küchen im Showroom",
    block: [
      img("KOALA Outdoor-Küche in Schwarz", "2026/08/outdoorkueche-dunkel-mit-gartenblick-500x500.webp"),
      img("Mit eingebautem Kamado", "2026/08/IMG_4129-1152x1536.jpg"),
    ].join("\n"),
  },
  {
    slug: "verkauf-vesper-kitchens",
    after: "## Farben und Setups aus dem Katalog",
    block: [
      img("Vesper Model 2", "2026/02/vesper-kitchens-outdoor-kueche-model-2-7-500x500.png"),
      img("Vesper Model 2 – Detail", "2026/02/vesper-kitchens-outdoor-kueche-model-2-4-500x500.png"),
      img("Vesper Model 3", "2026/02/vesper-kitchens-outdoor-kueche-model-3-2-500x500.png"),
    ].join("\n"),
  },
  {
    slug: "keramik-kerzen-toepfe",
    after: "## Unsere Sojawachs-Kerzen",
    block: [
      img("Bubble-Würfelkerze M · 9 × 9 cm", "2026/06/kanso-bubble-wuerfelkerze-m-9x9x9-cm-schwarz-500x500.jpeg"),
      img("Bubble-Würfelkerze S · 5 × 5 cm", "2026/06/kanso-bubble-wuerfelkerze-s-5x5x5-cm-schwarz-500x500.jpeg"),
      img("U-Form Kerze L", "2026/06/kanso-u-form-kerze-l-sugar-swizzle-500x500.avif"),
      img("Gerippte Säulenkerze L · 7 × 20 cm", "2026/06/kanso-gerippte-saeulenkerze-l-7x20-cm-taupe-2-500x500.avif"),
    ].join("\n"),
  },
  {
    slug: "verkauf-rijpex-pergola",
    after: "## Standardgrößen und Startpreise (inkl. MwSt.)",
    block: [
      img("Freistehende Pergola mit Sonnensegel", "2026/08/holzpergola-im-garten-mit-sonnensegel.png"),
      img("Anbaupergola mit Sonnensegel", "2026/06/anbaupergola-aus-holz-mit-sonnensegel.jpg-1024x1002.png"),
      img("Extra groß mit Harmonikadach", "2026/08/doppelte-holzpergola-mit-harmonikadach.png"),
    ].join("\n"),
  },
];

/** Fügt die Fotoblöcke in einen Seitentext ein (für Seed und Migration identisch). */
export function withPhotos(slug: string, body: string): string {
  if (body.includes("](" + U)) return body;
  let out = body;
  for (const p of KB_PHOTOS.filter((x) => x.slug === slug)) {
    const i = out.indexOf(p.after + "\n");
    if (i < 0) continue;
    const at = i + p.after.length + 1;
    out = out.slice(0, at) + "\n" + p.block + "\n" + out.slice(at);
  }
  return out;
}
