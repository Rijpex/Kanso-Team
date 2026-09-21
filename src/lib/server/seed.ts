import "server-only";
import { q, q1 } from "./db";
import areas from "./seed-data/areas.json";
import { LEA_ONBOARDING, LEA_PAGES } from "./seed-data/pages-lea";

/**
 * Startinhoud. Wordt alleen ingevoegd als de betreffende tabel nog leeg is,
 * dus eigen aanpassingen worden nooit overschreven.
 * [[...]] in een tekst = geel gemarkeerd "nog invullen".
 */

type Page = { slug: string; category: string; title_de: string; title_nl?: string | null; body_de: string; body_nl?: string | null };

const PAGES: Page[] = [
  {
    slug: "willkommen",
    category: "start",
    title_de: "Willkommen bei Kansō",
    title_nl: "Welkom bij Kansō",
    body_de: `Schön, dass ihr da seid! Dieser Hub ist euer Platz für alles rund um euer Praktikum: Wer wann arbeitet, was zu tun ist, wie Dinge funktionieren – und vor allem: wo ihr jederzeit Fragen stellen könnt.

### Das Wichtigste zuerst
- **Fragen sind immer erwünscht.** Niemand erwartet, dass ihr alles wisst. Fragt uns direkt im Laden oder schreibt es unter „Fragen“ – wir antworten immer.
- **Fehler sind okay.** Sagt es einfach sofort, dann lösen wir es zusammen.
- **Ihr lernt hier ein echtes Geschäft kennen** – und jede von euch verantwortet eine eigene Produktlinie, von der ersten Idee bis zum Launch im Laden.

### So benutzt ihr den Hub
- **Heute**: Was heute ansteht – Wochenfokus, Schicht, Pause, Storepflege, Aufgaben.
- **Kalender & Dienstplan**: Wer arbeitet wann, Pausen, Termine, Märkte, Schule.
- **Wochenfokus**: Bis zu drei Punkte, die diese Woche zählen – steht oben auf „Heute“.
- **Aufgaben**: Eure Aufträge. Dort könnt ihr kommentieren, Fragen stellen und Dateien hochladen.
- **Wissen**: Alles zum Nachlesen – So arbeiten wir, Was tun wenn, Aufgabenbereiche, Kasse, Drucker.
- **Einarbeitung**: Eure Checkliste für die erste Woche.

### Wer wir sind
KANSŌ heißt Einfachheit. In drei Worten: Schön draußen leben. Ein Laden in der Bardowicker Straße 8 in Lüneburg, dazu das Projektgeschäft mit Outdoor-Küchen und Pergolen. Mehr dazu unter „So arbeiten wir“ – bitte an Tag 1 lesen.`,
    body_nl: `Fijn dat jullie er zijn! Deze hub is jullie plek voor alles rond de stage: wie wanneer werkt, wat er te doen is, hoe dingen werken – en vooral: waar je altijd vragen kunt stellen.

### Het belangrijkste eerst
- **Vragen stellen mag altijd.** Niemand verwacht dat je alles weet. Vraag het in de winkel of schrijf het onder "Vragen" – we antwoorden altijd.
- **Fouten maken mag.** Zeg het gewoon meteen, dan lossen we het samen op.
- **Je leert hier een echt bedrijf kennen** – en ieder van jullie is verantwoordelijk voor een eigen productlijn, van eerste idee tot lancering in de winkel.

### Zo gebruik je de hub
- **Vandaag**: wat er vandaag speelt – dienst, pauze, schoonmaak, opdrachten.
- **Agenda & rooster**: wie werkt wanneer, pauzes, afspraken, markten, school.
- **Weekfocus**: maximaal drie punten die deze week tellen – staat bovenaan "Vandaag".
- **Opdrachten**: jullie opdrachten. Daar kun je reageren, vragen stellen en bestanden uploaden.
- **Kennis**: alles om na te lezen – regels, kassa, producten, printer.
- **Inwerken**: jullie checklist voor de eerste week.

### Wie wij zijn
KANSŌ betekent eenvoud. In drie woorden: mooi buiten leven. Een winkel aan de Bardowicker Straße 8 in Lüneburg, plus het projectwerk met buitenkeukens en pergola's. Meer onder "So arbeiten wir" – graag op dag 1 lezen.`,
  },
  {
    slug: "homeoffice-montag",
    category: "start",
    title_de: "Homeoffice-Montag",
    title_nl: "Thuiswerk-maandag",
    body_de: `Montags ist der Laden geschlossen. Wer am Samstag **nicht** gearbeitet hat, arbeitet am Montag von zu Hause. Ihr wechselt euch samstags ab (die Schule erlaubt maximal 2 Samstage pro Monat).

### So läuft der Montag
1. Morgens im Hub einloggen und unter **Aufgaben** den Filter „Homeoffice“ öffnen.
2. Aufgabe auf „In Arbeit“ setzen, damit wir sehen, woran du sitzt.
3. Fragen direkt als Kommentar in die Aufgabe schreiben – Bas oder Lea antworten im Laufe des Tages.
4. Ergebnis hochladen (Datei oder Link) und die Aufgabe auf „Zur Kontrolle“ setzen.
5. Am Ende kurz in die Aufgabe schreiben: Was hast du geschafft, was ist noch offen?

### Typische Montags-Aufgaben
- Reels schneiden, Texte und Hashtags schreiben, Content-Plan für die Woche füllen
- Produktrecherche: neue Ideen suchen, Preise vergleichen, Marge ausrechnen
- Schaufenster- und Saisonkonzepte ausarbeiten, Website als Kundin prüfen
- Produktwissen lernen`,
    body_nl: `Op maandag is de winkel dicht. Wie op zaterdag **niet** heeft gewerkt, werkt maandag vanuit huis. Jullie wisselen de zaterdagen af (van school mogen maximaal 2 zaterdagen per maand).

### Zo loopt de maandag
1. 's Ochtends inloggen in de hub en onder **Opdrachten** het filter "Thuiswerk" openen.
2. Opdracht op "Bezig" zetten, zodat wij zien waar je mee bezig bent.
3. Vragen direct als reactie in de opdracht schrijven – Bas of Lea antwoorden in de loop van de dag.
4. Resultaat uploaden (bestand of link) en de opdracht op "Ter controle" zetten.
5. Aan het eind kort in de opdracht schrijven: wat is af, wat staat nog open?

### Typische maandag-opdrachten
- Reels monteren, teksten en hashtags schrijven, contentplan voor de week vullen
- Productonderzoek: nieuwe ideeën zoeken, prijzen vergelijken, marge uitrekenen
- Etalage- en seizoensconcepten uitwerken, website als klant testen
- Productkennis leren`,
  },
  {
    slug: "kasse",
    category: "shop",
    title_de: "Kasse & Bezahlen",
    title_nl: "Kassa & afrekenen",
    body_de: `[[Bas/Lea: Kassensystem und genaue Schritte eintragen – am besten mit Fotos]]

### Ablauf beim Kassieren
1. Begrüßen, Artikel annehmen, nach Geschenkverpackung fragen.
2. Artikel scannen oder in der Kasse suchen. [[Schritte im Kassensystem]]
3. Betrag nennen, nach Zahlungsart fragen (Karte / bar).
4. **Karte:** Betrag ans Stripe-Terminal senden, warten bis „Zahlung erfolgt“. **Bar:** Geld nachzählen, Wechselgeld laut vorzählen.
5. Bon anbieten, einpacken, verabschieden.

### Immer Bas oder Lea holen bei
- Storno, Rückgabe, Umtausch
- Gutscheinen und Rabatten, die ihr nicht kennt
- Pergola- und Outdoor-Küchen-Anfragen (Kontaktdaten notieren!)
- allem, was sich komisch anfühlt

### Kasse zählen (jeden Abend)
Bargeld zählen, Betrag ins Kassenbuch eintragen, mit dem Kassenbericht vergleichen. Jede Abweichung noch am selben Abend an Lea. [[genaue Schritte ergänzen]]`,
    body_nl: `[[Bas/Lea: kassasysteem en exacte stappen invullen – liefst met foto's]]

### Afrekenen stap voor stap
1. Begroeten, artikelen aannemen, vragen of het een cadeau is.
2. Artikel scannen of in de kassa opzoeken. [[stappen in het kassasysteem]]
3. Bedrag noemen, vragen hoe de klant wil betalen (pin / contant).
4. **Pin:** bedrag naar de terminal sturen, wachten op "betaling geslaagd". **Contant:** geld natellen, wisselgeld hardop terugtellen.
5. Bon aanbieden, inpakken, gedag zeggen.

### Altijd Bas of Lea erbij halen bij
- storno, retour, ruilen
- cadeaubonnen en kortingen die je niet kent
- aanvragen voor pergola's en buitenkeukens (contactgegevens noteren!)
- alles wat raar voelt

### Kas tellen (elke avond)
Contant geld tellen, bedrag in het kasboek noteren, vergelijken met het kassarapport. Elk verschil nog dezelfde avond aan Lea melden. [[exacte stappen aanvullen]]`,
  },
  {
    slug: "tenderflame",
    category: "produkte",
    title_de: "Tenderflame Tischfeuer",
    title_nl: "Tenderflame tafelvuren",
    body_de: `Im Laden aktuell am stärksten gefragt. Tenderflame sind Tischfeuer mit echter Flamme für drinnen und draußen, betrieben mit dem eigenen Brennstoff **Tenderfuel**.

### Was ihr wissen müsst
- **Modelle** (Auswahl): Lilly, Amaryllis, Aster, Breeze, Tulip, Café 14 / 18, Globe – in verschiedenen Größen und Farben. Aktuelle Preise findet ihr unter **Produkte**.
- **Tenderfuel** gibt es in 0,5 l, 1,0 l und 2,5 l. Nur Tenderfuel verwenden – kein Bioethanol, kein Lampenöl.
- **Geschenksets** (z. B. Lilly 10 inkl. 0,5 l Tenderfuel) sind perfekte Mitbringsel – stark in der Weihnachtszeit.
- **Zubehör:** Pen Torch Feuerzeug.

### Typische Kundenfragen
- „Ist das sicher?“ → [[Antwort mit Bas/Lea abstimmen: Sicherheitsargumente von Tenderflame]]
- „Wie lange brennt eine Füllung?“ → [[Brenndauer je Modell eintragen]]
- „Riecht oder rußt das?“ → [[Antwort eintragen]]
- „Geht das auch draußen?“ → Ja, für drinnen und draußen.

### Aufgabe für euch
Lest die Verpackungen und die Produkttexte im Webshop, probiert ein Tischfeuer zusammen mit Lea aus und ergänzt diese Seite gemeinsam mit uns.`,
    body_nl: `Op dit moment ons best verkopende assortiment. Tenderflame zijn tafelvuren met echte vlam voor binnen en buiten, die branden op de eigen brandstof **Tenderfuel**.

### Wat je moet weten
- **Modellen** (selectie): Lilly, Amaryllis, Aster, Breeze, Tulip, Café 14 / 18, Globe – in verschillende maten en kleuren. Actuele prijzen vind je onder **Producten**.
- **Tenderfuel** is er in 0,5 l, 1,0 l en 2,5 l. Alleen Tenderfuel gebruiken – geen bio-ethanol, geen lampolie.
- **Cadeausets** (bijv. Lilly 10 incl. 0,5 l Tenderfuel) zijn perfecte cadeautjes – sterk in de kersttijd.
- **Accessoires:** Pen Torch-aansteker.

### Typische klantvragen
- "Is dat veilig?" → [[antwoord afstemmen met Bas/Lea: veiligheidsargumenten van Tenderflame]]
- "Hoe lang brandt één vulling?" → [[brandduur per model invullen]]
- "Ruikt of roet het?" → [[antwoord invullen]]
- "Kan het ook buiten?" → Ja, voor binnen en buiten.

### Opdracht voor jullie
Lees de verpakkingen en de productteksten in de webshop, probeer samen met Lea een tafelvuur uit en vul deze pagina samen met ons aan.`,
  },
  {
    slug: "keramik-kerzen-toepfe",
    category: "produkte",
    title_de: "Keramik, Kerzen & Blumentöpfe",
    title_nl: "Keramiek, kaarsen & bloempotten",
    body_de: `### Marken im Laden
- **Luca Lifestyle** – Blumentöpfe und Pflanzgefäße. [[Material, Größen, drinnen/draußen, frostfest?]]
- **Archief** – Keramik (Teller, Tassen, Schalen). [[Herkunft, handgemacht?, spülmaschinenfest?]]
- **Grain by Grain** – Keramik. [[Herkunft, Besonderheiten, Pflege]]
- **Kerzen** – [[Marken, Brenndauer, Düfte]]

### Worauf Kundschaft achtet
- Spülmaschine / Mikrowelle geeignet?
- Für draußen geeignet, frostfest?
- Gibt es passende Teile dazu (Set)?
- Woher kommt es, wer macht es?

[[Bas/Lea: Antworten je Marke ergänzen. Das ist auch eine schöne Lernaufgabe für die erste Woche.]]`,
    body_nl: `### Merken in de winkel
- **Luca Lifestyle** – bloempotten en plantenbakken. [[materiaal, maten, binnen/buiten, vorstbestendig?]]
- **Archief** – keramiek (borden, kopjes, schalen). [[herkomst, handgemaakt?, vaatwasserbestendig?]]
- **Grain by Grain** – keramiek. [[herkomst, bijzonderheden, onderhoud]]
- **Kaarsen** – [[merken, brandduur, geuren]]

### Waar klanten op letten
- Geschikt voor vaatwasser / magnetron?
- Geschikt voor buiten, vorstbestendig?
- Zijn er bijpassende delen (set)?
- Waar komt het vandaan, wie maakt het?

[[Bas/Lea: antwoorden per merk aanvullen. Dit is ook een mooie leeropdracht voor de eerste week.]]`,
  },
  {
    slug: "pergola-outdoorkueche",
    category: "produkte",
    title_de: "Pergolen & Outdoor-Küchen",
    title_nl: "Pergola's & buitenkeukens",
    body_de: `Das sind unsere Hauptprodukte. Ihr müsst sie **nicht verkaufen** – aber ihr solltet wissen, was wir machen, und Anfragen richtig aufnehmen.

### Kurz erklärt
- **Rijpex Holz-Pergola:** Pergola aus Douglasienholz, auf Maß, mit Sonnenschutz (z. B. Harmonika-Sonnensegel) und optionalen Seitenwänden. Lieferung als Bausatz oder mit Montage.
- **Outdoor-Küchen:** modulare Küchen für draußen (u. a. Koala Kitchens, Vesper Kitchen), dazu Kamado-Grills.
- Auf kanso-outdoor.com gibt es einen **Konfigurator**, Projekte und Kataloge.

### Wenn jemand im Laden danach fragt
1. Freundlich zuhören, Prospekt / Katalog mitgeben.
2. Wenn Bas oder Lea da sind: dazuholen.
3. Wenn nicht: **Name, Telefon und E-Mail notieren**, kurz fragen, worum es geht (Terrasse? Neubau? Zeitplan?), Beratungstermin anbieten und noch am selben Tag Lea per WhatsApp informieren. Kein Projektgespräch endet ohne Kontaktdaten.
4. Auf den Konfigurator auf der Website hinweisen.

Nie Preise oder Liefertermine für Pergolen und Küchen versprechen – das macht Bas.`,
    body_nl: `Dit zijn onze hoofdproducten. Jullie hoeven ze **niet te verkopen** – maar je moet weten wat we doen en aanvragen goed aannemen.

### Kort uitgelegd
- **Rijpex houten pergola:** pergola van douglashout, op maat, met zonwering (bijv. harmonicadoek) en optionele zijwanden. Levering als bouwpakket of met montage.
- **Buitenkeukens:** modulaire keukens voor buiten (o.a. Koala Kitchens, Vesper Kitchen), plus kamado-grills.
- Op kanso-outdoor.com staan een **configurator**, projecten en catalogi.

### Als iemand er in de winkel naar vraagt
1. Vriendelijk luisteren, folder / catalogus meegeven.
2. Zijn Bas of Lea er: erbij halen.
3. Zo niet: **naam, telefoon en e-mail noteren**, kort vragen waar het om gaat (terras? nieuwbouw? planning?), adviesgesprek aanbieden en nog dezelfde dag Lea via WhatsApp informeren. Geen projectgesprek eindigt zonder contactgegevens.
4. Wijzen op de configurator op de website.

Nooit prijzen of levertijden voor pergola's en keukens beloven – dat doet Bas.`,
  },
  {
    slug: "etikettendrucker",
    category: "anleitungen",
    title_de: "Etikettendrucker (Epson)",
    title_nl: "Labelprinter (Epson)",
    body_de: `Mit dem Epson-Farbetikettendrucker drucken wir die Etiketten für unsere Gewürzlinie. Die Designs hat Lea in **Canva** gemacht. **Gedruckt wird nur aus einer von Lea oder Bas freigegebenen Masterdatei.**

### Etiketten drucken
1. Drucker einschalten, prüfen ob die richtige Etikettenrolle eingelegt ist. [[Etikettengröße eintragen]]
2. In Canva das richtige Design öffnen → als **PDF (Druck)** herunterladen. [[Canva-Ordner / Link]]
3. PDF öffnen → Drucken → Drucker „Epson“ wählen → Papierformat = Etikettengröße, Skalierung **100 %** (nicht „anpassen“).
4. **Erst 1 Probeetikett drucken** und prüfen: Ränder, Farbe, Text lesbar?
5. Dann die benötigte Menge drucken.

### Wenn etwas nicht klappt
- Druck verschoben → Papierformat und Skalierung prüfen.
- Streifen im Druck → Düsentest / Reinigung im Druckermenü. [[genaue Schritte]]
- Rolle leer oder Tinte fast leer → sofort unter „Fragen“ melden, damit wir nachbestellen.

[[Bas/Lea: Fotos und genaue Einstellungen nach dem ersten gemeinsamen Druck ergänzen]]`,
    body_nl: `Met de Epson kleurenlabelprinter drukken we de etiketten voor onze kruidenlijn. De ontwerpen heeft Lea in **Canva** gemaakt. **Er wordt alleen geprint vanuit een door Lea of Bas goedgekeurd masterbestand.**

### Etiketten printen
1. Printer aanzetten, checken of de juiste etikettenrol erin zit. [[etiketformaat invullen]]
2. In Canva het juiste ontwerp openen → downloaden als **PDF (drukwerk)**. [[Canva-map / link]]
3. PDF openen → Printen → printer "Epson" kiezen → papierformaat = etiketformaat, schaal **100 %** (niet "passend maken").
4. **Eerst 1 proefetiket printen** en checken: randen, kleur, tekst leesbaar?
5. Daarna het benodigde aantal printen.

### Als iets niet lukt
- Print verschoven → papierformaat en schaal checken.
- Strepen in de print → spuitmondtest / reiniging in het printermenu. [[exacte stappen]]
- Rol leeg of inkt bijna op → meteen melden onder "Vragen", zodat we bijbestellen.

[[Bas/Lea: foto's en exacte instellingen aanvullen na de eerste keer samen printen]]`,
  },
  {
    slug: "gewuerze-abfuellen",
    category: "anleitungen",
    title_de: "Gewürze abfüllen & etikettieren",
    title_nl: "Kruiden afvullen & etiketteren",
    body_de: `Gewürze sind Lebensmittel – Sauberkeit ist hier das Allerwichtigste.

### Vorbereitung
- Haare zusammenbinden, Hände gründlich waschen, saubere Arbeitsfläche.
- Bei Erkältung oder Magen-Darm: **nicht abfüllen** – Bescheid sagen.
- Gläser und Deckel prüfen: sauber, trocken, unbeschädigt.

### Abfüllen
1. Immer nur **eine Sorte gleichzeitig** auf dem Tisch (keine Verwechslung, wichtig wegen Allergenen).
2. Glas auf die Waage, Tara drücken, bis zum Füllgewicht füllen. [[Füllgewicht je Sorte – Liste]]
3. Rand sauber wischen, Deckel fest schließen.
4. Etikett gerade aufkleben (Schablone benutzen). [[Position]]
5. **Mindesthaltbarkeitsdatum und Chargennummer** kontrollieren / aufkleben. [[Regelung eintragen]]
6. In die Liste eintragen: Datum, Sorte, Anzahl, wer. [[Wo? Liste / Aufgabe im Hub]]

### Wichtig
Für Lebensmittel gelten gesetzliche Regeln (Kennzeichnung, Allergene, Hygiene). [[Bas/Lea: mit dem Veterinär-/Lebensmittelamt geklärte Vorgaben hier eintragen, ggf. Hygieneschulung]]`,
    body_nl: `Kruiden zijn levensmiddelen – hygiëne is hier het allerbelangrijkste.

### Voorbereiding
- Haar vast, handen goed wassen, schoon werkblad.
- Verkouden of buikgriep: **niet afvullen** – even melden.
- Potjes en deksels checken: schoon, droog, onbeschadigd.

### Afvullen
1. Altijd maar **één soort tegelijk** op tafel (geen verwisseling, belangrijk i.v.m. allergenen).
2. Potje op de weegschaal, tarra indrukken, vullen tot het vulgewicht. [[vulgewicht per soort – lijst]]
3. Rand schoonvegen, deksel goed dichtdraaien.
4. Etiket recht opplakken (mal gebruiken). [[positie]]
5. **Houdbaarheidsdatum en batchnummer** controleren / opplakken. [[regeling invullen]]
6. In de lijst noteren: datum, soort, aantal, wie. [[waar? lijst / opdracht in de hub]]

### Belangrijk
Voor levensmiddelen gelden wettelijke regels (etikettering, allergenen, hygiëne). [[Bas/Lea: de met de Duitse levensmiddelenautoriteit afgestemde eisen hier invullen, evt. hygiënetraining]]`,
  },
  {
    slug: "preise-kalkulieren",
    category: "anleitungen",
    title_de: "Preise & Marge verstehen",
    title_nl: "Prijzen & marge begrijpen",
    body_de: `Für die Produktrecherche müsst ihr verstehen, wie ein Verkaufspreis entsteht. Unter **Produktideen** rechnet der Hub das automatisch für euch aus.

### Die Begriffe
- **EK (Einkaufspreis, netto):** Was wir dem Lieferanten pro Stück zahlen, ohne Mehrwertsteuer.
- **VK (Verkaufspreis, brutto):** Was die Kundschaft im Laden zahlt, inklusive Mehrwertsteuer.
- **MwSt:** 19 % auf die meisten Produkte, **7 %** auf viele Lebensmittel (z. B. Gewürze, Tee).
- **VK netto** = VK brutto ÷ 1,19 (oder ÷ 1,07).
- **Marge in €** = VK netto − EK.
- **Marge in %** = Marge ÷ VK netto.
- **Kalkulationsfaktor** = VK brutto ÷ EK.

### Beispiel (erfundene Zahlen)
Kerze: EK 6,00 €, VK 16,90 €. VK netto = 16,90 ÷ 1,19 = 14,20 €. Marge = 8,20 € = 58 %. Faktor 2,8.

### Woran ihr noch denken müsst
- **Mindestbestellmenge (MOQ):** 200 Stück klingen billig, müssen aber erst verkauft werden.
- **Versandkosten und Zoll** gehören zum EK dazu.
- **Verpackung und Etikett** kosten auch Geld (eigene Verpackung = schöner, aber teurer).
- Passt das Produkt zu KANSŌ? Stärkt es einen unserer sechs Werte, passt es in eine Welt, gibt es das schon überall?`,
    body_nl: `Voor productonderzoek moet je begrijpen hoe een verkoopprijs ontstaat. Onder **Productideeën** rekent de hub het automatisch voor je uit.

### De begrippen
- **EK (inkoopprijs, netto):** wat wij de leverancier per stuk betalen, zonder btw.
- **VK (verkoopprijs, bruto):** wat de klant in de winkel betaalt, inclusief btw.
- **Btw (MwSt):** 19 % op de meeste producten, **7 %** op veel levensmiddelen (bijv. kruiden, thee).
- **VK netto** = VK bruto ÷ 1,19 (of ÷ 1,07).
- **Marge in €** = VK netto − EK.
- **Marge in %** = marge ÷ VK netto.
- **Calculatiefactor** = VK bruto ÷ EK.

### Voorbeeld (verzonnen getallen)
Kaars: EK € 6,00, VK € 16,90. VK netto = 16,90 ÷ 1,19 = € 14,20. Marge = € 8,20 = 58 %. Factor 2,8.

### Waar je nog aan moet denken
- **Minimale bestelhoeveelheid (MOQ):** 200 stuks klinkt goedkoop, maar moet eerst verkocht worden.
- **Verzendkosten en invoerrechten** horen bij de EK.
- **Verpakking en etiket** kosten ook geld (eigen verpakking = mooier, maar duurder).
- Past het product bij KANSŌ? Versterkt het een van onze zes waarden, past het in een wereld, is het al overal te koop?`,
  },
];

