import Link from "next/link";
import type { User } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { internHours } from "@/lib/server/queries";
import { EVENT_KIND, REQUEST_KIND, SHIFT_KIND, T, pick } from "@/lib/i18n";
import { addDays, hm, longDate, shortDate, today, weekday } from "@/lib/dates";
import { openingOn } from "@/lib/hours";
import { Avatar, Badge } from "@/components/ui";
import { HoursCard } from "@/components/Hours";

/**
 * Kompakte Startseite für den Verkäufer (Mathias): heute im Laden, Kundenfragen und Leads,
 * eigene Stunden, Termine und die Verkaufsseiten im Wissen. Keine Checklisten, kein Praktikumskram.
 */
export async function SellerToday({ user }: { user: User }) {
  const tr = T(user.lang);
  const d = today();
  const tomorrow = addDays(d, 1);
  const [shifts, tomorrowShifts, events, mine, hours, pages] = await Promise.all([
    q<{ user_id: string; name: string; color: string; kind: string; start_time: string | null; end_time: string | null; note: string | null }>(
      "select s.user_id, u.name, u.color, s.kind, s.start_time, s.end_time, s.note from shifts s join users u on u.id = s.user_id where s.date = $1 and u.active and s.kind <> 'off' order by u.created_at", [d]),
    q<{ name: string }>("select u.name from shifts s join users u on u.id = s.user_id where s.date = $1 and u.active and s.kind = 'shop' order by u.created_at", [tomorrow]),
    q<{ id: string; title: string; date: string; start_time: string | null; kind: string }>(
      "select id, title, date, start_time, kind from events where coalesce(end_date, date) >= $1 and date <= $2 order by date, start_time nulls first limit 6", [d, addDays(d, 14)]),
    q<{ id: string; date: string; kind: string; text: string; product: string | null; status: string; action_needed: boolean; contact_name: string | null; title: string | null }>(
      "select id, date::text as date, kind, text, product, status, action_needed, contact_name, title from customer_requests where user_id = $1 order by created_at desc limit 8", [user.id]),
    internHours(d),
    q<{ slug: string; title_de: string; title_nl: string | null }>("select slug, title_de, title_nl from kb_pages where category = 'verkauf' order by position, title_de"),
  ]);
  const my = shifts.find((s) => s.user_id === user.id);
  const open = openingOn(d)[weekday(d)];
  const openTomorrow = openingOn(tomorrow)[weekday(tomorrow)];
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Europe/Berlin" }).format(new Date()));
  const greet = hour < 11 ? tr("Guten Morgen", "Goedemorgen") : hour < 17 ? tr("Hallo", "Hoi") : tr("Guten Abend", "Goedenavond");
  const openLeads = mine.filter((r) => r.status === "open");

  return (
    <div className="space-y-5">
      <section className="card !bg-white">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div>
            <p className="muted capitalize">{longDate(d, user.lang)}</p>
            <h1>{greet}, {user.name}</h1>
            <p className="mt-1 text-sm">
              {open ? <span className="font-medium text-emerald-700">{tr("Heute geöffnet", "Vandaag open")} {open.open}–{open.close}</span> : <span className="font-medium text-stone-500">{tr("Heute geschlossen", "Vandaag gesloten")}</span>}
              <span className="text-stone-400"> · {tr("morgen", "morgen")} {openTomorrow ? `${openTomorrow.open}–${openTomorrow.close}` : tr("geschlossen", "gesloten")}{tomorrowShifts.length > 0 && <> ({tomorrowShifts.map((s) => s.name).join(", ")})</>}</span>
            </p>
            {my ? (
              <p className="mt-2 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-brand-light px-3 py-2 text-sm">
                <b>{tr("Deine Schicht", "Jouw dienst")}</b> {hm(my.start_time)}–{hm(my.end_time)} <Badge l={SHIFT_KIND[my.kind]} lang={user.lang} />{my.note && <span className="text-stone-600">· {my.note}</span>}
              </p>
            ) : (
              <p className="mt-2 inline-block rounded-xl bg-sand-100 px-3 py-2 text-sm text-stone-500">{tr("Heute keine Schicht.", "Vandaag geen dienst.")}</p>
            )}
          </div>
          <div className="sm:min-w-[14rem]">
            <div className="mb-2 flex items-center justify-between gap-3"><span className="text-xs font-semibold uppercase tracking-wide text-stone-400">{tr("Heute im Laden", "Vandaag in de winkel")}</span><Link href="/app/roster" className="text-xs text-brand hover:underline">{tr("Dienstplan", "Rooster")} →</Link></div>
            <ul className="space-y-1.5 text-sm">
              {shifts.map((s) => (
                <li key={s.user_id} className={`flex items-center gap-2 rounded-lg px-1.5 py-1 ${s.user_id === user.id ? "bg-sand-100" : ""}`}>
                  <Avatar name={s.name} color={s.color} size="h-6 w-6 text-[10px]" /><span className="font-medium">{s.name}</span>
                  {s.kind !== "shop" && <Badge l={SHIFT_KIND[s.kind]} lang={user.lang} />}
                  <span className="ml-auto tabular-nums text-stone-500">{s.start_time ? `${hm(s.start_time)}–${hm(s.end_time)}` : ""}</span>
                </li>
              ))}
              {!shifts.length && <li className="text-stone-500">{tr("Niemand eingetragen.", "Niemand ingepland.")}</li>}
            </ul>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <section className="card">
            <div className="mb-1 flex items-start justify-between gap-3"><h2>{tr("Aus dem Laden notieren", "Uit de winkel noteren")}</h2><Link href="/app/journal" className="shrink-0 pt-1 text-sm text-brand hover:underline">{tr("Alle", "Alle")} →</Link></div>
            <p className="mb-3 text-xs text-stone-500">{tr(
              "Lead = Interesse an Küche, Pergola, Kamado oder Einrichtung: Name und Telefonnummer sind das Wichtigste (zählt für deine Projektprovision). Fragen, die du nicht beantworten konntest, und deine Ideen für den Laden kommen hier auch rein.",
              "Lead = interesse in keuken, pergola, kamado of inrichting: naam en telefoonnummer zijn het belangrijkst (telt voor je projectprovisie). Vragen die je niet kon beantwoorden en je ideeën voor de winkel komen hier ook in.",
            )}</p>
            <div className="grid grid-cols-3 gap-2">
              <Link href="/app/journal?tab=lead&new=1" className="flex flex-col items-center justify-center gap-1 rounded-xl bg-emerald-50 px-2 py-4 text-center ring-1 ring-emerald-200 transition hover:bg-emerald-100"><span className="text-2xl leading-none">+</span><span className="text-sm font-semibold">{tr("Lead", "Lead")}</span><span className="text-[11px] leading-tight text-stone-500">{tr("Name & Telefon", "Naam & telefoon")}</span></Link>
              <Link href="/app/journal?tab=question&new=1" className="flex flex-col items-center justify-center gap-1 rounded-xl bg-sky-50 px-2 py-4 text-center ring-1 ring-sky-200 transition hover:bg-sky-100"><span className="text-2xl leading-none">+</span><span className="text-sm font-semibold">{tr("Kundenfrage", "Klantvraag")}</span><span className="text-[11px] leading-tight text-stone-500">{tr("gefragt, gesucht", "gevraagd, gezocht")}</span></Link>
              <Link href="/app/journal?tab=idea&new=1" className="flex flex-col items-center justify-center gap-1 rounded-xl bg-violet-50 px-2 py-4 text-center ring-1 ring-violet-200 transition hover:bg-violet-100"><span className="text-2xl leading-none">+</span><span className="text-sm font-semibold">{tr("Idee", "Idee")}</span><span className="text-[11px] leading-tight text-stone-500">{tr("mit Foto oder Skizze", "met foto of schets")}</span></Link>
            </div>
          </section>

          {mine.length > 0 && (
            <section className="card">
              <h2 className="mb-2">{tr("Deine letzten Einträge", "Jouw laatste invoer")} {openLeads.length > 0 && <span className="text-sm font-normal text-stone-500">· {openLeads.length} {tr("offen", "open")}</span>}</h2>
              <ul className="divide-y divide-sand-200 text-sm">
                {mine.map((r) => (
                  <li key={r.id} className="flex items-start gap-2 py-1.5">
                    <Badge l={REQUEST_KIND[r.kind]} lang={user.lang} />
                    <Link href={`/app/journal?edit=${r.id}`} className="min-w-0 flex-1 hover:underline">{r.kind === "lead" ? <b>{r.contact_name || r.text}</b> : r.kind === "idea" ? <b>{r.title || r.text}</b> : <>{r.product && <b>{r.product} · </b>}{r.text}</>}</Link>
                    <span className="shrink-0 text-xs text-stone-400">{shortDate(r.date, user.lang)}{r.status === "done" && " ✓"}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="card">
            <div className="mb-2 flex items-center justify-between"><h2>{tr("Verkaufswissen", "Verkoopkennis")}</h2><Link href="/app/kb" className="text-sm text-brand hover:underline">{tr("Alle Seiten", "Alle pagina's")} →</Link></div>
            <div className="grid gap-2 sm:grid-cols-2">
              {pages.map((p) => <Link key={p.slug} href={`/app/kb/${p.slug}`} className="rounded-xl bg-white p-3 text-sm font-medium ring-1 ring-sand-200 hover:ring-brand">{pick(user.lang, p.title_de, p.title_nl)}</Link>)}
              {!pages.length && <p className="text-sm text-stone-500">{tr("Noch keine Seiten.", "Nog geen pagina's.")}</p>}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <HoursCard rows={hours} lang={user.lang} me={user} isAdmin={false} />
          <section className="card">
            <div className="mb-3 flex items-center justify-between"><h2>{tr("Termine", "Agenda")}</h2><Link href="/app/calendar" className="text-sm text-brand hover:underline">{tr("Kalender", "Agenda")} →</Link></div>
            <ul className="space-y-2 text-sm">
              {events.map((e) => (
                <li key={e.id} className="flex items-start gap-2">
                  <span className="w-20 shrink-0 text-stone-500">{e.date <= d ? tr("Heute", "Vandaag") : shortDate(e.date, user.lang)}</span>
                  <span className="min-w-0 flex-1"><span className="block font-medium leading-snug">{e.title}</span><span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-stone-500">{e.start_time && <span>{hm(e.start_time)}</span>}<Badge l={EVENT_KIND[e.kind]} lang={user.lang} /></span></span>
                </li>
              ))}
              {!events.length && <li className="text-stone-500">{tr("Keine Termine in den nächsten 2 Wochen.", "Geen afspraken de komende 2 weken.")}</li>}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
