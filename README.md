# Kansō Team Hub

De hub voor de stagiairs van Kansō Outdoor Lüneburg. Alles op één plek: wie wanneer werkt, wat er te doen is, hoe dingen werken en waar je vragen stelt.

## Wat zit erin

| Onderdeel | Wat het doet |
|---|---|
| **Vandaag** | Weekfocus (max. 3), wie werkt vandaag, eigen dienst en pauze, afspraken, eigen opdrachten, Storepflege van vandaag, teller online-aanvragen, klantzin van de dag, laatste reacties |
| **Agenda** | Gezamenlijke maandkalender met afspraken, markten, school, leveringen. Stipjes laten zien wie werkt |
| **Rooster** | Weekrooster met diensten, pauzes, thuiswerk en school. Automatisch vullen: zaterdagen wisselen af (max. 2 per maand per persoon), wie zaterdag niet werkte doet maandag thuiswerk. Waarschuwt bij meer dan 8 uur per dag, 40 uur of 5 dagen per week |
| **Opdrachten** | Bord met Te doen / Bezig / Ter controle / Klaar. Per opdracht: omschrijving, checklist, bestanden, vragen en reacties, deadline, voor wie, "kan ook thuis" |
| **Vragen** | Laagdrempelig vragen stellen, met urgentie. Open vragen staan bij de beheerders bovenaan |
| **Storepflege** | Dagelijkse en wekelijkse ronde om af te vinken. De twee zones wisselen elke week van persoon |
| **Contentplan** | Reels, stories en posts plannen per pijler. Alleen een beheerder kan goedkeuren; posten kan pas daarna |
| **Productideeën** | Sourcing met automatische marge- en factorberekening (19 % of 7 % btw) |
| **Merkdagboek** | Klantzinnen en online-aanvragen per week |
| **Producten** | Live uit de webshop (WooCommerce), zoeken en filteren op categorie. Geen sleutels nodig |
| **Kennis** | So arbeiten wir, Was tun wenn, alle takengebieden, productlijnen, kassa, labelprinter, marge. Beheerders bewerken alles in de hub; geel gemarkeerde stukken moeten nog ingevuld worden |
| **Inwerken** | Checklist eerste week per stagiair; beheerders zien de voortgang van beiden |
| **Team** | Accounts aanmaken, wachtwoord resetten, blokkeren |

Rollen: **beheerder** (Bas, Lea) en **stagiair**. Taal per persoon: Duits of Nederlands.

## Online zetten (ongeveer 15 minuten, zelfde werkwijze als rijpex-hub)

1. **GitHub**: maak een nieuwe repository `kanso-team-hub` (Private) en upload de inhoud van deze map via *Add file → Upload files*. De mappen `node_modules` en `.next` hoeven niet mee.
2. **Vercel**: *Add New → Project* → kies `kanso-team-hub` → **Deploy**.
3. **Database**: in het Vercel-project → tabblad **Storage** → *Create Database* → **Supabase** → regio Frankfurt → *Create* en *Connect*. Vercel vult alle sleutels zelf in. Gebruik een nieuwe database, niet die van rijpex-hub.
4. **Deployments** → ⋯ bij de bovenste → **Redeploy**.
5. Open `https://JOUW-ADRES.vercel.app/setup`, maak je eigen beheerdersaccount aan. Doe dit meteen na het deployen: wie deze pagina als eerste opent, wordt beheerder.
6. Onder **Team** de accounts voor Lea (beheerder) en de twee stagiairs aanmaken. Daarna onder **Rooster** → *Rooster automatisch vullen*.

Optioneel: eigen adres zoals `team.kanso-outdoor.com` via Vercel → *Settings → Domains*.

**Nieuwe versie van de code geüpload?** Na de deploy in de hub onder *Team → Systeem* op **Database bijwerken** klikken.

## Techniek

Next.js 14 (App Router, TypeScript, Tailwind), Postgres via de Vercel-Supabase-koppeling, bestanden in Supabase Storage (privé bucket `team-hub`, uploads gaan rechtstreeks naar de opslag zodat ook video's werken). Eigen login met gebruikersnaam en wachtwoord, zodat de stagiairs geen e-mailadres nodig hebben; wachtwoorden worden gehasht opgeslagen (bcrypt), sessies staan in de database. Alle gegevens lopen via de server; de publieke Supabase-API heeft nergens toegang toe (RLS aan, geen policies).

```
src/app/app/*              de pagina's
src/app/app/actions.ts     alle acties (opslaan, afvinken, rooster vullen …) met rechtencontrole
src/lib/server/schema.ts   databaseschema
src/lib/server/seed.ts     startinhoud (wordt alleen ingevoegd in lege tabellen)
src/lib/server/seed-data/  inhoud uit Lea's cockpit
```

Lokaal draaien: `cp .env.example .env.local`, `DATABASE_URL=postgres://…` invullen, `npm install`, `npm run dev`, open http://localhost:3000/setup.