type Clean = { de: string; nl: string; freq: "daily" | "weekly"; weekday?: number; moment: "open" | "day" | "close"; zone?: "a" | "b" };
// Bereich A = Eingang, Schaufenster, Böden · Bereich B = Küchen, Oberflächen, Regale (wechselt jede Woche)
const CLEANING: Clean[] = [
  { de: "Licht an, Musik leise, Kasse und Stripe-Terminal an", nl: "Licht aan, muziek zacht, kassa en Stripe-terminal aan", freq: "daily", moment: "open" },
  { de: "Öffnungsrunde: Eingang und Schaufenster von innen – Glas, Fliegen, sichtbarer Schmutz", nl: "Openingsronde: ingang en etalage van binnen – glas, vliegen, zichtbaar vuil", freq: "daily", moment: "open", zone: "a" },
  { de: "Öffnungsrunde: Laden und besonders den Eingangsbereich staubsaugen", nl: "Openingsronde: winkel en vooral de ingang stofzuigen", freq: "daily", moment: "open", zone: "a" },
  { de: "Öffnungsrunde: Oberflächen und Regale staubfrei", nl: "Openingsronde: oppervlakken en schappen stofvrij", freq: "daily", moment: "open", zone: "b" },
  { de: "Ausstellungsküchen reinigen, auch die unteren Edelstahlbereiche (Edelstahlreiniger)", nl: "Showkeukens schoonmaken, ook het rvs onderin (rvs-reiniger)", freq: "daily", moment: "open", zone: "b" },
  { de: "Regale voll, Fronten nach vorn, Preisschilder sichtbar – nach Kundenbesuchen neu ausrichten", nl: "Schappen vol, producten naar voren, prijskaartjes zichtbaar – na klanten weer rechtzetten", freq: "daily", moment: "day" },
  { de: "Counter aufgeräumt: alles an seinem festen Platz, Kundenseite frei", nl: "Toonbank opgeruimd: alles op zijn vaste plek, klantzijde vrij", freq: "daily", moment: "day" },
  { de: "Instagram-Kommentare und DMs beantwortet (Kaufinteresse sofort an Lea)", nl: "Instagram-reacties en DM's beantwoord (koopinteresse meteen naar Lea)", freq: "daily", moment: "day" },
  { de: "Content gesammelt: mindestens drei Fotos oder ein Clip ins Drive → 12. CONTENT", nl: "Content verzameld: minstens drie foto's of één clip in Drive → 12. CONTENT", freq: "daily", moment: "day" },
  { de: "Kasse gezählt: Bargeld zählen, Betrag ins Kassenbuch, Abweichung sofort an Lea", nl: "Kas geteld: contant tellen, bedrag in kasboek, verschil meteen aan Lea", freq: "daily", moment: "close" },
  { de: "Tischfeuer und Kerzen aus – doppelt prüfen", nl: "Tafelvuren en kaarsen uit – dubbel checken", freq: "daily", moment: "close" },
  { de: "Abschlussrunde: Rundgang, Müll, Licht aus, Aufgaben im Hub aktualisiert, Fragen eingetragen", nl: "Afsluitronde: rondje, afval, licht uit, opdrachten in de hub bijgewerkt, vragen genoteerd", freq: "daily", moment: "close" },
  { de: "Den gesamten Laden wischen", nl: "De hele winkel dweilen", freq: "weekly", weekday: 5, moment: "close", zone: "a" },
  { de: "Küchen und Ausstellungsflächen intensiver grundreinigen", nl: "Keukens en showvlakken grondig schoonmaken", freq: "weekly", weekday: 5, moment: "day", zone: "b" },
  { de: "Gewürzproben an der Kasse prüfen und nachfüllen (vor dem Wochenende)", nl: "Kruidenproefjes bij de kassa checken en bijvullen (voor het weekend)", freq: "weekly", weekday: 5, moment: "day" },
  { de: "Einen Bereich bewusst neu arrangieren, Vorher/Nachher-Foto ins Drive", nl: "Eén hoek bewust opnieuw inrichten, voor/na-foto in Drive", freq: "weekly", weekday: 4, moment: "day" },
];

