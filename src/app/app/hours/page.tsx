import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { internDays, internHours, team, type HoursRow } from "@/lib/server/queries";
import { SHIFT_KIND, T, lbl } from "@/lib/i18n";
import { fmtHours } from "@/lib/hours";
import { addDays, hm, longDateY, monthName, parse, shortDate, today } from "@/lib/dates";
import { Avatar, PageHeader } from "@/components/ui";
import { GoalBarHours } from "@/components/Hours";
import { Submit } from "@/components/client";
import { saveInternship, saveWorkedHours } from "../actions";

const daysBetween = (a: string, b: string) => Math.round((parse(b).getTime() - parse(a).getTime()) / 86400000);

/** Prognose: bij het huidige tempo, wanneer staan de uren vol? */
function forecast(r: HoursRow, now: string) {
  const from = r.startDate || r.firstDate;
  const weeks = from ? Math.max(1, daysBetween(from, now) / 7) : 1;
  const perWeek = r.rosterMinutes / weeks;
  const left = Math.max(0, r.targetMinutes - r.doneMinutes);
  const date = perWeek > 60 && left > 0 ? addDays(now, Math.ceil((left / perWeek) * 7)) : null;
  return { perWeek, left, date, atEnd: r.doneMinutes + r.futureMinutes };
}

