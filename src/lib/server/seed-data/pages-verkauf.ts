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
    title_de: "Tenderflame",
    title_nl: "Tenderflame",
    position: 2,
    body_de: `## Was es ist

Tischfeuer und Kerzen mit echter Flamme – ohne Rauch, ohne Ruß, ohne Kamin. Sie brennen mit **Tenderfuel**, einem pflanzlichen Brennstoff, über einen Docht aus Stahl. **Zwei Jahre Garantie** auf den Stahldocht.

## Die drei Sätze, die den Unterschied machen

1. **„Das ist kein Bio-Ethanol."** Tenderfuel entzündet sich erst ab etwa 100 °C und nur am Stahldocht. Fällt das Tischfeuer um oder kleckert etwas, gibt es keine Stichflamme. Bio-Ethanol entzündet sich schon bei 13 °C.
2. **„Drinnen und draußen."** Kein Rauch, kein Ruß, kein Alkoholgeruch, keine schwarzen Ränder an der Decke. Auf dem Esstisch genauso wie auf der Terrasse (draußen windgeschützt).
3. **„Anzünden, fertig."** Tenderfuel einfüllen, Docht anzünden. Kein Gasanschluss, keine Wartung.

## Füllmenge und Brenndauer – immer dazusagen

Der Kunde will wissen, wie lange ein Abend reicht. Beispiel **Café 14: 250 ml Tank, brennt 4–5 Stunden**. Die kleinen Lilly-Modelle brennen länger, der Cycloflame kürzer. **Die genauen Werte stehen im Tenderflame-Katalog bei jedem Modell** – schlag sie dort mit dem Kunden nach, statt zu raten. Ein Liter Tenderfuel (11,99 €) reicht für vier bis fünf Füllungen – „ein Liter reicht viele Abende".

Nur Tenderfuel verwenden – kein Bioethanol, kein Lampenöl.

## Was gut läuft – verkauf Sets, nicht einzelne Teile

- **Lilly 10 Geschenkset** mit 0,5 l Tenderfuel (29,95 €, Kupfer oder Schwarz) – unser Bestseller, das perfekte Geschenk: auspacken, einfüllen, anzünden.
- **Lilly 8 & 10 Duo Pack** (29,90 €) – zwei Größen, zwei Kerzen auf dem Tisch.
- **Cycloflame Table** (119,90 €) – die Flamme dreht sich langsam im Glaszylinder, 38 cm hoch. Verkauft sich hier richtig gut, am besten brennend auf dem Counter.
- Daneben: Breeze 10 (auch als Duo Pack), Café 14 / 18, Globus, Tulip, Rosie, Aster, Daisy, Cycloflame Wall.

Was im Laden steht, haben wir. Will der Kunde eine andere Farbe, Größe oder ein Modell aus dem Katalog: **bestellen wir einfach für ihn** – aufnehmen als Kundenwunsch in der Hub, Bas oder Lea bestellen.

## Katalog mitgeben – aber richtig

Den Tenderflame-Katalog geben wir **nicht einfach so** mit, nur bei echtem Interesse. Und dann immer mit diesem Satz: „Wenn du online schaust und irgendwo einen besseren Preis siehst: **wir garantieren dir den günstigsten Preis** – und du zahlst keinen Versand, weil du es bei uns abholst. Oder wir schicken es dir." Ziel: Der Kunde kauft bei uns, nicht bei Tenderflame oder Amazon.

## Rabattregel Tenderflame

Tenderflame bietet auf der eigenen Website regelmäßig **10 % Rabatt** an. Kunden wissen das manchmal.

- Kunde fragt nach Rabatt und **nennt die 10 % von Tenderflame**: wir ziehen gleich und geben 10 %.
- Kunde fragt nach Rabatt, **kennt die Aktion nicht**: erst 5 % anbieten. Nur wenn er darauf besteht, auf 10 % gehen.
- Kunde fragt nicht: kein Rabatt.

## Dazu verkaufen – jedes Mal

1. **Tenderfuel.** Ohne Brennstoff brennt nichts: „Hast du schon Tenderfuel zu Hause?" 1 l (11,99 €) oder gleich 2,5 l (27,99 €).
2. **Pen Torch Feuerzeug** (14,95 €, Schwarz oder Bronze) – ganz am Ende, an der Kasse: „Ein normales Feuerzeug geht auch, aber das dauert ewig – mit dem Pen Torch brennt es in einer Sekunde." Fast jeder nimmt es.

## Der Tipp an der Kasse

Beim Bezahlen immer sagen: **„Wenn du das Tischfeuer ein paar Tage nicht benutzt, gieß den Brennstoff zurück in die Flasche."** Bleibt Tenderfuel im Tank stehen, zieht es Feuchtigkeit (Kondens) – beim nächsten Anzünden knistert und spuckt die Flamme, und man muss den Brennstoff wechseln. Also: ausblasen, abkühlen lassen, zurück in die Flasche. Das erspart Reklamationen und macht den Kunden glücklich.

## Vorführen

Zünde eines an, wenn ein Kunde zögert – die Flamme verkauft sich selbst. Brennendes Tischfeuer nie unbeaufsichtigt lassen, beim Schließen alle Flammen doppelt prüfen.`,
  },
  {
    slug: "verkauf-koala-kitchens",
    title_de: "KOALA Kitchens verkaufen",
    title_nl: "KOALA Kitchens verkopen",
    position: 3,
    body_de: `## Was es ist

Modulare Outdoor-Küchen aus den Niederlanden, von Hand gebaut: Gestell aus verzinktem, pulverbeschichtetem Stahl (auch innen in den Rohren beschichtet – kein Rost), Arbeitsplatte aus **Dekton** (nimmt kein Wasser und kein Fett an, hitze-, UV- und frostfest, 25 Jahre Herstellergarantie von Cosentino). Bleibt das ganze Jahr draußen stehen. **5 Jahre Garantie** auf Konstruktion und Verarbeitung. Für jede verkaufte Küche wird ein Baum gepflanzt.

Preise sind Endpreise **inkl. MwSt., Lieferung und Montage**: zwei Leute stellen die Küche auf, richten sie aus und nehmen die Verpackung mit. Im Umkreis von 65 km um Lüneburg ist das im Preis drin, weiter weg kommt die Anfahrt dazu (Bas und Lea nennen den Betrag). Der Kunde braucht nur einen ebenen Untergrund und einen Weg, der breit genug ist. Strom und Wasser (nur für Kühlschrank, Licht oder Spüle nötig) legt der Kunde mit seinem Elektriker / Installateur.

## Die drei Küchen im Showroom

Die Preise stehen auf dem Preisschild an der jeweiligen Küche – das ist die Referenz, nicht dein Gedächtnis.

1. **Schwarz mit Dekton Kelya** – äußere Schränke mit Eichentüren, rechts Schubladen, in der Ecke das BBQ-Modul.
2. **Marrone mit Dekton Entzo** – links neben dem Kühlschrank die Napoleon-Module.
3. **Champagne mit Dekton Ava** – der kompakte Einstieg.

## Aufbau und Möglichkeiten

Alles basiert auf **60 × 60 cm Modulen** im 15-cm-Raster, Breiten von 60 bis 240 cm. Formen: gerade Zeile, L-Form (Ecke), Insel, U-Form oder zwei Zeilen gegenüber. Module: Türen, Schubladen, offenes Regal, Grillmodul, Spüle, Kühlschrank.

- **Gestellfarben** (ohne Aufpreis): Schwarz, Anthrazit, Dunkelgrün, Champagne, Marrone.
- **Fronten**: Holz in Fraké oder amerikanischer Eiche, als Planchet (Lamellen) oder Rhombus – oder ohne Holz, dann Stahl in der Gestellfarbe.
- **Dekton-Dekore** (ohne Aufpreis): Laurent, Kelya, Bromo, Trevi, Sandik, Aura, Ava, Entzo.
- **Unterbau**: Rollen, Stellfüße oder Sockelblende.
- **Extras**: Spüle, Kühlschrank, Kamado (Moddern), Napoleon-Einbaugasgrill, Kochfeld, integrierte Steckdose, Spritzschutz. Grill und Kamado sind immer extra und werden vor der Lieferung eingepasst.

Eine Musterbox mit Holz, Dekton und Lack kann der Kunde mitnehmen oder ausleihen.

## Richtpreise (Konfigurator, inkl. MwSt., Lieferung und Montage)

Standard: schwarzes Gestell, Stahlfronten, Dekton, auf Rollen. Kamado und Gasgrill extra.

| Startmodell | Größe | ab |
|---|---|---|
| Kompakt | ca. 1,20 m, 2 Module | 3.470 € |
| Kamado | ca. 1,30 m, mit Kamado-Modul | 4.320 € |
| Grill × Kühlung | ca. 1,90 m, mit Kühlschrank | 6.270 € |
| Full Service | ca. 2,50 m, mit Spüle | 8.700 € |
| Corner | ca. 2,50 × 1,20 m, L-Form | 9.370 € |

Mit Holzfronten, Kühlschrank, Spüle und Grill landet eine volle Küche meist zwischen 8.000 und 15.000 €. Der Konfigurator auf kanso-outdoor.com/konfigurator zeigt die Küche in 3D – der Kunde kann ohne Account starten, ein PDF speichern und zum Termin mitbringen.

## Neu ab 2027: Organic und Pebble

Zeig das Vorschau-PDF (Sneak Preview 2027) – es liegt im Laden und in der Hub:

- **Organic** – abgerundete Ecken und fließende Übergänge, die Küche „verschmilzt mit dem Garten". Drei Bausteine: **Organic Sides** (runde Seitenteile inkl. Arbeitsplatte, **1.669 €** zusätzlich zur Küche), **Organic Open** (offene Ausführung) und **Organic Closed** (geschlossene Ausführung) – beide kosten so viel wie ein Standard-BBQ-Modul. Sides lassen sich mit Open oder Closed kombinieren.
- **Pebble** – neue, warme, ruhige Farbe (Greige/Taupe) als sechste Gestellfarbe.
- **Einstiegsmodell** – immer Organic Open in Pebble mit Dekton Keena: **zwei Module** (Standard + BBQ, links oder rechts) **2.695 €**, **drei Module** (Standard + BBQ + Standard, je mit oder ohne Ablage) **3.795 €**. Unverbindliche Preise inkl. MwSt.

Argument: Wer jetzt mit dem Frühbucher-Rabatt bestellt, bekommt die Küche im Frühjahr – und wer sich für Organic interessiert, lässt sich von Bas und Lea beraten, ob und wie das schon in die Bestellung passt.

## Saisonvorteil bis 31. Dezember

**10 % Rabatt auf die komplette Outdoor-Küche** für alle, die bis 31. Dezember bestellen. Gilt auch für Kühlschrank, Spüle und Armatur – **nicht** für Gasgrill oder Kamado. Die Bestellung muss vor dem 1. Januar eingegangen und vollständig freigegeben sein. Bei uns: **50 % Anzahlung** bei Bestellung, der Rest vor Lieferung. **Lieferung im März oder April, garantiert** – pünktlich zur Saison. Das ist das Argument für den Winterkauf: „Jetzt planen, im Frühling grillen – und 10 % sparen." Den Flyer gibt es zum Mitgeben.

## Ablauf

1. Bedarf klären (siehe unten), Interesse als **Projekt-Interessent** in die Hub.
2. Bas oder Lea planen: beim Kunden (Aufmaß, Platz, Anschlüsse) oder nach Fotos und Maßen. Zeichnung und Festpreis.
3. Nach Freigabe wird gebaut: etwa **6–8 Wochen** ab Bestellung (außerhalb der Aktion).
4. Lieferung und Montage durch unser Team; Terminvorschlag kommt mit der Bestellung.

Bis zum ersten Frost: Wasserleitung entleeren, Grill abdecken. Schrank, Platte und Beschläge bleiben draußen.

## Dein Part im Gespräch

Wie groß ist die Terrasse, wo soll die Küche stehen (frei, unter Dach, Pergola, Balkon)? Wie oft wird gekocht, Gas oder Holzkohle? Spüle und Kühlschrank gewünscht? Budget (bis 5.000 / 5–8 / 8–12 / über 12.000 €)? Bis wann soll sie stehen? Alles in die Hub – eine Küche ist ein Projekt über 4.000 € und zählt für deine Provision. Keine Preiszusagen außer den Richtpreisen, kein Rabatt außer dem Saisonvorteil.

## Einwände

- „Das ist teuer." – Dekton und Stahl halten Jahrzehnte, keine Pflege, kein Abdecken, Lieferung und Montage sind drin. Eine Innenküche kostet mehr und steht nicht im Regen.
- „Rost?" – Verzinkt und pulverbeschichtet, auch innen. Dafür gebaut.
- „Ich will erst sehen, wie es aussieht." – Dafür stehen drei Küchen im Laden, und der Konfigurator zeigt sie in 3D. Musterbox mitgeben.
- „Ich brauche eine Sonderform." – Dann ist **Vesper** die Antwort (eigene Seite).`,
  },
  {
    slug: "verkauf-vesper-kitchens",
    title_de: "Vesper Kitchens verkaufen",
    title_nl: "Vesper Kitchens verkopen",
    position: 4,
    body_de: `## Was es ist

Unsere High-End-Linie: Designer-Outdoor-Küchen aus **Edelstahl, entwickelt und gefertigt in Italien**. Kein festes Raster – Vesper wird nach dem Grundriss des Kunden geplant, jede Abmessung und Form ist möglich (Ecken, Überstände, Inseln). Für Kunden mit höherem Budget, Architekten-Projekte und Terrassen, auf denen eine Modulküche nicht passt.

**Preise**: ab etwa 6.000 €, typische Konfigurationen liegen zwischen **8.000 und 35.000 €** – je nach Größe, Modulen und Geräten. Die Preise für die drei Showroom-Modelle stehen auf dem Preisschild. Lieferzeit ist länger als bei KOALA und wird mit dem Angebot genannt.

## Material

- Korpus aus Edelstahl **AISI 304 / 316** (je nach Bauteil), Fronten aus Edelstahl oder beschichtetem Zink-Magnesium mit integriertem Griff.
- Arbeitsplatte standardmäßig **4 mm gebürsteter Edelstahl**, optional **Dekton** in mehreren Farben.
- Höhenverstellbare Füße, Push-Latches im Yacht-Stil, Vollauszüge bis 60 cm auf Edelstahlführungen. Schubladenseiten weiß oder schwarz, Edelstahl optional.
- Pflege: Edelstahl entlang der Schliffrichtung reinigen, kein Chlor, keine Säuren, kein Entkalker; beschichtete Flächen mit neutraler Seife.

## Module und Breiten

Türmodule 45 / 50 / 60 cm, Doppeltüren 90 / 120 cm · Schubladenmodule 50 / 60 / 90 / 120 cm · BBQ-Module 90 / 120 cm (Grill separat) · offene Module 90 / 120 cm · Hochschränke 60 cm breit, 120 cm hoch · Spülen- und Kochfeldmodule, Kühlschrankmodule, Eckmodule links/rechts, Wangen, Inselrückwände und -sockel, Schutzhüllen.

**Geräte** (nicht im Preis, außer angegeben): Grills von Napoleon, Gaskochfelder Barazza, Induktion Electrolux, Weinkühler Vitrifrigo, Spülen, versenkbare Steckdosen, Holzöfen.

## Farben und Setups aus dem Katalog

Acht Farben, darunter: Olive Green, Brilliant White, Champagne, Satin Edelstahl, Oxide Brown. Fünf fertige Setups als Gesprächsgrundlage:

| Setup | Farbe | Form | Besonderheit |
|---|---|---|---|
| Olive Compact | Olive Green | kompakt | Spüle, Stauraum, Schubladen, Platz für Kochfeld |
| White Linear | Brilliant White | gerade Zeile | Spüle, Stauraum, Schubladen, Kochfeldbereich |
| Champagne XL | Champagne | modular, groß | Holzofen, Spüle, integrierter BBQ |
| Inox Corner | Satin Edelstahl | L-Form | Induktion, Spüle, Schubladen |
| Oxide L-Shape | Oxide Brown | L-Form | Holzofen, Spüle, Schubladen |

Katalog: kanso-outdoor.com/katalog/vesper (PDF, 17 Seiten) – zum Mitgeben oder Mailen.

## Vesper oder KOALA?

- **KOALA**: pulverbeschichteter Stahl mit Dekton, festes Modulraster, 6–8 Wochen, ab 3.470 € inkl. Montage. Für die meisten Familien die richtige Wahl.
- **Vesper**: Edelstahl-Manufaktur aus Italien, frei geplant, jede Form, Geräte genau dort, wo der Kunde sie will. Für Kunden, bei denen Material, Verarbeitung und Maßarbeit zählen.

Frag nach Budget, Platz und Anspruch – dann zeig die passende Küche zuerst. Beide stehen im Laden.

## Ablauf

1. Bedarf, Raum und Maße aufnehmen (Foto der Terrasse hilft).
2. Bas und Lea planen individuell, Zeichnung und Angebot.
3. Nach Freigabe Produktion in Italien, dann Lieferung und Montage.

## Dein Part

Wie bei KOALA: Bedarf klären, Lust machen, als **Projekt-Interessent** eintragen – ein Vesper-Projekt liegt immer über 4.000 € und zählt für deine Provision. Planung, Preis und Rabatt machen Bas und Lea. Der KOALA-Saisonvorteil gilt **nicht** für Vesper.`,
  },
  {
    slug: "verkauf-lueneburg-haeuschen",
    title_de: "Lüneburg Windlicht-Häuschen verkaufen",
    title_nl: "Lüneburg Windlicht-Häuschen verkopen",
    position: 5,
    body_de: `## Was es ist

Unsere eigenen Windlichter: fünf Lüneburger Wahrzeichen aus 2 mm Stahlblech, lasergeschnitten und schwarz matt pulverbeschichtet. Entworfen in Lüneburg, gefertigt in den Niederlanden. Ein Teelicht dahinter, und die Fenster leuchten. Das Lüneburg-Geschenk – für Einheimische, Ehemalige und Besucher.

## Die fünf Motive

- **Am Sande** – der Backsteingiebel am großen Platz
- **Alter Kran** – der Holzkran am Stintmarkt
- **Rathaus** – Arkaden, Mittelbau und Turm
- **St. Johannis** – die Kirche mit dem schiefen Turm (das höchste, 20,5 cm)
- **Wasserturm** – der neugotische Turm

Zwischen 12 und 21 cm hoch, 120 bis 270 g. Passt jedes Teelicht bis 39 mm, auch LED. Motive frei kombinierbar.

## Preise (Preiskarte)

| | mit Geschenkbox (Teelicht & Karte) | ohne Box |
|---|---|---|
| 1 Häuschen | **27,90 €** | 24,99 € |
| 2er-Set | **52,00 €** | 48,99 € |
| 3er-Set | **75,00 €** | 69,99 € |
| 4er-Set | **98,00 €** | 89,99 € |
| Alle 5 | **119,00 €** | 109,99 € |

Standard ist **mit Box**: braune Klappschachtel, Teelicht und Karte zum Beschriften – die Geschenkverpackung ist inklusive, das sagst du dazu. „Ohne Box" nur, wenn der Kunde es ausdrücklich für sich selbst will. Kein weiterer Rabatt – eigenes Produkt, fairer Preis, die Sets sind der Rabatt.

## So verkaufst du es

- „Welches ist deins?" – fast jeder Lüneburger hat eine Verbindung zu einem der Gebäude. Lass ihn wählen, dann kommt das zweite oft von selbst (zwei für 52 €).
- Geschenkfrage: „Für wen soll es sein – wohnt die Person hier oder vermisst sie Lüneburg?" Das Häuschen reist gut, 4,90 € Versand in Deutschland, ab drei kostenlos.
- Zeig es brennend. Ein Teelicht im Häuschen auf dem Counter macht mehr als jedes Wort.
- Rechne hoch: „Alle fünf für 119 € – das sind 23,80 € pro Häuschen statt 27,90 €."
- Firmen und Vereine: alle fünf als Set, Weihnachtsgeschenk für Mitarbeiter oder Kunden. Mengen ab 10 → an Bas und Lea weitergeben.

## Händler und Verkaufsstellen

Die Häuschen gibt es nicht nur bei uns: Verkaufsstelle ist auch die **Tourist-Information (lueneburg.info)**, und wir suchen weitere – Hotels, Buchläden, Museumsshops, Cafés, Geschenkläden. Fragt ein Ladenbesitzer oder eine Hotelrezeption, gibt es zwei Modelle:

1. **Kommission**: Wir stellen die Häuschen hin (in der Regel 4 pro Motiv, also 20), der Händler kauft nichts ein. Verkauft er ein Häuschen, bekommt er **15 % vom Verkaufspreis**, wir den Rest. Nachschub kommt von uns.
2. **Einkauf**: Ab **30 Stück** kauft der Händler ein und bekommt **30 % Rabatt** pro Häuschen; dann gehören die Häuschen ihm und er verkauft sie auf eigene Rechnung.

Du musst nichts verhandeln: Name, Geschäft, Kontakt und Interesse als **Projekt-Interessent** mit Produkt „Lüneburg-Häuschen Händler" in die Hub, Bas oder Lea melden sich. Eine neue Verkaufsstelle ist Werbung für uns in der ganzen Stadt – also ruhig aktiv fragen, wenn jemand erzählt, dass er einen Laden oder ein Hotel hat.

## Gut zu wissen

Vorderseite wird handwarm, die Fensterränder heißer – nach dem Löschen ein paar Minuten warten. Draußen nur überdacht; die Schnittkante kann bei Dauerregen Flugrost ansetzen.`,
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

Handgemachte Pflanzgefäße, leicht und wetterfest, mit **5 Jahren Garantie**. Sehen aus wie Beton, Stein oder Ton, wiegen aber einen Bruchteil – ein großes Gefäß trägt man allein. Material: **Polyester, verstärkt mit Steinmehl** (Fiberglas-Komposit), **frostfest**, UV-fest, bleibt das ganze Jahr draußen. Gegenüber dem Kunden reicht: „handgemacht, leicht, frostfest, 5 Jahre Garantie".

## Was wir haben

Linie **Grigio** in Naturbeton, Antikweiß, Anthrazit, Sand, Earth und als **Metallic** in Champagne. Formen: Egg Pot, Balloon (Low / Tall), Box, Bowl, Vase, Cylinder – von 32 € (kleiner Low Balloon) bis gut 400 € (großer Egg Pot Low). Die Preise stehen an den Gefäßen.

**Neu: Wallhanger Organic** – drei organische Formen für die Wand (#1, #2, #3, je 85 €, in Earth oder Sand). Meistverkauft als **Set von drei** nebeneinander. Bei einem 3er-Set darfst du etwas entgegenkommen: rund 5 % oder ein runder Betrag, **maximal 30 €**.

Was im Laden steht, haben wir. Alles andere aus dem Luca-Sortiment – andere Größe, Form, Farbe – **bestellen wir für den Kunden**: Lieferzeit etwa **1,5 Wochen**, maximal.

## So beraten wir

Einzelne Töpfe verkaufen wir natürlich auch – aber das Ziel ist die Kombination. Frag: Wo soll es stehen (Eingang, Terrasse, Balkon, Wand), welcher Stil (Haus, Möbel, Farben), was soll hinein? Dann schlag eine Gruppe vor: **drei Gefäße, drei Höhen, eine Farbe** – das wirkt immer.

- Zeig die Kombination im Laden, stell sie zusammen.
- **Beratung zu Hause**: wir kommen vorbei, schauen uns die Terrasse an und machen einen Vorschlag.
- Unten ins Gefäß eine Schicht Blähton gegen Staunässe – sagen wir dazu.

## Olivenbaum-Kombi

Wir haben **künstliche Olivenbäume** im Laden – davon gehen regelmäßig welche raus. Die beste Kombination: Olivenbaum + Luca-Gefäß + Füllung. Als Füllung haben wir **Holzschnitzel in Rot oder Schwarz**. Kauft der Kunde Baum und Gefäß zusammen, gibt es **die Füllung gratis** dazu – das sagst du als Bonus, nicht als Rabatt.

## Rabattregel

Nicht von selbst anbieten. Aber wenn jemand mehrere Gefäße nimmt, darfst du selbst entscheiden: **ab etwa 400–500 € Gefäße → 5 % Rabatt**. 3er-Set Wallhanger: siehe oben (max. 30 €). Mehr als das: mit Bas oder Lea abstimmen.

## Lieferung

Wir liefern **nach Hause** – in Lüneburg kostenlos. Wohnt der Kunde etwas außerhalb, berechnen wir kleine Versandkosten, und zwar **immer nachträglich**, weil es von der Größe der Sendung abhängt. Also nicht vorab einen Betrag nennen: „Die Versandkosten rechnen wir nach Größe ab, das klären Bas oder Lea mit dir."

## Dazu verkaufen

Dekosteine, Holzschnitzel, Outdoor-Teppich darunter, Tenderflame daneben. Wer eine Terrasse neu macht, ist ein Pergola- oder Küchen-Lead – frag nach und trag es ein.`,
  },
  {
    slug: "kamado-grills-moddern",
    title_de: "Kamado-Grills (Moddern) verkaufen",
    title_nl: "Kamado-grills (Moddern) verkopen",
    position: 8,
    body_de: `## Warum wir auf Kamados setzen

In den Niederlanden ist der Kamado längst ein Ding – in Deutschland kennen ihn noch wenige. Wir glauben, dass der Trend herüberkommt, und wollen in Lüneburg die Adresse dafür sein. Deshalb steht er bei uns im Laden, brennt bei Vorführungen und ist in jede Outdoor-Küche einbaubar. Nächstes Jahr geben wir **Kamado-Workshops** hinter dem Laden auf dem Kanso-Parkplatz – sag das jedem Interessenten: „Vielleicht auch etwas für dich." Interesse notieren, wir laden ein.

## Was ein Kamado ist – in drei Sätzen

1. Ein Keramikgrill nach japanischem Vorbild: dicke Keramikwände speichern die Hitze, **eine Füllung Holzkohle hält viele Stunden**.
2. Die Temperatur stellst du nur über zwei Luftschieber ein – **80 bis 400 °C**, stabil wie ein Backofen.
3. **Grill, Ofen und Smoker in einem**: mit geschlossenem Deckel bleibt alles saftig, der Rauch gibt den Geschmack.

## Low & slow – und ganz heiß

Das Argument, mit dem du verkaufst: Auf einem Kamado kochst du besser als auf jedem Gasgrill.

- **Low & slow** (100–130 °C): Spareribs, Short Ribs, Pulled Pork, Brisket – stundenlang bei niedriger Temperatur, mit Platesetter indirekt. Zart, rauchig, ohne Aufpassen. Beispiel Spareribs: 3 Stunden rauchen, 2 Stunden in Folie, 1 Stunde glasieren – die „3-2-1-Methode".
- **Heiß** (300–400 °C): Steak mit Kruste, **Pizza auf dem Pizzastein** wie aus dem Steinofen, Brot, Gemüse.
- **Indirekt backen** (160–200 °C): Hähnchen, Braten, Aufläufe – wie im Umluftofen, mit Platesetter.

Deshalb kommt nächstes Jahr der **Compact dazu**: zwei Kamados, zwei Temperaturen. Auf dem großen läuft stundenlang das Low-&-slow-Stück, auf dem kleinen grillst du heiß nach oder machst die Pizza. Wer das einmal gesehen hat, will beide.

## Unsere Modelle: Moddern (Design aus den Niederlanden)

| Modell | Für wen | Preis ab |
|---|---|---|
| **Compact** | Balkon, kleine Terrasse, Zweitgrill zum Nachgrillen; mobil | 749 € |
| **Solo** | ohne Untergestell, zum **Einbau in die Outdoor-Küche** (74 kg Keramik) | 1.349 € |
| **Special** | freistehend auf Rollgestell mit klappbaren Seitentischen, fährt ohne Heben | 1.699 € |

Vier Farben: **Anthrazit, Olivgrün, Tiefblau, Sand** – richtig Design, kein grüner Klotz. Solo und Special haben dieselbe Keramik und Leistung; der Unterschied ist nur Einbau oder Gestell. Der Solo passt in **jede** unserer Outdoor-Küchen (KOALA, Vesper): Ausschnitt, Lüftung und Abstand werden mitgeplant, die Arbeitsplatte läuft durch. Aktuelle Preise an der Ware und unter Produkte.

## Material und Garantie

Keramikkorpus, Gussrost, Edelstahl-Kohlekorb, Bambus-Seitentische beim Special. **Garantie (Moddern): Keramik 25 Jahre** (begrenzt lebenslang für den Erstkäufer), Metallteile 5 Jahre, Platesetter 3 Jahre, Zubehör 2 Jahre, Holz / Thermometer / Dichtungen 1 Jahr. Der Grill muss auf **moddern.eu registriert** werden, damit die Garantie gilt – das dem Kunden beim Kauf sagen. Bleibt mit Wetterhaube das ganze Jahr draußen.

## Lieferung

Die Kamados liefern wir **als Standard innerhalb weniger Tage** nach Hause (ca. 4 Werktage; Lieferung laut Website 181,49 €, Abholung im Laden kostenlos) – oder eingebaut in die Outdoor-Küche mit der Küchenmontage. Beim Einbau gibt es nichts aufzubauen: nur Rost und Kohlekorb einsetzen.

## Zubehör – immer mit anbieten

| Zubehör | Preis | Wofür |
|---|---|---|
| Platesetter (2-teilig) | 79,95 € | indirekt grillen, backen, low & slow – **das** Teil, ohne geht's nicht |
| Pizzastein | 49,95 € | Pizza und Brot wie im Steinofen |
| Wetterhaube | 119,95 € | draußen stehen lassen, ganzjährig |
| Gussrost rund | 69,95 € | Ersatz oder zweite Ebene |
| Edelstahl-Kohlekorb | 79,95 € | Asche einfach ausklopfen |
| Drehspieß mit Motor | 229,95 € | auf Bestellung |
| Holzkohle (8 kg) | ab 16,95 € | nur Stückholzkohle, keine Briketts |
| Räucherchunks Apfel (3 kg) | 28,95 € | low & slow |
| Räucherchips Eiche (1 kg) | 14,95 € | kurzes Räuchern |

Das Starterpaket, das du jedem Kamado-Käufer vorschlägst: **Platesetter + Pizzastein + Wetterhaube + Holzkohle + Chunks**. Dazu einen Anzündkamin oder Anzünder – nie Spiritus, die Keramik nimmt Gerüche an.

## Kleine Weisheiten, mit denen du punktest

- **Deckel zu.** „Wer guckt, grillt nicht" – jedes Öffnen kostet Hitze und Feuchtigkeit.
- **Luftschieber statt Thermostat.** Unten regelt grob, oben fein. Temperatur immer von unten her anfahren – runterkühlen dauert ewig.
- **Erst Rauch, dann Fleisch.** Die ersten 15 Minuten riecht die Kohle noch scharf; erst grillen, wenn der Rauch dünn und blau ist.
- **Holzkohle bleibt drin.** Nach dem Grillen Schieber zu, das Feuer erstickt – die Restkohle nutzt man beim nächsten Mal. Darum braucht man so wenig.
- **Backofen-Trick.** Mit Platesetter wird der Kamado zum Ofen: Brot, Kuchen, Lasagne im Garten.
- **Keramik ist schwer, aber hält ewig.** 74 kg – deshalb Rollgestell oder Einbau. Keramik rostet nicht, wird nicht spröde, 25 Jahre Garantie.
- **Gasgrill-Kunde?** Wer nur schnell und oft Würstchen grillt, ist mit Gas gut bedient – ehrlich sagen. Wer kochen will, braucht den Kamado.

## Dein Part

Ein Kamado ist eine größere Anschaffung und oft Teil einer Outdoor-Küche. Frag: Wo soll er stehen, wie viele Leute, eher Steak oder eher Pizza und Ribs, kommt vielleicht eine Küche drumherum? Ab Küchen-Interesse als **Projekt-Interessent** eintragen (zählt für die Provision). Vorführung anbieten: Wir zünden ihn an, der Kunde darf probieren. Kein Rabatt auf Kamados; Zubehör ist der Mehrwert.`,
  },
];

/** Wissensseite Etikettendrucker (Kategorie "anleitungen"), neu geschrieben in v15. */
export const ETIKETTEN_PAGE = {
  slug: "etikettendrucker",
  title_de: "Etiketten & Labels: was wir drucken können",
  title_nl: "Etiketten & labels: wat we kunnen printen",
  body_de: `## Was wir haben

Einen echten Profi-Etikettendrucker: **Epson ColorWorks C4000**. Vollfarbe in Fotoqualität (bis 1.200 dpi), pigmentierte Tinte – **wasserfest, wischfest, lichtbeständig**. Wir drucken auf **matte Etiketten**, das passt zu unserem ruhigen KANSŌ-Look. Damit sind zum Beispiel die Etiketten der Gewürzlinie und die Labels der Lüneburg-Häuschen entstanden.

Drucken machen Bas und Lea. Für dich zählt: **Was wäre ein schönes Etikett?** Ideen sind immer willkommen.

## Was geht – Formate

| Was | Möglich |
|---|---|
| Breite | Rollen von 25 bis 112 mm breit, bedruckbar bis **108 mm** (gut 10 cm) |
| Länge | von **8 mm bis ca. 40 cm** pro Etikett |
| Formen | rechteckig in jeder Länge (der Drucker schneidet selbst); rund, oval oder mit Ecken nur mit passend vorgestanzter Rolle |
| Farben | alles, inklusive Fotos, Verläufe, feine Schrift, QR- und Barcodes |
| Material | matt (Standard bei uns); möglich wären auch glänzend oder Kunststoff-Etiketten für draußen |

Faustregel: alles, was auf eine Fläche bis etwa 10 × 40 cm passt, können wir drucken – von der kleinen Preisetikette bis zum langen Banderole-Streifen um eine Schachtel.

## Ideen: wo Etiketten uns stärker machen

**Eigene Produkte**
- **KANSO SPICES** und **Raumduft**: einheitliche Etiketten mit Name, Herkunft, Füllmenge, MHD – sauber und wiedererkennbar.
- **Lüneburg-Häuschen**: Label auf der Box mit dem Motiv-Namen und einem Satz zum Gebäude („St. Johannis – die Kirche mit dem schiefen Turm").
- **Bundles und Q4-Geschenksets**: Banderole um das Set, z. B. „Abend am Feuer: Tischfeuer + Tenderfuel + Pen Torch".

**Laden und Verpackung**
- **Siegel-Sticker** für Geschenkpapier und Tüten: rund, KANSŌ-Logo, „Mit Liebe aus Lüneburg". Macht jedes Päckchen zur Marke.
- **Einheitliche Preisschilder** und Regal-Etiketten in einem Stil – wirkt sofort hochwertiger.
- **Pflege-Kärtchen als Sticker**: z. B. für Tenderflame „Nach dem Abend: Brennstoff zurück in die Flasche" – innen auf die Schachtel, erspart Reklamationen.
- **QR-Sticker** an der Kasse oder auf der Tüte: zu Instagram, Google-Bewertung oder der Produktseite.

**Partner und Projekte**
- **Verkaufsstellen der Häuschen** (z. B. Tourist-Info): Display-Schild „Lüneburg-Häuschen – hier erhältlich" und kleine Nummern-Sticker, damit wir bei Kommission sehen, was verkauft ist.
- **Outdoor-Küchen und Pergola**: „Geplant und montiert von KANSŌ Lüneburg" als dezentes Typenschild-Etikett innen an der Tür.
- **Workshops und Events** (Kamado 2027): Namensschilder, Gutscheine, Rezept-Etiketten für Gewürzmischungen zum Mitnehmen.

## Wenn du eine Idee hast

1. Kurz beschreiben: wofür, welche Größe, wie viele.
2. Entwurf in **Canva** (Lea hat die Vorlagen) – Marke, Schrift und Farben wie bei den bestehenden Etiketten.
3. Gedruckt wird nur aus einer **von Lea oder Bas freigegebenen Masterdatei**. Bei Produkten mit Lebensmitteln (Gewürze) müssen Pflichtangaben stimmen – immer gegenprüfen lassen.

Tipp: Erst ein Etikett testweise drucken und aufkleben, dann die Serie.`,
};