type SeedTask = { title: string; description: string; category: string; home_ok?: boolean; checklist?: string[] };
const STAGES = (a: string, b: string, c: string, d: string, e: string) => [
  `1 · Briefing & Recherche: ${a} → Entscheidung: Die Richtung steht`,
  `2 · Konzeptvarianten: ${b} → Entscheidung: Eine Variante wird weiterentwickelt`,
  `3 · Branding, Etikett & Verpackung: ${c} → Entscheidung: Lea und Bas geben die Masterdatei frei`,
  `4 · Prototyp & Testdruck: ${d} → Entscheidung: Bestellung bzw. Produktion wird freigegeben`,
  `5 · Präsentation & Launch: ${e} → Entscheidung: Launch wird freigegeben`,
];
const TASKS: SeedTask[] = [
  {
    title: "Produktlinie KANSŌ SPICES (Gewürzlinie)",
    category: "line",
    home_ok: true,
    description: "Du verantwortest KANSŌ SPICES als eigene Produktlinie – von Zielgruppe und Anlass bis zum etikettierten Produkt im Regal. Die Linie ist zunächst bewusst auf drei Sorten begrenzt: lieber drei, die sitzen, als sieben halbe.\n\nAlles Weitere steht unter Wissen → „Junior Product Owner · Gewürzlinie“ und „Eure Produktlinien“. Hake eine Etappe erst ab, wenn Lea die Entscheidung getroffen hat. Zwischenstände, Moodboards und Dateien lädst du hier hoch, Fragen kommen als Kommentar.\n\n[[Bas/Lea: Praktikantin zuweisen und Fälligkeiten je Etappe besprechen]]",
    checklist: STAGES("Zielgruppe, Anlässe, Wettbewerb, gute und schlechte Beispiele sammeln", "bis zu drei Mischungen, Namen, Farbwelt, Moodboard", "Etikettenentwurf mit vorbereiteter Kennzeichnung, Einzelprodukt und Bundle, Versandverpackung", "Testdruck und Etikettierung aus der Masterdatei, Kalkulation mit Vorlage, Druckprozess dokumentiert", "Präsentation im Laden, Mindestbestand und Nachdruck-Signal, gemeinsame Abschlusspräsentation"),
  },
  {
    title: "Produktlinie KANSŌ Raumduft",
    category: "line",
    home_ok: true,
    description: "Du verantwortest den KANSŌ-Raumduft als eigene Produktlinie – von Zielgruppe, Duftwelt und Markenstory bis zu Ladenpräsentation und Launch.\n\nWichtig: Kein eigenständiges Mischen oder Abfüllen von Duftkonzentrat. Rezeptur, Sicherheitsdaten und Kennzeichnung kommen vom Hersteller bzw. von Lea und Bas.\n\nAlles Weitere steht unter Wissen → „Junior Product Owner · Raumduft“ und „Eure Produktlinien“. Hake eine Etappe erst ab, wenn Lea die Entscheidung getroffen hat.\n\n[[Bas/Lea: Praktikantin zuweisen und Fälligkeiten je Etappe besprechen]]",
    checklist: STAGES("Zielgruppe, Duftwelt, Wettbewerb, gute und schlechte Beispiele sammeln", "drei Duftrichtungen bzw. Namenskonzepte, Markenstory, Moodboard", "Flakon, Stäbchen, Verschluss und Verpackung verglichen, Etikett und Verpackung gemockt", "Testdruck, Transportschutz- und Unboxing-Test, Kundentest, Kalkulation mit Vorlage", "Ladenpräsentation, Produktseite, Launch-Content, Produktstory, Launch-Präsentation"),
  },
  {
    title: "Counter einmal gründlich organisieren",
    category: "store",
    description: "Der Counter ist das, was Kundinnen beim Bezahlen direkt vor Augen haben. Details unter Wissen → „Counter organisieren“. Regel: Was keinen festen Platz hat, gehört nicht auf den Counter.",
    checklist: ["Counter vollständig ausräumen, durchsortieren, gründlich reinigen", "Feste Plätze definieren: Kasse, Verpackungsmaterial, Bürobedarf, häufig Benötigtes", "Nicht Benötigtes entfernen bzw. ins Lager räumen", "Ergebnis fotografieren und hier hochladen – das Foto ist ab dann der Standard"],
  },
  {
    title: "Preisschild-Konzept: zwei bis drei Varianten",
    category: "store",
    home_ok: true,
    description: "Ein einheitliches, sorgfältig gestaltetes Konzept für alle Preisschilder entwickeln: Schriftarten, Größen, Farben, Produktbezeichnungen und Preisformat. Zwei bis drei Varianten vorbereiten und hier hochladen. Umsetzung erst nach Freigabe durch Lea und Bas. Details unter Wissen → „Preisgestaltung & Warenpräsentation“.",
  },
  {
    title: "Social-Media-Konzeption: drei Ideen pro Themenwelt",
    category: "social",
    home_ok: true,
    description: "Zu zweit: Pro Themenwelt mindestens drei konkrete Content-Ideen mit Format (Reel, Story, Karussell, Foto), Hook, kurzer Beschreibung, benötigten Produkten und Drehorten. Die stärkste Idee gemeinsam auswählen und in einem Satz begründen. Konzeptblatt in Drive → 04. Social Media ablegen, die ausgewählten Ideen in den Content-Plan eintragen und Lea zur Freigabe zeigen. Details unter Wissen → „Social-Media-Konzeption im Team“.",
    checklist: ["Outdoor-Küchen", "Pergolen", "Outdoor-Teppiche", "Pflanzgefäße von Luca Lifestyle", "Terrasse gestalten", "Tisch decken und Tablescaping", "Geschenke und Geschenkideen", "Tenderflame", "Kerzen", "Alkoholfreie Spirituosen", "Lecker kochen und Outdoor-Cooking", "KANSŌ Showroom und Shop in Lüneburg als Gesamtkonzept"],
  },
  {
    title: "Website als Kundin prüfen: fünf Beobachtungen pro Woche",
    category: "digital",
    home_ok: true,
    description: "Jeden Montag: Handy und Laptop, Startseite → Shop → Produkt → Kontakt. Wo stockst du? Tote Links, Tippfehler, fehlende Bilder, unklare Texte – jeweils mit Screenshot hier als Kommentar bzw. Datei. Produkttexte gegen die Sprachregeln prüfen (No-Go-Wörter, Du, belegbare Aussagen). Nichts live ändern ohne Freigabe: beobachten, notieren, vorschlagen.",
  },
  {
    title: "Produkt-Sourcing: Ideen sammeln, die zu KANSŌ passen und sich rechnen",
    category: "research",
    home_ok: true,
    description: "Ideen sammeln (Faire, Instagram, andere Läden, Kundenwünsche – „haben Sie auch …?“ immer notieren) und unter „Produktideen“ eintragen: Lieferant, Link, Einkaufspreis, Verkaufspreis-Vorschlag, ein Satz warum. Der Hub rechnet Marge und Faktor aus. Prüfschema: Stärkt es einen unserer sechs Werte? Passt es in eine Welt? Gibt es das schon überall? Einmal im Monat stellt ihr eure Vorschläge vor, Lea und Bas entscheiden. Bestellen, Preise ändern oder Lieferanten anschreiben nur nach Freigabe. Lies vorher Wissen → „Preise & Marge verstehen“.",
  },
  {
    title: "Recherche: eigener Tee oder Glühwein-Gewürz als Ergänzung?",
    category: "research",
    home_ok: true,
    description: "Wir überlegen, KANSŌ SPICES im Winter um Tee oder eine Glühwein-Gewürzmischung zu ergänzen. Findet heraus: Welche Anbieter gibt es für lose Ware bzw. Private Label? Mindestmengen? Preise pro 100 g? Was kosten vergleichbare Produkte in Lüneburg und online? Ergebnis als Kurzblatt hier hochladen. Kennzeichnung und Rezeptur bleiben bei Lea und Bas.",
  },
  {
    title: "Q4 · Oktober: Verpackungsmaterial und Geschenksets",
    category: "winter",
    description: "Das Weihnachtsgeschäft ist das wichtigste Quartal des Jahres. Alles, was verpackt, gebündelt und verschenkt wird, muss im Oktober stehen. Details unter Wissen → „Packaging / Q4 Weihnachten“ und „Bundles erstellen“. Alles, was Geld kostet, vorher mit Lea.",
    checklist: ["Verpackungsmaterial zählen", "Bedarf für Dezember schätzen, Bestellliste an Lea", "Geschenksets definieren (Preisstufen mit Lea abstimmen)", "Zwei Bundle-Vorschläge mit Kalkulation und Foto", "Idee für den Geschenktisch steht am 1. November"],
  },
  {
    title: "Winter in Lüneburg: Termine, Schaufenster, Geschenktisch",
    category: "winter",
    home_ok: true,
    description: "Im Winter sind viele Touristen und Weihnachtsmarkt-Besucher in der Stadt – darauf wollen wir gut vorbereitet sein. 1) Termine der Lüneburger Weihnachtsmärkte und verkaufsoffenen Tage heraussuchen und in den Kalender eintragen. 2) Konzept für das Weihnachts-Schaufenster ab November: drei Sätze plus Moodboard, erst Konzept mit Lea, dann bauen. 3) Welche Welten stellen wir nach vorne (Tenderflame-Geschenksets, Kerzen, KANSŌ SPICES)? Nichts kaufen ohne Freigabe.",
    checklist: ["Termine im Kalender eingetragen", "Schaufenster-Konzept (drei Sätze + Moodboard)", "Vorschlag Geschenktisch", "Zeitplan: Was muss bis wann fertig sein?"],
  },
  {
    title: "Herbst-Schaufenster: Was fehlt noch?",
    category: "store",
    description: "Lea hat das Herbst-Thema angefangen. Geht durch Laden und Schaufenster: Was wirkt schon, wo fehlt etwas? Vorher-Fotos machen, drei Ideen sammeln, mit Lea abstimmen, dann umsetzen. Wenige Stücke, ein Material-Schwerpunkt, viel Luft. Vorher/Nachher ins Drive, ein Foto als Instagram-Vorschlag in den Content-Plan.",
  },
];

