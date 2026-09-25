/**
 * Startideeën voor het contentplan: vaste formats per week + concrete ideeën per merk.
 * Diana en Sofia kunnen ze met één klik overnemen; daarna passen ze titel, hook en datum zelf aan.
 * De teksten staan in het Duits (zij werken in het Duits), met Nederlandse uitleg voor Bas en Lea.
 */
export type Starter = {
  id: string;
  kind: "reel" | "story" | "post";
  channel: "both" | "instagram" | "tiktok";
  brand?: string;
  pillar: string;
  title: string;
  idea: string;
  why: { de: string; nl: string };
};

/** Vaste weekindeling: hetzelfde format op dezelfde dag, dan hoef je niet elke week opnieuw te bedenken wat. */
export const WEEK_FORMATS: { day: string; de: string; nl: string; hint: { de: string; nl: string } }[] = [
  { day: "Di", de: "Produkt in der Hand", nl: "Product in de hand", hint: { de: "Ein Produkt, 15 Sekunden: was es ist, für wen, was es kostet.", nl: "Eén product, 15 seconden: wat het is, voor wie, wat het kost." } },
  { day: "Mi", de: "Marke der Woche", nl: "Merk van de week", hint: { de: "Eine Marke aus dem Laden vorstellen – Herkunft, Material, warum wir sie führen.", nl: "Eén merk uit de winkel voorstellen – herkomst, materiaal, waarom wij het verkopen." } },
  { day: "Do", de: "Styling oder Vorher/Nachher", nl: "Styling of voor/na", hint: { de: "Eine Ecke im Laden oder einen Tisch neu stylen, Zeitraffer.", nl: "Een hoek in de winkel of een tafel opnieuw stylen, timelapse." } },
  { day: "Fr", de: "Wochenende-Tipp", nl: "Weekendtip", hint: { de: "Was man dieses Wochenende draußen macht – mit einem Produkt dazu.", nl: "Wat je dit weekend buiten doet – met één product erbij." } },
  { day: "Sa", de: "Sketch, Trend oder Kundenfrage", nl: "Sketch, trend of klantvraag", hint: { de: "Etwas Lustiges oder ein TikTok-Trend mit unseren Produkten. Darf schief sein.", nl: "Iets leuks of een TikTok-trend met onze producten. Mag onaf zijn." } },
];

