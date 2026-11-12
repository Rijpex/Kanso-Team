/**
 * Verkaufsseiten im Wissen (Kategorie "verkauf"): für Mathias und alle, die im Laden verkaufen.
 * Werden einmalig angelegt (on conflict do nothing) – danach pflegen Bas und Lea sie in der Hub.
 * Alles mit [[BAS PRÜFEN: …]] ist eine Annahme, die Bas oder Lea noch bestätigen müssen.
 */
export const VERKAUF_PAGES: { slug: string; title_de: string; title_nl: string; body_de: string; position: number }[] = [
  {
    slug: "verkauf-start",
    title_de: "So verkaufen wir bei Kanso",
    title_nl: "Zo verkopen we bij Kanso",
    position: 1,
    body_de: `## Kurz gesagt

Wir beraten, wir drängen nicht. Wer bei uns kauft, soll das Gefühl haben, dass er gut beraten wurde – auch wenn er erst beim zweiten Besuch kauft. Ein Kunde, der ohne Kauf geht, aber mit einem guten Gespräch, kommt wieder.

## Drei Regeln für Rabatte

1. **Nie von selbst Rabatt anbieten.** Erst, wenn der Kunde fragt.
2. **Klein anfangen.** Wer nach Rabatt fragt, bekommt zuerst das kleinere Angebot (siehe Produktseiten). Nur wenn er ein konkretes Angebot kennt (z. B. die 10 % von Tenderflame), ziehen wir gleich.
3. **Projekte entscheiden Bas und Lea.** Bei Küchen, Pergolen und Einrichtungsprojekten keine Zusagen zu Preis oder Rabatt. Du nimmst alles auf, Bas oder Lea melden sich beim Kunden.

Die genauen Regeln pro Marke stehen auf den Produktseiten.

## Leads: das zählt für deine Projektprovision

Ein Lead ist jemand, der sich für eine Outdoor-Küche, eine Pergola oder ein Einrichtungsprojekt interessiert – aus deinem Netzwerk oder aus einer Beratung in deiner Schicht. Trag ihn sofort auf „Heute" als **Projekt-Interessent** ein, mit:

- Name und Kontakt (Telefon oder E-Mail)
- Was gewünscht ist (Küche, Pergola, Einrichtung, welche Größe, wofür)
- Budget, wenn genannt, und wann es losgehen soll
- Hake „Bas oder Lea sollen nachfassen" an

Bestellt der Kunde innerhalb von sechs Monaten, zählt das Projekt. Kunden, die schon mit Bas und Lea im Gespräch sind oder über Website, Mail oder Telefon angefragt haben, zählen nicht – deshalb immer kurz fragen: „Hattet ihr schon Kontakt mit uns?"

## Jede Kundenfrage ist wertvoll

„Habt ihr das auch in Grün?", „Kann ich das online bestellen?", „Liefert ihr nach Hamburg?" – alles unter **Kundenfragen** notieren. Daraus lernen wir, was im Laden fehlt.

## Kasse, Öffnen, Schließen

Die Kasse läuft auf dem iPad, Kartenzahlung über das Stripe-Terminal. Bargeld wird ins Kassenbuch eingetragen und abends gezählt. Alles dazu steht unter **Kasse & Kassenbuch** im Wissen. Öffnen und Schließen machen Bas oder Lea – du bist nie allein im Laden.

## Deine Menschen

- **Lea** – Gestaltung, Marke, Beratung · +49 1523 3836673
- **Bas** – Systeme, Konstruktion, Aufbau · +31 6 30512992
- Krank oder verhindert? Lea anrufen oder schreiben, so früh wie möglich.

## Öffnungszeiten

Mo, Di, Do 10:30–18:30 · Mi 09:30–17:30 · Fr 10:30–18:30 · Sa 09:30–18:30 (Fr und Sa ab 16. November 2026). Deine Schicht sind die letzten vier Stunden des Tages: 14:30–18:30.`,
  },
  {
    slug: "verkauf-tenderflame",
    title_de: "Tenderflame verkaufen",
    title_nl: "Tenderflame verkopen",
    position: 2,
    body_de: `## Was es ist

Tischfeuer und Kerzen mit echter Flamme – ohne Rauch, ohne Ruß, ohne Kamin. Sie brennen mit **Tenderfuel**, einem bio-basierten Brennstoff, über einen Docht aus Stahl.

## Die drei Sätze, die den Unterschied machen

1. **„Das ist kein Bio-Ethanol."** Tenderfuel entzündet sich erst ab etwa 100 °C. Fällt das Tischfeuer um oder kleckert etwas, gibt es keine Stichflamme. Bio-Ethanol entzündet sich schon bei 13 °C.
2. **„Drinnen und draußen."** Kein Rauch, kein Ruß, kein scharfer Alkoholgeruch, keine schwarzen Ränder an der Decke. Auf dem Esstisch genauso wie auf der Terrasse.
3. **„Anzünden, fertig."** Tenderfuel einfüllen, Docht anzünden. Kein Installateur, kein Gasanschluss, keine Wartung. Zwei Jahre Garantie auf den Stahldocht.

## Sortiment bei uns

Tischfeuer (ab 27,90 €), Kerzen zum Nachfüllen, Geschenksets, Tenderfuel und Anzünder. Linien: Cycloflame, Natural Concrete, Brushed Steel, Agni, Glow by vtwonen; für draußen Vulcan. [[BAS PRÜFEN: welche Linien und Größen wir aktuell im Laden haben]]

## Rabattregel Tenderflame

Tenderflame bietet auf der eigenen Website regelmäßig **10 % Rabatt** an (Newsletter / Aktion). Kunden wissen das manchmal.

- Kunde fragt nach Rabatt und **nennt die 10 % von Tenderflame**: wir ziehen gleich und geben 10 %. Wir wollen nicht, dass er online kauft.
- Kunde fragt nach Rabatt, **kennt die Aktion aber nicht**: erst 5 % anbieten. Nur wenn er darauf besteht, auf 10 % gehen.
- Kunde fragt nicht: kein Rabatt.

## Dazu verkaufen

Zu jedem Tischfeuer gehört Tenderfuel – frag immer: „Hast du schon Brennstoff zu Hause?" Ein Liter reicht lange, deshalb nehmen viele gleich die große Flasche. Zum Geschenk: Set mit Tischfeuer plus 0,5 l Tenderfuel.

## Vorführen

Zünde eines an, wenn ein Kunde zögert. Die Flamme verkauft sich selbst. Brennendes Tischfeuer nie unbeaufsichtigt lassen, beim Schließen alle Flammen doppelt prüfen.`,
  },
  {
    slug: "verkauf-koala-kitchens",
    title_de: "KOALA Kitchens verkaufen",
    title_nl: "KOALA Kitchens verkopen",
    position: 3,
    body_de: `## Was es ist

Modulare Outdoor-Küchen aus den Niederlanden: Gestell aus verzinktem, pulverbeschichtetem Stahl, Arbeitsplatte aus **Dekton** (kratz-, hitze- und UV-fest, pflegefrei). Ganzjährig draußen, wetterfest. Mittleres Premium-Segment: ab etwa 4.500 €, mit allem Drum und Dran bis rund 20.000 €.

## Aufbau

Module frei kombinieren: Grillmodul (Kamado oder Napoleon-Gasgrill), Spüle, Kühlschrank, Schubladen, Türen (Stahl oder Holz, z. B. Eiche), Arbeitsflächen. Fünf Gestellfarben: **Schwarz, Anthrazit, Grün, Champagne, Marrone**. Sechs Dekton-Dekore: Aura, Ava, Bromo, Entzo, Kelya, Laurent.

## Die drei Küchen im Showroom

1. **Schwarz mit Dekton Kelya** – äußere Schränke mit Eichentüren, rechts Schubladen, in der Ecke das BBQ-Modul. Verkaufspreis 10.799 €.
2. **Marrone mit Dekton Entzo** – links neben dem Kühlschrank die Napoleon-Module. Verkaufspreis 7.782,50 €.
3. **Champagne mit Dekton Ava** – Verkaufspreis 4.847 €.

Preise inkl. MwSt., Stand März 2026. [[BAS PRÜFEN: Preise aktuell? Lieferung und Montage inklusive?]]

## Aktion bis Dezember

**10 % Vorbestell-Rabatt** für alle, die bis Ende Dezember bestellen. Bedingung: 50 % Anzahlung bei Bestellung, der Rest vor Lieferung. Lieferung dann **März / April** – pünktlich zur Saison. Das ist das Argument für den Winterkauf: „Jetzt planen, im Frühling grillen – und 10 % sparen."

## Ablauf und Zeiten

Beratung bei uns oder beim Kunden zu Hause (Aufmaß, Platz, Wasser- und Stromanschluss). Planung und Angebot machen Bas und Lea. Lieferzeit ab Bestellung etwa 6 Wochen für die Gestelle, Arbeitsplatten etwa 4 Wochen nach endgültigem Aufmaß. Lieferung und Montage durch unser Team.

## Dein Part im Gespräch

Du klärst den Bedarf und machst Lust: Wie groß ist die Terrasse, wie oft wird gekocht, Gas oder Holzkohle, was ist das Budget, bis wann soll es stehen? Alles als **Projekt-Interessent** eintragen – eine Küche ist ein Projekt über 4.000 € und zählt für deine Provision. Keine Preiszusagen, keine Rabattzusagen außer der laufenden Aktion.

## Einwände

- „Das ist teuer." – Dekton und Stahl halten Jahrzehnte, keine Pflege, kein Abdecken. Vergleich: eine Innenküche kostet mehr und steht nicht im Regen.
- „Rost?" – Verzinkt und pulverbeschichtet, dafür gebaut.
- „Ich will erst sehen, wie es aussieht." – Genau dafür stehen drei Küchen im Laden. Und der Konfigurator von KOALA zeigt die Küche per AR auf der eigenen Terrasse.`,
  },
  {
    slug: "verkauf-vesper-kitchens",
    title_de: "Vesper Kitchens verkaufen",
    title_nl: "Vesper Kitchens verkopen",
    position: 4,
    body_de: `## Was es ist

Unsere High-End-Linie: modulare Outdoor-Küchen aus **Edelstahl, in Europa gefertigt** und von Hand gebaut. Für Kunden, die das Beste wollen und bei denen Material und Verarbeitung zählen. Ab etwa 6.000 €.

## Module

Grill, Spüle und Stauraum, frei nach dem Grundriss des Kunden geplant. Drei Modelle im Showroom – Oberflächen Geist, Champagne und Braun. [[BAS PRÜFEN: Modellnamen, Ausstattung und Preise der drei Showroom-Modelle; Lieferzeit; Garantie]]

## Vesper oder KOALA?

- **KOALA**: pulverbeschichteter Stahl mit Dekton-Platte, viele Farben, bestes Preis-Leistungs-Verhältnis. Für die meisten Familien die richtige Wahl.
- **Vesper**: massiver Edelstahl, Manufaktur-Qualität, das Küchen-Gefühl von drinnen nach draußen. Für Kunden mit höherem Budget oder Architekten-Projekten.

Frag nach Budget und Anspruch, dann zeig die passende Küche zuerst. Beide stehen im Laden.

## Dein Part

Wie bei KOALA: Bedarf klären, Lust machen, als **Projekt-Interessent** eintragen. Planung, Angebot, Preis und Rabatt machen Bas und Lea.`,
  },
  {
    slug: "verkauf-lueneburg-haeuschen",
    title_de: "Lüneburg Windlicht-Häuschen verkaufen",
    title_nl: "Lüneburg Windlicht-Häuschen verkopen",
    position: 5,
    body_de: `## Was es ist

Unsere eigenen Windlichter: fünf Lüneburger Wahrzeichen aus 2 mm Stahlblech, lasergeschnitten und schwarz matt pulverbeschichtet. Ein Teelicht dahinter, und die Fenster leuchten. Das Lüneburg-Geschenk – für Einheimische, Ehemalige und Besucher.

## Die fünf Motive

- **Am Sande** – der Backsteingiebel am großen Platz
- **Alter Kran** – der Holzkran am Stintmarkt
- **Rathaus** – Arkaden, Mittelbau und Turm
- **St. Johannis** – die Kirche mit dem schiefen Turm (das höchste, 20,5 cm)
- **Wasserturm** – der neugotische Turm

Zwischen 12 und 21 cm hoch, 120 bis 270 g. Passt jedes Teelicht bis 39 mm, auch LED.

## Preise

- Einzeln **27,90 €**
- Zwei **52 €**, drei **75 €**
- Alle fünf **109 €** [[BAS PRÜFEN: Website nennt an einer Stelle 119 €, an anderer 109 €]]

Jedes Häuschen kommt in einer braunen Klappschachtel mit Teelicht und einer Karte zum Beschriften – die Geschenkverpackung ist inklusive, das sagst du dazu.

## So verkaufst du es

- „Welches ist deins?" – fast jeder Lüneburger hat eine Verbindung zu einem der Gebäude. Lass ihn wählen, dann kommt das zweite oft von selbst (zwei für 52 €).
- Geschenkfrage: „Für wen soll es sein – wohnt die Person hier oder vermisst sie Lüneburg?" Das Häuschen reist gut, 4,90 € Versand in Deutschland, ab drei kostenlos.
- Zeig es brennend. Ein Teelicht im Häuschen auf dem Counter macht mehr als jedes Wort.
- Firmen und Vereine: alle fünf als Set, Weihnachtsgeschenk für Mitarbeiter. Interesse an größeren Mengen → an Bas und Lea weitergeben.

## Gut zu wissen

Vorderseite wird handwarm, die Fensterränder heißer – nach dem Löschen ein paar Minuten warten. Draußen nur überdacht; die Schnittkante kann bei Dauerregen Flugrost ansetzen. Kein Rabatt – das ist unser eigenes Produkt mit fairem Preis.`,
  },
  {
    slug: "verkauf-rijpex-pergola",
    title_de: "Rijpex Pergola verkaufen",
    title_nl: "Rijpex pergola verkopen",
    position: 6,
    body_de: `## Was es ist

Holzpergolen aus massiver **Douglasie** (FSC/PEFC), auf Maß, mit Sonnensegeln und Seitenwänden. Bas' eigene Marke – wir bauen sie selbst. Geliefert als Bausatz oder mit Montage durch unser Team.

## Standardgrößen und Startpreise (inkl. MwSt.)

- **Anbau-Pergola** 400 × 200 cm, an der Wand, 2 Pfosten, 1 Segel: ab 1.400 €
- **Freistehend** 530 × 330 cm, 4 Pfosten, 1 Segel: ab 2.100 €
- **XL** 1200 × 500 cm, mit Zwischenpfosten und 3 Segeln: ab 5.800 €

Standardgrößen sind auf Lager (etwa 1 Woche), Maßanfertigung etwa 15 Arbeitstage. Der Konfigurator auf der Website geht von 200 bis 1500 cm Länge und 200 bis 600 cm Breite. Jede Pergola kommt unbehandelt, mit 2,5 l Remmers-Lasur in Farblos, Nussbaum oder Schwarz.

## Sonnenschutz und Wände

Segel als Harmonika (faltbar), gespanntes Rechteck, Dreieck, Schiebesegel oder Rankgitter – in 7 Farben, gleich für Dach und Seiten. Die Segel sind wasserdurchlässig, **kein Regendach**. Seitenwände: drehbare Lamellenwand, Schiebewand, Rollwand oder Rollo nach Maß, ganz oder einen Meter hoch. Wer ein festes Dach will: an Bas verweisen.

## Montage

Bausatz: vorgeschnittenes Holz, Metallverbinder, Schrauben, Kappen, Anleitung – zwei Personen mit normalem Werkzeug schaffen das. Montage durch uns ab 1.245 € im Umkreis von 60 km um Lüneburg. Fundamente extra: Betonpunkte 60 cm oder Fußplatten für Terrasse.

## Dein Part im Gespräch

Du sammelst, was Bas für das kostenlose Entwurfskonzept braucht:

- Fotos der Terrasse oder des Gartens (Handy reicht)
- Ungefähre Maße und: an die Wand oder freistehend?
- Wo steht die Sonne nachmittags, wovor soll die Pergola schützen?
- Bausatz oder Montage, Wunschtermin

Als **Projekt-Interessent** eintragen – eine Pergola ab 4.000 € zählt für deine Provision. Preis und Angebot kommen von Bas.`,
  },
  {
    slug: "verkauf-luca-lifestyle",
    title_de: "Luca Lifestyle Pflanzgefäße verkaufen",
    title_nl: "Luca Lifestyle plantenbakken verkopen",
    position: 7,
    body_de: `## Was es ist

Handgemachte Pflanzgefäße aus Vietnam, leicht und wetterfest, mit **5 Jahren Garantie**. Sehen aus wie Beton, Stein oder Ton, wiegen aber einen Bruchteil – ein großes Gefäß trägt man allein. Bis 120 cm hoch.

## Die Linien

- **Grigio** – Beton-Optik
- **Terreno** – Ton-Optik mit feinem Relief
- **Liscio, Ruvido, Bordo, Argento, Rondello** – glatt, rau, mit Rand, metallisch, rund
- **Luca Exclusive** – Komposit-Material, die edelste Linie

Material: leichtes Polyester bzw. Komposit. Weerbestendig, aber: [[BAS PRÜFEN: frostfest ohne Einschränkung? Ablauflöcher vorgebohrt?]]

## So beraten wir

Wir verkaufen keine einzelnen Töpfe, wir gestalten Ecken. Frag: Wo soll es stehen (Eingang, Terrasse, Balkon), welcher Stil (Haus, Möbel, Farben), was soll hinein? Dann schlag eine Gruppe vor: **drei Gefäße, drei Höhen, eine Farbe** – das wirkt immer.

- Zeig die Kombination im Laden, stell sie zusammen.
- Wir bieten **Beratung zu Hause** an: wir kommen vorbei, schauen uns die Terrasse an und machen einen Vorschlag.
- Wir **bestellen Gefäße speziell für den Kunden** – Größe, Form und Farbe aus dem ganzen Luca-Sortiment, nicht nur, was im Laden steht. [[BAS PRÜFEN: Lieferzeit Sonderbestellung]]

## Rabattregel

Bei mehreren Gefäßen ist ein Rabatt möglich – aber **nicht von selbst anbieten**. Erst wenn der Kunde fragt, und dann mit Bas oder Lea abstimmen, wie viel. [[BAS PRÜFEN: Spielraum in Prozent ab wie vielen Gefäßen]]

## Dazu verkaufen

Pflanzen stehen nicht bei uns, aber Gestaltung: Dekosteine und Wandhalter aus der Luca-Linie, Outdoor-Teppich darunter, Tenderflame daneben. Wer eine Terrasse neu macht, ist ein Pergola- oder Küchen-Lead – frag nach.`,
  },
];