export default async function Hours({ searchParams }: { searchParams: { saved?: string; who?: string; all?: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const isAdmin = user.role === "admin";
  const now = today();
  const [rows, allDays, users] = await Promise.all([internHours(now), internDays(now), team()]);
  const mine = rows.filter((r) => isAdmin || r.user_id === user.id);
  const interns = users.filter((u) => u.role === "intern");
  const showAll = searchParams.all === "1";

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={tr("Praktikumsstunden", "Stage-uren")}
        sub={tr(
          "Gezählt wird, was im Dienstplan steht: Laden und Homeoffice, Pausen abgezogen, ab dem Beginn des Praktikums. Krank- und Schultage zählen nicht mit.",
          "Geteld wordt wat in het rooster staat: winkel en thuiswerk, pauzes eraf, vanaf de start van de stage. Ziekte- en schooldagen tellen niet mee.",
        )}
      >
        <Link href="/app/roster" className="btn-ghost btn-sm">{tr("Dienstplan", "Rooster")}</Link>
      </PageHeader>
      {searchParams.saved && <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{tr("Gespeichert.", "Opgeslagen.")}</p>}
      {!mine.length && <p className="rounded-xl bg-sand-100 p-4 text-sm">{tr("Für dich werden keine Stunden gezählt.", "Voor jou worden geen uren geteld.")}</p>}

      <div className="space-y-6">
        {mine.map((r) => {
          const f = forecast(r, now);
          const pct = r.targetMinutes ? Math.round((r.doneMinutes / r.targetMinutes) * 100) : 0;
          const days = allDays.filter((d) => d.user_id === r.user_id);
          const counted = days.filter((d) => d.counts);
          const planned = days.length - counted.length;
          const shown = showAll ? days : counted.slice(0, 20);
          const late = r.endDate && f.date && f.date > r.endDate;
          const endShort = r.endDate ? Math.max(0, r.targetMinutes - f.atEnd) : 0;
          return (
            <section key={r.user_id} className="card">
              <div className="flex flex-wrap items-center gap-2">
                <Avatar name={r.name} color={r.color} />
                <h2>{r.name}</h2>
                <span className="text-sm text-stone-500">
                  {r.startDate ? <>{tr("seit", "sinds")} {shortDate(r.startDate, user.lang)}</> : tr("Startdatum fehlt noch", "startdatum ontbreekt nog")}
                  {r.endDate && <> – {shortDate(r.endDate, user.lang)}</>}
                </span>
              </div>

              <div className="mt-3 text-4xl font-semibold tabular-nums">
                {fmtHours(r.doneMinutes)}<span className="text-lg font-normal text-stone-400"> {tr("von", "van")} {fmtHours(r.targetMinutes)} {tr("Stunden", "uur")} · {pct} %</span>
              </div>
              <GoalBarHours done={r.doneMinutes} planned={r.futureMinutes} target={r.targetMinutes} />
              <p className="mt-1.5 text-sm text-stone-600">
                {f.left > 0
                  ? tr(`Noch ${fmtHours(f.left)} Stunden. Im Dienstplan stehen davon schon ${fmtHours(r.futureMinutes)} Stunden (hell im Balken).`,
                       `Nog ${fmtHours(f.left)} uur. Daarvan staat al ${fmtHours(r.futureMinutes)} uur in het rooster (licht in de balk).`)
                  : tr("Die 900 Stunden sind voll.", "De uren zijn vol.")}
              </p>

              <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { k: tr("Diese Woche", "Deze week"), v: `${fmtHours(r.weekDone)} / ${fmtHours(r.weekPlanned)} h` },
                  { k: tr("Dieser Monat", "Deze maand"), v: `${fmtHours(r.monthDone)} h` },
                  { k: tr("Schnitt pro Woche", "Gemiddeld per week"), v: `${fmtHours(f.perWeek)} h` },
                  { k: tr("Arbeitstage", "Werkdagen"), v: String(r.days) },
                ].map((x) => (
                  <div key={x.k} className="rounded-xl bg-sand-100 p-2 text-center">
                    <dt className="text-[11px] uppercase tracking-wide text-stone-500">{x.k}</dt>
                    <dd className="text-lg font-semibold tabular-nums">{x.v}</dd>
                  </div>
                ))}
              </dl>

              <div className={`mt-3 rounded-xl p-3 text-sm ${late ? "bg-amber-50 text-amber-900" : "bg-brand-light"}`}>
                {f.left <= 0
                  ? <b>{tr("Die Stunden sind voll.", "De uren zijn vol.")}</b>
                  : f.date
                  ? <><b>{tr("Bei diesem Tempo", "Bij dit tempo")}:</b> {tr("die Stunden sind voll am", "de uren zijn vol op")} <span className="capitalize">{longDateY(f.date, user.lang)}</span>.</>
                  : <b>{tr("Noch zu wenig Daten für eine Prognose.", "Nog te weinig gegevens voor een prognose.")}</b>}
                {r.endDate && (
                  <> {tr("Mit dem Dienstplan von heute sind es am", "Met het rooster van nu is dat op")} {shortDate(r.endDate, user.lang)} <b>{fmtHours(f.atEnd)} {tr("Stunden", "uur")}</b>
                    {endShort > 0
                      ? tr(` – also ${fmtHours(endShort)} Stunden zu wenig. Plant rechtzeitig mehr Tage ein.`, ` – dus ${fmtHours(endShort)} uur te weinig. Plan op tijd extra dagen in.`)
                      : tr(" – das reicht.", " – dat is genoeg.")}
                  </>
                )}
                {r.beforeMinutes > 0 && <> {tr("Darin enthalten:", "Daarin zit:")} {fmtHours(r.beforeMinutes)} {tr("Stunden von vor dem Hub.", "uur van vóór de hub.")}</>}
              </div>

              {r.months.length > 0 && (
                <table className="mt-4 w-full text-sm">
                  <thead><tr className="text-left text-xs uppercase tracking-wide text-stone-400"><th className="font-medium">{tr("Monat", "Maand")}</th><th className="font-medium">{tr("Stunden", "Uren")}</th><th className="font-medium">{tr("Tage", "Dagen")}</th><th className="font-medium">{tr("Schnitt pro Tag", "Gemiddeld per dag")}</th></tr></thead>
                  <tbody>
                    {r.months.map((m) => (
                      <tr key={m.month} className="border-t border-sand-200">
                        <td className="py-1.5 capitalize">{monthName(m.month, user.lang)}</td>
                        <td className="font-semibold tabular-nums">{fmtHours(m.minutes)}</td>
                        <td className="tabular-nums text-stone-500">{m.days}</td>
                        <td className="tabular-nums text-stone-500">{fmtHours(m.days ? m.minutes / m.days : 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold">{tr("Tag für Tag", "Dag voor dag")} ({counted.length} {tr("gezählte Tage", "getelde dagen")}{planned > 0 && <> · {planned} {tr("noch geplant", "nog gepland")}</>})</summary>
                <table className="mt-2 w-full text-sm">
                  <thead><tr className="text-left text-xs uppercase tracking-wide text-stone-400"><th className="font-medium">{tr("Tag", "Dag")}</th><th className="font-medium">{tr("Im Dienstplan", "In het rooster")}</th><th className="font-medium">{tr("Stunden", "Uren")}</th>{isAdmin && <th className="font-medium">{tr("Korrektur", "Correctie")}</th>}</tr></thead>
                  <tbody>
                    {shown.map((d) => (
                      <tr key={d.date} className={`border-t border-sand-200 ${d.counts ? "" : "text-stone-400"}`}>
                        <td className="py-1.5 capitalize">{shortDate(d.date, user.lang)}{!d.counts && <span className="ml-1 text-xs">({d.date > now ? tr("geplant", "gepland") : tr("vor Beginn", "voor de start")})</span>}</td>
                        <td className="text-stone-500">
                          {d.start_time ? `${hm(d.start_time)}–${hm(d.end_time)}` : tr("von Hand", "met de hand")}
                          {d.kind !== "shop" && <> · {lbl(user.lang, SHIFT_KIND[d.kind])}</>}
                          {d.note && <> · {d.note}</>}
                        </td>
                        <td className="tabular-nums font-semibold">{fmtHours(d.minutes)}{d.worked_minutes != null && <span className="ml-1 text-xs font-normal text-brand">{tr("korrigiert", "gecorrigeerd")}</span>}</td>
                        {isAdmin && (
                          <td>
                            <form action={saveWorkedHours} className="flex items-center gap-1">
                              <input type="hidden" name="user_id" value={r.user_id} /><input type="hidden" name="date" value={d.date} /><input type="hidden" name="back" value="/app/hours" />
                              <input name="hours" inputMode="decimal" className="input !w-16 !py-1 text-xs" defaultValue={d.worked_minutes != null ? (d.worked_minutes / 60).toFixed(2).replace(/\.?0+$/, "").replace(".", ",") : ""} placeholder={fmtHours(d.minutes)} />
                              <button className="btn-ghost btn-sm">{tr("Ok", "Ok")}</button>
                            </form>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!showAll && days.length > shown.length && <Link href="/app/hours?all=1" className="mt-2 inline-block text-sm text-brand hover:underline">{tr("Alle Tage zeigen, auch die geplanten", "Alle dagen tonen, ook de geplande")} ({days.length})</Link>}
                {showAll && <Link href="/app/hours" className="mt-2 inline-block text-sm text-brand hover:underline">{tr("Nur gezählte Tage zeigen", "Alleen getelde dagen tonen")}</Link>}
                {isAdmin && <p className="mt-2 text-xs text-stone-500">{tr("Korrektur: trag die wirklich gearbeiteten Stunden ein (z. B. 6,5). Leer lassen = wieder aus dem Dienstplan rechnen.", "Correctie: vul de echt gewerkte uren in (bijv. 6,5). Leeg laten = weer uit het rooster rekenen.")}</p>}
              </details>

              {isAdmin && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-semibold">{tr("Einstellungen für dieses Praktikum", "Instellingen voor deze stage")}</summary>
                  <form action={saveInternship} className="mt-2 grid gap-3 sm:grid-cols-4">
                    <input type="hidden" name="id" value={r.user_id} />
                    <div><label className="label">{tr("Beginn", "Start")}</label><input type="date" name="start_date" className="input" defaultValue={r.startDate || ""} /></div>
                    <div><label className="label">{tr("Ende", "Einde")}</label><input type="date" name="end_date" className="input" defaultValue={r.endDate || ""} /></div>
                    <div><label className="label">{tr("Stundenziel", "Urendoel")}</label><input name="target_hours" inputMode="numeric" className="input" defaultValue={Math.round(r.targetMinutes / 60)} /></div>
                    <div><label className="label">{tr("Stunden vor dem Hub", "Uren vóór de hub")}</label><input name="before_hours" inputMode="decimal" className="input" defaultValue={r.beforeMinutes ? (r.beforeMinutes / 60).toFixed(2).replace(/\.?0+$/, "") : ""} /></div>
                    <div className="sm:col-span-4"><Submit>{tr("Speichern", "Opslaan")}</Submit></div>
                  </form>
                  <p className="mt-2 text-xs text-stone-500">{tr(
                    "Ab dem Beginn wird gezählt. Was davor war, trägst du als „Stunden vor dem Hub“ einmalig ein.",
                    "Vanaf de startdatum wordt geteld. Wat daarvoor was, vul je eenmalig in bij \"uren vóór de hub\".",
                  )}</p>
                </details>
              )}
            </section>
          );
        })}
      </div>

      {isAdmin && interns.length > 0 && (
        <section className="card mt-6">
          <h2 className="mb-1">{tr("Tag nachtragen", "Dag bijboeken")}</h2>
          <p className="muted mb-3">{tr(
            "Ein Tag, der nicht im Dienstplan steht – Markt, Event, Nacharbeit. Er wird als Ladentag mit diesen Stunden eingetragen.",
            "Een dag die niet in het rooster staat – markt, event, inhalen. Die komt erin als winkeldag met deze uren.",
          )}</p>
          <form action={saveWorkedHours} className="grid gap-3 sm:grid-cols-4">
            <input type="hidden" name="back" value="/app/hours" />
            <div><label className="label">{tr("Wer", "Wie")}</label><select name="user_id" className="input">{interns.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
            <div><label className="label">{tr("Tag", "Dag")}</label><input type="date" name="date" className="input" defaultValue={now} required /></div>
            <div><label className="label">{tr("Stunden", "Uren")}</label><input name="hours" inputMode="decimal" className="input" placeholder="6,5" required /></div>
            <div><label className="label">{tr("Notiz", "Notitie")}</label><input name="note" className="input" /></div>
            <div className="sm:col-span-4"><Submit>{tr("Eintragen", "Toevoegen")}</Submit></div>
          </form>
        </section>
      )}

      {!isAdmin && (
        <p className="mt-6 rounded-xl bg-sand-100 p-3 text-sm text-stone-600">{tr(
          "Stimmt ein Tag nicht? Sag es Lea oder Bas, dann korrigieren wir ihn hier. Krank- und Schultage zählen nicht mit – trag sie unter „Abwesenheit“ ein.",
          "Klopt een dag niet? Zeg het tegen Lea of Bas, dan corrigeren we hem hier. Ziekte- en schooldagen tellen niet mee – zet ze bij \"Afwezigheid\".",
        )}</p>
      )}
    </div>
  );
}
