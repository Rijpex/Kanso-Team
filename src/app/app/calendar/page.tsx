import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { EVENT_KIND, SHIFT_KIND, T, lbl } from "@/lib/i18n";
import { addDays, dayName, fmt, hm, longDate, monday, monthName, parse, today, weekday } from "@/lib/dates";
import { Avatar, Badge, PageHeader } from "@/components/ui";
import { ConfirmSubmit, Submit } from "@/components/client";
import { deleteEvent, saveEvent } from "../actions";

type Ev = { id: string; title: string; note: string | null; date: string; end_date: string | null; start_time: string | null; end_time: string | null; kind: string; created_by: string | null };
type Sh = { user_id: string; date: string; kind: string; start_time: string | null; end_time: string | null; name: string; color: string };

export default async function Calendar({ searchParams }: { searchParams: { m?: string; d?: string; edit?: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const now = today();
  const sel = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.d || "") ? searchParams.d! : now;
  const month = /^\d{4}-\d{2}$/.test(searchParams.m || "") ? searchParams.m! : sel.slice(0, 7);
  const first = `${month}-01`;
  const gridStart = monday(first);
  const next = parse(first); next.setUTCMonth(next.getUTCMonth() + 1);
  const prev = parse(first); prev.setUTCMonth(prev.getUTCMonth() - 1);
  const lastDay = addDays(fmt(next), -1);
  const gridEnd = addDays(monday(lastDay), 6);
  const days: string[] = [];
  for (let x = gridStart; x <= gridEnd; x = addDays(x, 1)) days.push(x);

  const [events, shifts] = await Promise.all([
    q<Ev>("select * from events where date <= $2 and coalesce(end_date, date) >= $1 order by start_time nulls first, created_at", [gridStart, gridEnd]),
    q<Sh>("select s.user_id, s.date, s.kind, s.start_time, s.end_time, u.name, u.color from shifts s join users u on u.id = s.user_id where u.active and s.date between $1 and $2 and s.kind <> 'off' order by u.created_at", [gridStart, gridEnd]),
  ]);
  const evOn = (d: string) => events.filter((e) => e.date <= d && (e.end_date || e.date) >= d);
  const shOn = (d: string) => shifts.filter((s) => s.date === d);
  const editing = searchParams.edit ? events.find((e) => e.id === searchParams.edit) : undefined;
  const backUrl = `/app/calendar?m=${month}&d=${sel}`;

  return (
    <div>
      <PageHeader title={tr("Kalender", "Agenda")} sub={tr("Termine, Märkte, Schule und wer wann arbeitet", "Afspraken, markten, school en wie wanneer werkt")} />
      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <section className="card !p-3 sm:!p-4">
          <div className="mb-3 flex items-center justify-between">
            <Link className="btn-ghost btn-sm" href={`/app/calendar?m=${fmt(prev).slice(0, 7)}`}>←</Link>
            <div className="font-semibold capitalize">{monthName(first, user.lang)}</div>
            <div className="flex gap-1">
              <Link className="btn-ghost btn-sm" href="/app/calendar">{tr("Heute", "Vandaag")}</Link>
              <Link className="btn-ghost btn-sm" href={`/app/calendar?m=${fmt(next).slice(0, 7)}`}>→</Link>
            </div>
          </div>
          <div className="grid grid-cols-7 text-center text-[11px] font-medium uppercase text-stone-400">
            {days.slice(0, 7).map((d) => <div key={d} className="py-1">{dayName(d, user.lang)}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-sand-200 ring-1 ring-sand-200">
            {days.map((d) => {
              const inMonth = d.slice(0, 7) === month;
              const closed = weekday(d) === 7 || weekday(d) === 1;
              return (
                <Link key={d} href={`/app/calendar?m=${month}&d=${d}`} className={`min-h-[4.2rem] p-1 text-left sm:min-h-[6rem] ${d === sel ? "bg-brand-light" : closed ? "bg-sand-100" : "bg-white"} ${inMonth ? "" : "opacity-40"}`}>
                  <div className={`mb-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${d === now ? "bg-ink font-semibold text-white" : ""}`}>{Number(d.slice(8))}</div>
                  <div className="flex flex-wrap gap-0.5">
                    {shOn(d).map((s) => <span key={s.user_id} className="h-2 w-2 rounded-full" style={{ background: s.color, opacity: s.kind === "shop" ? 1 : 0.45 }} title={`${s.name} · ${lbl(user.lang, SHIFT_KIND[s.kind])}`} />)}
                  </div>
                  <div className="mt-0.5 space-y-0.5">
                    {evOn(d).slice(0, 3).map((e) => (
                      <div key={e.id} className={`truncate rounded px-1 text-[10px] leading-4 sm:text-[11px] ${EVENT_KIND[e.kind]?.color || "bg-stone-200"}`}>{e.title}</div>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-stone-500">{tr("Punkte = wer arbeitet (blass = Homeoffice/Schule). Tippe auf einen Tag.", "Stipjes = wie werkt (licht = thuiswerk/school). Tik op een dag.")}</p>
        </section>

        <aside className="space-y-4">
          <section className="card">
            <h2 className="mb-2 capitalize">{longDate(sel, user.lang)}</h2>
            <ul className="mb-3 space-y-1.5 text-sm">
              {shOn(sel).map((s) => (
                <li key={s.user_id} className="flex items-center gap-2"><Avatar name={s.name} color={s.color} size="h-6 w-6 text-[10px]" />{s.name}<Badge l={SHIFT_KIND[s.kind]} lang={user.lang} /><span className="ml-auto text-stone-500">{s.start_time ? `${hm(s.start_time)}–${hm(s.end_time)}` : ""}</span></li>
              ))}
            </ul>
            <ul className="space-y-2">
              {evOn(sel).map((e) => (
                <li key={e.id} className="rounded-lg bg-sand-100 p-2.5 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="font-medium">{e.title}</div>
                      <div className="text-xs text-stone-500">{e.start_time ? `${hm(e.start_time)}${e.end_time ? "–" + hm(e.end_time) : ""} · ` : ""}{lbl(user.lang, EVENT_KIND[e.kind])}</div>
                      {e.note && <div className="mt-1 whitespace-pre-wrap text-stone-600">{e.note}</div>}
                    </div>
                    {(user.role === "admin" || e.created_by === user.id) && <Link href={`${backUrl}&edit=${e.id}`} className="text-xs text-brand hover:underline">{tr("Ändern", "Wijzig")}</Link>}
                  </div>
                </li>
              ))}
              {!evOn(sel).length && <li className="text-sm text-stone-500">{tr("Keine Termine.", "Geen afspraken.")}</li>}
            </ul>
          </section>

          <section className="card">
            <h2 className="mb-3">{editing ? tr("Termin ändern", "Afspraak wijzigen") : tr("Neuer Termin", "Nieuwe afspraak")}</h2>
            <form action={saveEvent} className="space-y-3" key={editing?.id || `${sel}-${events.length}`}>
              <input type="hidden" name="id" value={editing?.id || ""} />
              <input type="hidden" name="back" value={backUrl} />
              <div><label className="label">{tr("Titel", "Titel")}</label><input name="title" className="input" defaultValue={editing?.title} required /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="label">{tr("Datum", "Datum")}</label><input type="date" name="date" className="input" defaultValue={editing?.date || sel} required /></div>
                <div><label className="label">{tr("bis (optional)", "t/m (optioneel)")}</label><input type="date" name="end_date" className="input" defaultValue={editing?.end_date || ""} /></div>
                <div><label className="label">{tr("von", "van")}</label><input type="time" name="start_time" className="input" defaultValue={hm(editing?.start_time)} /></div>
                <div><label className="label">{tr("bis", "tot")}</label><input type="time" name="end_time" className="input" defaultValue={hm(editing?.end_time)} /></div>
              </div>
              <div><label className="label">{tr("Art", "Soort")}</label>
                <select name="kind" className="input" defaultValue={editing?.kind || "event"}>{Object.entries(EVENT_KIND).map(([k, l]) => <option key={k} value={k}>{lbl(user.lang, l)}</option>)}</select>
              </div>
              <div><label className="label">{tr("Notiz", "Notitie")}</label><textarea name="note" className="input" rows={2} defaultValue={editing?.note || ""} /></div>
              <div className="flex gap-2"><Submit>{tr("Speichern", "Opslaan")}</Submit>{editing && <Link href={backUrl} className="btn-ghost">{tr("Abbrechen", "Annuleren")}</Link>}</div>
            </form>
            {editing && (
              <form action={deleteEvent} className="mt-3"><input type="hidden" name="id" value={editing.id} /><input type="hidden" name="back" value={backUrl} /><ConfirmSubmit confirm={tr("Wirklich löschen?", "Echt verwijderen?")}>{tr("Löschen", "Verwijderen")}</ConfirmSubmit></form>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
