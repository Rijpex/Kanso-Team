/**
 * Lernziele der Praktikantinnen (v22): weniger, dafür konkret – jedes mit einem Satz, woran man „selbstständig“ erkennt.
 * `from` = alte Lernziele (bis v21), deren Einschätzung übernommen wird.
 */
export const SKILLS_V2: { area: string; title: string; hint: string; from?: string[] }[] = [
  // Verkauf
  { area: "Verkauf", title: "Kundinnen ansprechen und ins Gespräch kommen",
    hint: "Begrüßen, kurz Zeit lassen, dann eine offene Frage statt „Kann ich helfen?“ – z. B. „Suchen Sie etwas für drinnen oder für den Garten?“",
    from: ["Kundinnen begrüßen und mit einer offenen Frage beraten"] },
  { area: "Verkauf", title: "Tenderflame vorführen und verkaufen",
    hint: "Das Verkaufsgespräch in einer Minute, mit brennendem Tischfeuer: die drei Sätze („kein Bio-Ethanol“, „drinnen und draußen“, „anzünden, fertig“), Brenndauer nennen (Café 14 ≈ 4–5 Std.), lieber ein Set als ein Einzelteil, Tenderfuel und Pen Torch dazu. Ziel: allein einen Verkauf abschließen. Alles dazu in Wissen → Tenderflame." },
  { area: "Verkauf", title: "Kasse: kassieren, Bon, abends zählen und ins Kassenbuch",
    hint: "Bar und Karte ohne Hilfe, Kasse am Abend zählen, Abweichung sofort an Lea melden.",
    from: ["Kasse: Bar- und Kartenzahlung, Bon", "Kasse zählen und Kassenbuch führen"] },
  { area: "Verkauf", title: "Geschenk im KANSO-Standard einpacken",
    hint: "Ordentlich, mit Band und Karte, in unter zwei Minuten.",
    from: ["Geschenk im KANSO-Standard einpacken (unter zwei Minuten)"] },
  { area: "Verkauf", title: "Projektanfrage aufnehmen (Küche, Pergola)",
    hint: "Name, Telefon/E-Mail, was gewünscht ist, ungefähres Budget – und einen Termin mit Bas oder Lea anbieten. Als Lead eintragen.",
    from: ["Projektanfrage aufnehmen: Kontaktdaten, Anliegen, Termin anbieten"] },

  // Laden
  { area: "Laden", title: "Laden selbstständig öffnen und schließen",
    hint: "Nach der Checkliste, ohne nachzufragen.",
    from: ["Laden selbstständig öffnen und schließen"] },
  { area: "Laden", title: "Regale und Schränke selbstständig auffüllen",
    hint: "Lücken selbst sehen, aus dem Lager nachfüllen, Fronten ziehen, Preisschild prüfen. Was im Lager fast leer ist, auf die Bestellliste schreiben.",
    from: ["Warenpräsentation: Regale, Fronten, Preisschilder"] },
  { area: "Laden", title: "Lieferung annehmen und einräumen",
    hint: "Zählen, mit dem Lieferschein vergleichen, Schäden fotografieren, Ware einräumen.",
    from: ["Lieferung annehmen, zählen, Schäden dokumentieren"] },
  { area: "Laden", title: "Schaufenster gestalten",
    hint: "Eigene Idee vorschlagen, nach Freigabe aufbauen und ein Foto davon posten.",
    from: ["Schaufenster-Konzept entwickeln und umsetzen"] },

  // Instagram
  { area: "Instagram", title: "Reel selbstständig drehen, schneiden und posten",
    hint: "Idee, Dreh mit dem Handy, Schnitt, Caption in der KANSO-Stimme – nur noch kurz zur Freigabe zeigen. Ziel: ein Reel pro Woche ohne Hilfe.",
    from: ["Reel drehen und schneiden", "Caption in der KANSO-Stimme schreiben"] },
  { area: "Instagram", title: "Content-Konzept ausdenken",
    hint: "Eine kleine Serie (z. B. drei Reels zu einem Produkt) mit Hook, Ablauf und Ziel planen und Lea und Bas vorstellen.",
    from: ["Story planen und erstellen"] },
  { area: "Instagram", title: "Produktfoto, das zum Feed passt",
    hint: "Ruhiger Hintergrund, gutes Licht, im Stil der bisherigen Fotos.",
    from: ["Produktfoto machen, das zur Serie passt"] },

  // Arbeitsweise
  { area: "Arbeitsweise", title: "Eigene Woche planen und abarbeiten",
    hint: "Aufgaben in der Agenda einplanen, erledigte abhaken, Offenes mitnehmen.",
    from: ["Eigene Woche in der Agenda planen"] },
  { area: "Arbeitsweise", title: "Nachfragen statt raten – und rechtzeitig Bescheid geben",
    hint: "Lieber einmal mehr fragen; wenn etwas nicht klappt, sofort sagen, nicht erst am Ende.",
    from: ["Nachfragen, bevor man rät", "Rechtzeitig Bescheid geben, wenn etwas nicht klappt"] },
];