export const CONTENT_STARTERS: Starter[] = [
  {
    id: "koala-aufbau", kind: "reel", channel: "both", brand: "KOALA Kitchens", pillar: "Outdoor Cooking",
    title: "KOALA Outdoorküche: von der Kiste zur fertigen Küche",
    idea: "Hook (2 Sek.): „So entsteht eine Outdoorküche.“\nZeitraffer vom Aufbau oder vom Modul im Laden, dann drei Nahaufnahmen: Arbeitsplatte, Schublade, Grill.\nText im Bild: Material, ab welchem Preis, „auf Maß geplant“.\nAm Ende: „Komm vorbei und fass es an – Lüneburg.“\nMusik: ruhiger Beat.",
    why: { de: "Küchen sind unser größtes Projektgeschäft – Menschen müssen sehen, dass es echt ist.", nl: "Keukens zijn het grootste projectwerk – mensen moeten zien dat het echt bestaat." },
  },
  {
    id: "koala-vs-vesper", kind: "post", channel: "instagram", brand: "KOALA Kitchens", pillar: "Outdoor Cooking",
    title: "KOALA oder Vesper – welche Outdoorküche passt zu dir?",
    idea: "Karussell mit 4 Bildern: 1) Frage, 2) KOALA (für wen, Material, Preis ab), 3) Vesper Kitchen (für wen, Material, Preis ab), 4) „Beide bei uns im Laden – wir planen mit dir.“\nText ruhig und ehrlich, keine Superlative.",
    why: { de: "Vergleiche werden gespeichert und geteilt – und beantworten eine echte Kundenfrage.", nl: "Vergelijkingen worden opgeslagen en gedeeld – en beantwoorden een echte klantvraag." },
  },
  {
    id: "vesper-detail", kind: "reel", channel: "tiktok", brand: "Vesper Kitchen", pillar: "Design & Materialien",
    title: "Vesper Kitchen: drei Details, die man erst von nahem sieht",
    idea: "Drei Makroaufnahmen (Griff, Kante, Oberfläche), jeweils 3 Sekunden, dazu je ein kurzer Satz.\nHook: „Warum kostet eine Outdoorküche so viel? Schau mal genau hin.“\nAm Ende Totale der ganzen Küche.",
    why: { de: "Erklärt den Preis über Qualität statt über Rabatt.", nl: "Legt de prijs uit via kwaliteit in plaats van korting." },
  },
  {
    id: "rijpex-pergola", kind: "reel", channel: "both", brand: "Rijpex Pergola", pillar: "Kundenprojekte",
    title: "Pergola: Terrasse vorher – Terrasse nachher",
    idea: "Hook: „Diese Terrasse wurde nur einmal im Jahr benutzt.“\nVorher-Foto, dann Aufbau im Zeitraffer, dann Endergebnis mit Sonnensegel.\nText: Maßanfertigung, Douglasienholz, Bausatz oder mit Montage.\nCall to action: „Maße schicken, wir rechnen es aus.“",
    why: { de: "Vorher/Nachher funktioniert immer und bringt Anfragen für Pergolen.", nl: "Voor/na werkt altijd en levert pergola-aanvragen op." },
  },
  {
    id: "tenderflame-abend", kind: "reel", channel: "both", brand: "Tenderflame", pillar: "Gastgeber-Ideen",
    title: "Tenderflame: Tisch in 30 Sekunden gemütlich",
    idea: "Hook: „Gäste in 10 Minuten da?“\nSchnelle Schnitte: Tischdecke, Teller, Tenderflame anzünden, Licht dimmen.\nText: „Brennt mit Bio-Ethanol, kein Ruß, kein Rauch.“\nAbends filmen, warmes Licht.",
    why: { de: "Tenderflame ist ein Mitnahmeprodukt – solche Videos verkaufen direkt.", nl: "Tenderflame is een meeneemproduct – zulke video's verkopen direct." },
  },
  {
    id: "spices-rezept", kind: "reel", channel: "both", brand: "KANSO SPICES", pillar: "Outdoor Cooking",
    title: "Ein Gewürz, ein Gericht: KANSO SPICES auf dem Grill",
    idea: "Hook: „Drei Zutaten, ein Gewürz, fertig.“\nVon oben filmen: Zutaten, Gewürz drüber, auf den Grill, Anschnitt.\nText: welches Gewürz, wozu es noch passt, Preis.\nAm Ende: Etikett gut sichtbar.",
    why: { de: "Eigene Linie: jeder Aufruf ist Werbung für unsere Marke, nicht für eine fremde.", nl: "Eigen lijn: elke view is reclame voor ons eigen merk, niet voor dat van iemand anders." },
  },
  {
    id: "kamado-mythen", kind: "reel", channel: "tiktok", brand: "Kamado-Grills", pillar: "Outdoor Cooking",
    title: "Drei Dinge, die alle über Kamado-Grills falsch sagen",
    idea: "Hook: „Nein, ein Kamado ist kein teurer Kugelgrill.“\nDrei Aussagen, jede mit kurzer Antwort, direkt in die Kamera.\nIm Hintergrund der Grill im Laden. Untertitel mitlaufen lassen.",
    why: { de: "Mythen-Formate laufen auf TikTok gut und zeigen Fachwissen.", nl: "Mythe-formats lopen goed op TikTok en tonen vakkennis." },
  },
  {
    id: "sketch-kunde", kind: "reel", channel: "tiktok", pillar: "Building KANSO",
    title: "Sketch: „Ich schaue nur mal kurz“",
    idea: "Zwei Rollen (Diana und Sofia): Kundin sagt „Ich schaue nur mal kurz“ – Schnitt – 40 Minuten später mit drei Sachen an der Kasse.\nKurz, überzeichnet, mit Untertitel.\nAm Ende: Ladenschild oder Adresse.",
    why: { de: "Humor macht den Laden nahbar und ist für TikTok genau richtig.", nl: "Humor maakt de winkel toegankelijk en past precies op TikTok." },
  },
  {
    id: "styling-ecke", kind: "reel", channel: "both", brand: "Laden & Schaufenster", pillar: "Vorher/Nachher",
    title: "Eine Ecke, zwei Stimmungen",
    idea: "Dieselbe Ecke zweimal stylen: einmal ruhig und hell, einmal warm und dunkel.\nZeitraffer beim Umstellen, am Ende beide Endbilder nebeneinander.\nText: welche Produkte, welcher Anlass.",
    why: { de: "Zeigt, dass wir gestalten können – und verkauft mehrere Produkte auf einmal.", nl: "Laat zien dat we kunnen stylen – en verkoopt meerdere producten tegelijk." },
  },
  {
    id: "schaufenster", kind: "story", channel: "both", brand: "Laden & Schaufenster", pillar: "Building KANSO",
    title: "Story-Serie: neues Schaufenster von Anfang bis Ende",
    idea: "Vier bis fünf Storys über den Tag: leeres Fenster, Aufbau, Detail, Ergebnis am Abend, Frage-Sticker „Was fällt euch zuerst ins Auge?“",
    why: { de: "Storys dürfen roh sein – und der Frage-Sticker bringt Antworten für die Kundenfragen-Liste.", nl: "Stories mogen rauw zijn – en de vragensticker levert antwoorden voor de klantvragenlijst." },
  },
  {
    id: "textil-lapuan", kind: "post", channel: "instagram", brand: "Lapuan Kankurit", pillar: "Design & Materialien",
    title: "Warum ein Handtuch aus Finnland 50 Euro kostet",
    idea: "Karussell: 1) Frage, 2) Weberei in Finnland (Foto vom Material), 3) Leinen: was es besser macht, 4) wie lange es hält, 5) bei uns ab … Euro.\nRuhiger Ton, kein Verkaufsdruck.",
    why: { de: "Preis erklären statt verteidigen – das ist unsere Art von Beratung.", nl: "Prijs uitleggen in plaats van verdedigen – dat is onze manier van adviseren." },
  },
  {
    id: "kerzen-keramik", kind: "reel", channel: "both", brand: "Kerzen", pillar: "Gastgeber-Ideen",
    title: "Kerzen richtig stellen: drei Höhen, eine Linie",
    idea: "Hook: „So stellt man Kerzen, damit es teuer aussieht.“\nDrei Varianten zeigen, die dritte ist die schöne.\nText: Regel mit drei Höhen, ungerade Anzahl, eine Farbe.",
    why: { de: "Nützliche Tipps werden gespeichert – und man braucht dafür mehrere Kerzen.", nl: "Nuttige tips worden opgeslagen – en je hebt er meerdere kaarsen voor nodig." },
  },
  {
    id: "spirituosen", kind: "reel", channel: "both", brand: "Alkoholfreie Spirituosen", pillar: "Gastgeber-Ideen",
    title: "Alkoholfreier Aperitif in einem Glas",
    idea: "Von oben filmen: Eis, Spirituose, Tonic, Garnitur.\nText: welches Produkt, wie es schmeckt (drei Wörter), Preis.\nHook: „Aperitif ohne Alkohol, der nicht nach Saft schmeckt.“",
    why: { de: "Kleines Mitnahmeprodukt mit gutem Anlass – Freitag posten.", nl: "Klein meeneemproduct met een goede aanleiding – op vrijdag posten." },
  },
  {
    id: "kundenfrage", kind: "reel", channel: "both", pillar: "Building KANSO",
    title: "Kundenfrage der Woche – wir antworten",
    idea: "Eine echte Frage aus der Liste „Kundenfragen“ vorlesen und in 20 Sekunden beantworten.\nDirekt in die Kamera, im Laden, ohne Schnitt.\nJede Woche dieselbe Struktur, damit es eine Serie wird.",
    why: { de: "Nutzt, was wir sowieso notieren – und beantwortet Fragen, die viele haben.", nl: "Gebruikt wat we toch al opschrijven – en beantwoordt vragen die veel mensen hebben." },
  },
  {
    id: "lueneburg", kind: "reel", channel: "tiktok", brand: "Lüneburg", pillar: "Building KANSO",
    title: "Lüneburg-Tipp: Kaffee, Runde, bei uns vorbei",
    idea: "Drei Stopps in der Stadt in 20 Sekunden, letzter Stopp ist unser Laden mit Adresse im Bild.\nHook: „Wenn du einmal in Lüneburg bist.“",
    why: { de: "Lokale Reichweite: Menschen, die wirklich vorbeikommen können.", nl: "Lokaal bereik: mensen die echt langs kunnen komen." },
  },
  {
    id: "neu-eingetroffen", kind: "story", channel: "both", pillar: "Building KANSO",
    title: "Neu eingetroffen: Karton auspacken",
    idea: "Story oder kurzes Reel beim Auspacken einer Lieferung: Karton, erstes Teil, Detail, im Regal.\nText: „Ab heute im Laden.“ Sticker mit Link zum Shop.",
    why: { de: "Schnell gemacht, direkt aktuell – und es zeigt, dass sich der Laden bewegt.", nl: "Snel gemaakt, direct actueel – en het laat zien dat er beweging in de winkel zit." },
  },
  {
    id: "teppich-terrasse", kind: "post", channel: "instagram", brand: "Outdoor-Teppiche", pillar: "Design & Materialien",
    title: "Outdoor-Teppich: der Trick für eine gemütliche Terrasse",
    idea: "Zwei Fotos derselben Terrasse, einmal ohne, einmal mit Teppich.\nText: Größe richtig wählen, Material, wetterfest, Pflege in einem Satz.",
    why: { de: "Einfaches Vorher/Nachher mit einem Produkt, das man sofort mitnehmen kann.", nl: "Simpel voor/na met een product dat je direct mee kunt nemen." },
  },
  {
    id: "team-tag", kind: "reel", channel: "both", pillar: "Building KANSO",
    title: "Ein Tag mit uns im Laden",
    idea: "Sechs bis acht Clips von 2 Sekunden über den Tag: Tür auf, Kaffee, Regal auffüllen, Kundin beraten, Paket packen, Licht aus.\nText: die Uhrzeit im Bild.",
    why: { de: "Menschen folgen Menschen. Und ihr seid das Gesicht dieses ersten Jahres.", nl: "Mensen volgen mensen. En jullie zijn het gezicht van dit eerste jaar." },
  },
];
