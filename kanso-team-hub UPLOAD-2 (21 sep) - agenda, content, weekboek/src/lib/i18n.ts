export type Lang = "de" | "nl";
export type Tr = (de: string, nl: string) => string;
export const T = (lang: Lang): Tr => (de, nl) => (lang === "nl" ? nl : de);
/** Kies het veld in de taal van de gebruiker, met terugval op Duits. */
export const pick = (lang: Lang, de: string | null | undefined, nl: string | null | undefined) => (lang === "nl" ? nl || de || "" : de || nl || "");

type L = { de: string; nl: string; color?: string };
export const TASK_STATUS: Record<string, L> = {
  todo: { de: "Offen", nl: "Te doen", color: "bg-stone-100 text-stone-700" },
  doing: { de: "In Arbeit", nl: "Bezig", color: "bg-sky-100 text-sky-800" },
  review: { de: "Zur Kontrolle", nl: "Ter controle", color: "bg-amber-100 text-amber-800" },
  done: { de: "Fertig", nl: "Klaar", color: "bg-emerald-100 text-emerald-800" },
};
export const TASK_CATEGORY: Record<string, L> = {
  shop: { de: "Laden", nl: "Winkel", color: "bg-stone-200 text-stone-800" },
  social: { de: "Social Media", nl: "Social media", color: "bg-pink-100 text-pink-800" },
  line: { de: "Produktlinie", nl: "Productlijn", color: "bg-orange-100 text-orange-800" },
  research: { de: "Sourcing & Kalkulation", nl: "Sourcing & calculatie", color: "bg-violet-100 text-violet-800" },
  store: { de: "Store & Schaufenster", nl: "Winkel & etalage", color: "bg-lime-100 text-lime-800" },
  digital: { de: "Website & Shop", nl: "Website & shop", color: "bg-cyan-100 text-cyan-800" },
  winter: { de: "Q4 & Weihnachten", nl: "Q4 & kerst", color: "bg-blue-100 text-blue-800" },
  learn: { de: "Lernen", nl: "Leren", color: "bg-teal-100 text-teal-800" },
};
export const SHIFT_KIND: Record<string, L> = {
  shop: { de: "Laden", nl: "Winkel", color: "bg-emerald-100 text-emerald-900" },
  home: { de: "Homeoffice", nl: "Thuiswerk", color: "bg-sky-100 text-sky-900" },
  school: { de: "Schule", nl: "School", color: "bg-violet-100 text-violet-900" },
  off: { de: "Frei", nl: "Vrij", color: "bg-stone-100 text-stone-500" },
};
export const EVENT_KIND: Record<string, L> = {
  event: { de: "Termin", nl: "Afspraak", color: "bg-stone-200 text-stone-800" },
  market: { de: "Markt / Event", nl: "Markt / event", color: "bg-rose-100 text-rose-800" },
  delivery: { de: "Lieferung", nl: "Levering", color: "bg-amber-100 text-amber-800" },
  school: { de: "Schule / Ferien", nl: "School / vakantie", color: "bg-violet-100 text-violet-800" },
  meeting: { de: "Gespräch", nl: "Gesprek", color: "bg-sky-100 text-sky-800" },
  closed: { de: "Geschlossen / Feiertag", nl: "Gesloten / feestdag", color: "bg-red-100 text-red-800" },
};
export const IDEA_STATUS: Record<string, L> = {
  idea: { de: "Idee", nl: "Idee", color: "bg-stone-100 text-stone-700" },
  research: { de: "Recherche", nl: "Onderzoek", color: "bg-sky-100 text-sky-800" },
  discuss: { de: "Besprechen", nl: "Bespreken", color: "bg-amber-100 text-amber-800" },
  approved: { de: "Machen wir!", nl: "Gaan we doen!", color: "bg-emerald-100 text-emerald-800" },
  rejected: { de: "Passt nicht", nl: "Past niet", color: "bg-red-100 text-red-700" },
};
export const CONTENT_STATUS: Record<string, L> = {
  idea: { de: "Idee", nl: "Idee", color: "bg-stone-100 text-stone-700" },
  filmed: { de: "Gefilmt", nl: "Gefilmd", color: "bg-sky-100 text-sky-800" },
  edited: { de: "Geschnitten", nl: "Gemonteerd", color: "bg-amber-100 text-amber-800" },
  approved: { de: "Freigegeben", nl: "Goedgekeurd", color: "bg-emerald-100 text-emerald-800" },
  posted: { de: "Gepostet", nl: "Gepost", color: "bg-violet-100 text-violet-800" },
};
export const KB_CATEGORY: Record<string, L> = {
  start: { de: "Start", nl: "Start" },
  line: { de: "Eure Produktlinien", nl: "Jullie productlijnen" },
  shop: { de: "Im Laden", nl: "In de winkel" },
  store: { de: "Storepflege & Visual Merchandising", nl: "Winkelverzorging & visual merchandising" },
  digital: { de: "Digital", nl: "Digitaal" },
  team: { de: "Zu zweit", nl: "Met z'n tweeën" },
  q4: { de: "Produkt & Q4", nl: "Product & Q4" },
  produkte: { de: "Produktwissen", nl: "Productkennis" },
  anleitungen: { de: "Anleitungen", nl: "Handleidingen" },
};
export const PILLARS = ["Vorher/Nachher", "Building KANSŌ", "Gastgeber-Ideen", "Outdoor Cooking", "Design & Materialien", "Kundenprojekte"];
export const URGENCY: Record<string, L> = {
  checkin: { de: "Bis zum Check-in", nl: "Tot de check-in", color: "bg-stone-100 text-stone-600" },
  today: { de: "Heute noch", nl: "Vandaag nog", color: "bg-amber-100 text-amber-800" },
  now: { de: "Jetzt (Kunde wartet)", nl: "Nu (klant wacht)", color: "bg-red-100 text-red-700" },
};
export const lbl = (lang: Lang, l?: L) => (l ? (lang === "nl" ? l.nl : l.de) : "");

export const BRANDS = ["Tenderflame", "KANSŌ SPICES", "KANSŌ Raumduft", "Luca Lifestyle", "Archief", "Grain by Grain", "Kerzen", "Lapuan Kankurit", "Alkoholfreie Spirituosen", "Outdoor-Teppiche", "Kamado-Grills", "KOALA Kitchens", "KANSŌ Kitchens", "Rijpex Pergola", "Laden & Schaufenster", "Lüneburg"];
