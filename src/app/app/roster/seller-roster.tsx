import Link from "next/link";
import type { User } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { SHIFT_KIND, T, lbl } from "@/lib/i18n";
import { fmtHours, openingOn, shiftMinutes } from "@/lib/hours";
import { addDays, dayName, hm, isoWeek, longDate, monday, monthName, shortDate, today, weekday } from "@/lib/dates";
import { Avatar } from "@/components/ui";

type Sh = { user_id: string; name: string; color: string; role: string; date: string; kind: string; start_time: string | null; end_time: string | null; note: string | null };

/**
 * Dienstplan für den Verkäufer: seine nächsten Schichten groß, mit Stunden und wer an dem Tag noch da ist.
 * Darunter der Wochenplan des Teams, kompakt. Keine Bearbeitung – Änderungen laufen über Bas und Lea.
 */
export async function SellerRoster({ user, week }: { user: User; week: string }) {
  const tr = T(user.lang);
  const now = today();
  const mon = monday(week);
  const days = [0, 1, 2, 3, 4, 5].map((i) => addDays(mon, i));
  const horizon = addDays(now, 56);
  const [mine, team, weekShifts] = await Promise.all([
    q<Sh>("select s.user_id, u.name, u.color, u.role, s.date::text as date, s.kind, s.start_time, s.end_time, s.note from shifts s join users u on u.id = s.user_id where s.user_id = $1 and s.kind = 'shop' and s.date between $2 and $3 order by s.date", [user.id, now, horizon]),
    q<Sh>("select s.user_id, u.name, u.color, u.role, s.date::text as date, s.kind, s.start_time, s.end_time, s.note from shifts s join users u on u.id = s.user_id where u.active and s.kind = 'shop' and s.user_id <> $1 and s.date in (select date from shifts where user_id = $1 and kind = 'shop' and date between $2 and $3) order by u.created_at", [user.id, now, horizon]),
    q<Sh>("select s.user_id, u.name, u.color, u.role, s.date::text as date, s.kind, s.start_time, s.end_time, s.note from shifts s join users u on u.id = s.user_id where u.active and s.date between $1 and $2 and s.kind <> 'off' order by u.role, u.created_at", [mon, addDays(mon, 6)]),
  ]);
  const next = mine.slice(0, 10);
  const withMe = (d: string) => team.filter((s) => s.date === d);
  const month = now.slice(0, 7);
  const monthMin = mine.filter((s) => s.date.slice(0, 7) === month).reduce((n, s) => n + shiftMinutes(s), 0);
  const nextMonth = addDays(`${month}-28`, 7).slice(0, 7);
  const nextMonthMin = mine.filter((s) => s.date.slice(0, 7) === nextMonth).reduce((n, s) => n + shiftMinutes(s), 0);
  const people = [...new Map(weekShifts.map((s) => [s.user_id, s])).values()];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1>{tr("Mein Dienstplan", "Mijn rooster")}</h1>
          <p className="muted">{tr("Deine Schichten der nächsten 8 Wochen. Änderungen oder Tausch: kurz Bas oder Lea Bescheid sagen.", "Je diensten van de komende 8 weken. Wijzigen of ruilen: even Bas of Lea laten weten.")}</p>
        </div>
        <Link href="/app/hours" className="btn-ghost btn-sm">{tr("Meine Stunden", "Mijn uren")} →</Link>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section className="card">
          <h2 className="mb-3">{tr("Nächste Schichten", "Volgende diensten")}</h2>
          {next.length ? (
            <ul className="divide-y divide-sand-200">
              {next.map((s) => {
                const o = openingOn(s.date)[weekday(s.date)];
                const others = withMe(s.date);
                return (
                  <li key={s.date} className={`grid gap-x-4 gap-y-1 py-3 sm:grid-cols-[8.5rem_1fr]`}>
                    <div>
                      <div className={`font-semibold capitalize ${s.date === now ? "text-brand" : ""}`}>{s.date === now ? tr("Heute", "Vandaag") : shortDate(s.date, user.lang)}</div>
                      <div className="text-xs text-stone-500">{tr("KW", "Week")} {isoWeek(s.date)}</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold tabular-nums">{hm(s.start_time)}–{hm(s.end_time)} <span className="text-sm font-normal text-stone-500">· {fmtHours(shiftMinutes(s))} h</span></div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                        {o && <span>{tr("Laden", "Winkel")} {o.open}–{o.close}</span>}
                        {others.length > 0 && <span className="flex items-center gap-1">{tr("mit", "met")} {others.map((x) => <span key={x.user_id} className="flex items-center gap-1"><Avatar name={x.name} color={x.color} size="h-4 w-4 text-[8px]" />{x.name}</span>)}</span>}
                        {s.note && <span>· {s.note}</span>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-stone-500">{tr("Noch keine Schichten eingetragen – Bas oder Lea tragen sie ein.", "Nog geen diensten ingepland – Bas of Lea zetten ze erin.")}</p>
          )}
        </section>

        <div className="space-y-5">
          <section className="card">
            <h2 className="mb-2">{tr("Geplante Stunden", "Geplande uren")}</h2>
            <dl className="grid grid-cols-2 gap-2 text-center">
              {[
                { k: monthName(`${month}-01`, user.lang), v: `${fmtHours(monthMin)} h` },
                { k: monthName(`${nextMonth}-01`, user.lang), v: `${fmtHours(nextMonthMin)} h` },
              ].map((x) => (
                <div key={x.k} className="rounded-xl bg-sand-100 p-2">
                  <dt className="text-[11px] uppercase tracking-wide text-stone-500">{x.k}</dt>
                  <dd className="text-lg font-semibold tabular-nums">{x.v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 text-xs text-stone-500">{tr("Ab heute, laut Dienstplan. Was du schon gearbeitet hast, steht unter Meine Stunden.", "Vanaf vandaag, volgens het rooster. Wat je al gewerkt hebt staat onder Mijn uren.")}</p>
          </section>
          <section className="card">
            <h2 className="mb-1">{tr("Gut zu wissen", "Goed om te weten")}</h2>
            <ul className="space-y-1 text-sm text-stone-600">
              <li>{tr("Deine Schicht sind die letzten 4 Stunden bis Ladenschluss – du schließt mit ab (Storepflege „Zum Feierabend“).", "Je dienst is de laatste 4 uur tot sluiting – jij sluit mee af (winkelverzorging „bij sluiten“).")}</li>
              <li>{tr("Krank oder verhindert: so früh wie möglich Bas oder Lea anrufen.", "Ziek of verhinderd: zo vroeg mogelijk Bas of Lea bellen.")}</li>
            </ul>
          </section>
        </div>
      </div>

      <section className="card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2>{tr("Das Team diese Woche", "Het team deze week")} <span className="text-sm font-normal text-stone-500">· {tr("KW", "week")} {isoWeek(mon)}</span></h2>
          <div className="flex gap-1">
            <Link className="btn-ghost btn-sm" href={`/app/roster?w=${addDays(mon, -7)}`}>←</Link>
            <Link className="btn-ghost btn-sm" href="/app/roster">{tr("Diese Woche", "Deze week")}</Link>
            <Link className="btn-ghost btn-sm" href={`/app/roster?w=${addDays(mon, 7)}`}>→</Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead><tr className="border-b border-sand-200 text-left text-xs uppercase text-stone-400"><th className="p-2"></th>{days.map((d) => <th key={d} className={`p-2 font-medium ${d === now ? "text-ink" : ""}`}>{dayName(d, user.lang)} {Number(d.slice(8))}.</th>)}</tr></thead>
            <tbody>
              {people.map((p) => (
                <tr key={p.user_id} className={`border-b border-sand-100 last:border-0 ${p.user_id === user.id ? "bg-brand-light/40" : ""}`}>
                  <td className="whitespace-nowrap p-2"><span className="flex items-center gap-2 font-medium"><Avatar name={p.name} color={p.color} size="h-6 w-6 text-[10px]" />{p.name}</span></td>
                  {days.map((d) => {
                    const s = weekShifts.find((x) => x.user_id === p.user_id && x.date === d);
                    return <td key={d} className="p-1 align-top">{s ? <div className={`rounded-lg px-1.5 py-1 text-xs ${SHIFT_KIND[s.kind]?.color}`}>{s.start_time ? `${hm(s.start_time)}–${hm(s.end_time)}` : lbl(user.lang, SHIFT_KIND[s.kind])}</div> : <div className="px-1.5 py-1 text-center text-xs text-stone-300">–</div>}</td>;
                  })}
                </tr>
              ))}
              {!people.length && <tr><td colSpan={7} className="p-3 text-stone-500">{tr("Noch nichts eingetragen.", "Nog niets ingepland.")}</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-stone-500">{tr("Öffnungszeiten", "Openingstijden")}: {days.map((d) => { const o = openingOn(d)[weekday(d)]; return o ? `${dayName(d, user.lang)} ${o.open}–${o.close}` : null; }).filter(Boolean).join(" · ")}</p>
      </section>
    </div>
  );
}