export async function runSeed() {
  if (!(await q1("select 1 from kb_pages limit 1"))) {
    let pos = 0;
    const [welcome, ...rest] = PAGES;
    const all: Page[] = [welcome, ...LEA_PAGES, ...(areas as Page[]), ...rest];
    for (const p of all) {
      await q(
        "insert into kb_pages (slug, category, title_de, title_nl, body_de, body_nl, position) values ($1,$2,$3,$4,$5,$6,$7) on conflict (slug) do nothing",
        [p.slug, p.category, p.title_de, p.title_nl ?? null, p.body_de, p.body_nl ?? null, pos++],
      );
    }
  }
  if (!(await q1("select 1 from onboarding_items limit 1"))) {
    let pos = 0;
    for (const o of LEA_ONBOARDING) {
      await q("insert into onboarding_items (day, position, title_de, hint_de) values ($1,$2,$3,$4)", [o.day, pos++, o.de, o.hint]);
    }
  }
  if (!(await q1("select 1 from cleaning_tasks limit 1"))) {
    let pos = 0;
    for (const c of CLEANING) {
      await q("insert into cleaning_tasks (title_de, title_nl, freq, weekday, moment, zone, position) values ($1,$2,$3,$4,$5,$6,$7)", [c.de, c.nl, c.freq, c.weekday ?? null, c.moment, c.zone ?? null, pos++]);
    }
  }
  if (!(await q1("select 1 from tasks limit 1"))) {
    for (const t of TASKS) {
      const row = await q1<{ id: string }>("insert into tasks (title, description, category, home_ok) values ($1,$2,$3,$4) returning id", [t.title, t.description, t.category, !!t.home_ok]);
      let pos = 0;
      for (const c of t.checklist ?? []) await q("insert into task_checklist (task_id, text, position) values ($1,$2,$3)", [row!.id, c, pos++]);
    }
  }
}
