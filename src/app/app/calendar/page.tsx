import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { cleaningFor, MINE, tasksQuery, team, zoneOwners } from "@/lib/server/queries";
import { EVENT_KIND, SHIFT_KIND, T, lbl } from "@/lib/i18n";
import { addDays, dayName, fmt, hm, isoWeek, longDate, monday, monthName, parse, today, weekday } from "@/lib/dates";
import { Avatar, PageHeader } from "@/components/ui";
import { shiftForRole } from "@/lib/hours";
import { ConfirmSubmit, Submit } from "@/components/client";
import { CleaningList } from "@/components/CleaningList";
import { deleteEvent, deletePlan, saveEvent, savePlan, saveShift, togglePlan } from "../actions";

type Ev = { id: string; title: string; note: string | null; date: string; end_date: string | null; start_time: string | null; end_time: string | null; kind: string; created_by: string | null };
type Sh = { user_id: string; date: string; kind: string; start_time: string | null; end_time: string | null; break_start: string | null; break_end: string | null; break2_start: string | null; break2_end: string | null; note: string | null; name: string; color: string };
type Plan = { id: string; task_id: string; user_id: string; date: string; start_time: string | null; end_time: string | null; note: string | null; done: boolean; title: string; name: string; color: string };

const isD = (v?: string) => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

export default async function Calendar({ searchParams }: { searchParams: { view?: string; m?: string; d?: string; edit?: string; shift?: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const isAdmin = user.role === "admin";
  const now = today();
  const view = searchParams.view === "month" ? "month" : "week";
  const monthParam = /^\d{4}-\d{2}$/.test(searchParams.m || "") ? searchParams.m! : "";
  const sel = isD(searchParams.d) ? searchParams.d! : view === "month" && monthParam && monthParam !== now.slice(0, 7) ? `${monthParam}-01` : now;

  // Bereik bepalen
  let start: string, end: string, month = "";
  if (view === "month") {
    month = monthParam || sel.slice(0, 7);
    const first = `${month}-01`;
    const nx = parse(first); nx.setUTCMonth(nx.getUTCMonth() + 1);
    start = monday(first);
    end = addDays(monday(addDays(fmt(nx), -1)), 6);
  } else {
    start = monday(sel);
    end = addDays(start, 6);
  }
  const days: string[] = [];
  for (let x = start; x <= end; x = addDays(x, 1)) days.push(x);

  const [events, shifts, plans, users, cleaning, zones, myTasks, cleanProgress] = await Promise.all([
    q<Ev>("select * from events where date <= $2 and coalesce(end_date, date) >= $1 order by start_time nulls first, created_at", [start, end]),
    q<Sh>("select s.*, u.name, u.color from shifts s join users u on u.id = s.user_id where u.active and s.date between $1 and $2 order by u.role, u.created_at", [start, end]),
    q<Plan>("select p.*, t.title, u.name, u.color from task_plans p join tasks t on t.id = p.task_id join users u on u.id = p.user_id where p.date between $1 and $2 order by p.start_time nulls last, p.created_at", [start, end]),
    team(),
    cleaningFor(sel),
    zoneOwners(sel),
    isAdmin ? tasksQuery("t.status <> 'done'") : tasksQuery(`t.status <> 'done' and ${MINE}`, [user.id]),
    q<{ date: string; n: number }>("select date, count(*)::int as n from cleaning_checks where date between $1 and $2 group by date", [start, end]),
  ]);
  const evOn = (d: string) => events.filter((e) => e.date <= d && (e.end_date || e.date) >= d);
  const shOn = (d: string) => shifts.filter((s) => s.date === d && s.kind !== "off");
  const plOn = (d: string) => plans.filter((p) => p.date === d);
  const mineOn = (d: string) => shifts.find((s) => s.date === d && s.user_id === user.id && s.kind !== "off");
  const editing = searchParams.edit ? events.find((e) => e.id === searchParams.edit) : undefined;
  const base = view === "month" ? `/app/calendar?view=month&m=${month}` : `/app/calendar?d=${sel}`;
  const backUrl = view === "month" ? `${base}&d=${sel}` : base;
  const dayUrl = (d: string) => (view === "month" ? `/app/calendar?view=month&m=${month}&d=${d}` : `/app/calendar?d=${d}`);
  // Zondag is dicht, tenzij er een verkaufsoffener Sonntag in de agenda staat
  const openSun = (d: string) => weekday(d) === 7 && evOn(d).some((e) => e.kind === "shop");
  const closed = (d: string) => (weekday(d) === 7 && !openSun(d)) || weekday(d) === 1;
  const weekDays = view === "week" ? days.filter((d, i) => i < 6 || openSun(d)) : days;
  const shiftUser = isAdmin && searchParams.shift ? users.find((u) => u.id === searchParams.shift) : undefined;
  const shiftOfSel = (uid: string) => shifts.find((s) => s.date === sel && s.user_id === uid);

  const ShiftPill = ({ s, compact = false }: { s: Sh; compact?: boolean }) => {
    const me = s.user_id === user.id;
    const solid = s.kind === "shop";
    return (
      <div className={`rounded-md px-1.5 py-1 text-[11px] leading-tight ${me ? "ring-2" : ""}`} style={{ background: `${s.color}${solid ? "2b" : "14"}`, borderLeft: `3px ${solid ? "solid" : "dashed"} ${s.color}`, ["--tw-ring-color" as any]: s.color }}>
        <span className="font-semibold" style={{ color: s.color }}>{s.name}{me ? ` · ${tr("du", "jij")}` : ""}</span>
        {!compact && s.kind !== "shop" && <span className="text-stone-600"> · {lbl(user.lang, SHIFT_KIND[s.kind])}</span>}
        {s.start_time && <span className="block text-stone-700">{hm(s.start_time)}–{hm(s.end_time)}</span>}
        {!compact && s.break_start && <span className="block text-stone-500">{tr("Pause", "Pauze")} {hm(s.break_start)}–{hm(s.break_end)}{s.break2_start && <> · {hm(s.break2_start)}–{hm(s.break2_end)}</>}</span>}
        {compact && s.kind !== "shop" && <span className="block text-stone-500">{lbl(user.lang, SHIFT_KIND[s.kind])}</span>}
      </div>
    );
  };

  const prevUrl = view === "month" ? (() => { const p = parse(`${month}-01`); p.setUTCMonth(p.getUTCMonth() - 1); return `/app/calendar?view=month&m=${fmt(p).slice(0, 7)}`; })() : `/app/calendar?d=${addDays(start, -7)}`;
  const nextUrl = view === "month" ? (() => { const p = parse(`${month}-01`); p.setUTCMonth(p.getUTCMonth() + 1); return `/app/calendar?view=month&m=${fmt(p).slice(0, 7)}`; })() : `/app/calendar?d=${addDays(start, 7)}`;
  const tab = (active: boolean) => `btn btn-sm ${active ? "bg-ink text-white" : "bg-white text-stone-600 ring-1 ring-sand-300"}`;

  return (
    <div>
      <PageHeader title={tr("Agenda", "Agenda")} sub={tr("Wer arbeitet wann, Termine, eingeplante Aufgaben und Storepflege – alles an einem Ort.", "Wie werkt wanneer, afspraken, ingeplande opdrachten en winkelverzorging – alles op één plek.")}>
        <Link href={`/app/calendar?d=${sel}`} className={tab(view === "week")}>{tr("Woche", "Week")}</Link>
        <Link href={`/app/calendar?view=month&d=${sel}`} className={tab(view === "month")}>{tr("Monat", "Maand")}</Link>
        {isAdmin && <Link href={`/app/roster?w=${monday(sel)}`} className="btn-ghost btn-sm">{tr("Dienstplan füllen", "Rooster vullen")}</Link>}
      </PageHeader>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Link className="btn-ghost btn-sm" href={prevUrl}>←</Link>
        <div className="min-w-[11rem] text-center font-semibold capitalize">{view === "month" ? monthName(`${month}-01`, user.lang) : `${tr("KW", "Week")} ${isoWeek(start)} · ${Number(start.slice(8))}.–${Number(weekDays[weekDays.length - 1].slice(8))}. ${monthName(weekDays[weekDays.length - 1], user.lang)}`}</div>
        <Link className="btn-ghost btn-sm" href={nextUrl}>→</Link>
        <Link className="btn-ghost btn-sm" href={view === "month" ? "/app/calendar?view=month" : "/app/calendar"}>{tr("Heute", "Vandaag")}</Link>
        <div className="ml-auto flex flex-wrap items-center gap-2 text-xs text-stone-600">
          {users.map((u) => <span key={u.id} className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm" style={{ background: `${u.color}55`, borderLeft: `3px solid ${u.color}` }} />{u.name}</span>)}
        </div>
      </div>

      {view === "week" ? (
        <div className={`grid gap-2 md:grid-cols-3 ${weekDays.length > 6 ? "xl:grid-cols-7" : "xl:grid-cols-6"}`}>
          {weekDays.map((d) => {
            const cp = cleanProgress.find((c) => c.date === d)?.n || 0;
            const mine = mineOn(d);
            return (
              <Link key={d} href={dayUrl(d)} scroll={false} className={`block rounded-2xl p-2.5 ring-1 transition ${d === sel ? "bg-white ring-2 ring-ink" : closed(d) ? "bg-sand-100 ring-sand-200" : "bg-white ring-sand-200 hover:ring-brand"}`} style={mine && !isAdmin ? { boxShadow: `inset 0 3px 0 ${user.color}` } : undefined}>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className={`text-sm font-semibold capitalize ${d === now ? "rounded-md bg-ink px-1.5 text-white" : ""}`}>{dayName(d, user.lang)} {Number(d.slice(8))}.</span>
                  {closed(d) && <span className="text-[10px] uppercase tracking-wide text-stone-400">{tr("Laden zu", "winkel dicht")}</span>}
                </div>
                <div className="space-y-1">
                  {shOn(d).map((s) => <ShiftPill key={s.user_id} s={s} />)}
                  {!shOn(d).length && !closed(d) && <div className="rounded-md border border-dashed border-sand-300 px-1.5 py-1 text-[11px] text-stone-400">{tr("niemand eingeplant", "niemand ingepland")}</div>}
                </div>
                {evOn(d).length > 0 && (
                  <div className="mt-2 space-y-1">
                    {evOn(d).map((e) => <div key={e.id} className={`rounded-md px-1.5 py-1 text-[11px] leading-tight ${EVENT_KIND[e.kind]?.color || "bg-stone-200"}`}><span className="font-semibold">{e.start_time ? `${hm(e.start_time)} ` : ""}</span>{e.title}</div>)}
                  </div>
                )}
                {plOn(d).length > 0 && (
                  <div className="mt-2 space-y-1">
                    {plOn(d).map((p) => <div key={p.id} className={`flex items-start gap-1 rounded-md bg-sand-100 px-1.5 py-1 text-[11px] leading-tight ${p.done ? "text-stone-400 line-through" : ""}`}><span className="mt-0.5 h-2 w-2 shrink-0 rounded-full" style={{ background: p.color }} /><span>{p.start_time ? `${hm(p.start_time)} ` : ""}{p.title}</span></div>)}
                  </div>
                )}
                {!closed(d) && <div className="mt-2 text-[10px] text-stone-400">{tr("Storepflege", "Winkelverzorging")} {cp > 0 ? `· ${cp} ✓` : ""}</div>}
              </Link>
            );
          })}
        </div>
      ) : (
        <section className="card !p-2 sm:!p-3">
          <div className="grid grid-cols-7 text-center text-[11px] font-medium uppercase text-stone-400">{days.slice(0, 7).map((d) => <div key={d} className="py-1">{dayName(d, user.lang)}</div>)}</div>
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-sand-200 ring-1 ring-sand-200">
            {days.map((d) => {
              const inMonth = d.slice(0, 7) === month;
              const mine = mineOn(d);
              return (
                <Link key={d} href={dayUrl(d)} scroll={false} className={`min-h-[4.5rem] p-1 sm:min-h-[6.5rem] ${d === sel ? "outline outline-2 -outline-offset-2 outline-ink" : ""} ${closed(d) ? "bg-sand-100" : "bg-white"} ${inMonth ? "" : "opacity-40"}`} style={mine && !isAdmin ? { background: `${user.color}14` } : undefined}>
                  <div className={`mb-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${d === now ? "bg-ink font-semibold text-white" : ""}`}>{Number(d.slice(8))}</div>
                  <div className="hidden space-y-0.5 sm:block">{shOn(d).map((s) => <ShiftPill key={s.user_id} s={s} compact />)}</div>
                  <div className="flex flex-wrap gap-0.5 sm:hidden">{shOn(d).map((s) => <span key={s.user_id} className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color, opacity: s.kind === "shop" ? 1 : 0.4 }} />)}</div>
                  <div className="mt-0.5 space-y-0.5">{evOn(d).slice(0, 2).map((e) => <div key={e.id} className={`truncate rounded px-1 text-[10px] leading-4 ${EVENT_KIND[e.kind]?.color || "bg-stone-200"}`}>{e.title}</div>)}</div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Gekozen dag ── */}
      <h2 className="mb-3 mt-7 capitalize">{longDate(sel, user.lang)}{sel === now ? ` · ${tr("heute", "vandaag")}` : ""}</h2>
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-400">{tr("Wer arbeitet", "Wie werkt")}</h3>
          <ul className="space-y-2 text-sm">
            {users.filter((u) => isAdmin || shiftOfSel(u.id)).map((u) => {
              const s = shiftOfSel(u.id);
              return (
                <li key={u.id} className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <Avatar name={u.name} color={u.color} size="h-6 w-6 text-[10px]" />
                  <span className="font-medium">{u.name}</span>
                  <span className="whitespace-nowrap text-stone-600">{s ? `${lbl(user.lang, SHIFT_KIND[s.kind])}${s.start_time ? ` ${hm(s.start_time)}–${hm(s.end_time)}` : ""}` : "–"}</span>
                  {s?.break_start && <span className="text-xs text-stone-400">{tr("Pause", "pauze")} {hm(s.break_start)}{s.break2_start ? ` + ${hm(s.break2_start)}` : ""}</span>}
                  {isAdmin && <Link href={`${backUrl}&shift=${u.id}`} scroll={false} className="ml-auto text-xs text-brand hover:underline">{tr("Ändern", "Wijzig")}</Link>}
                </li>
              );
            })}
            {!isAdmin && !shifts.some((s) => s.date === sel) && <li className="text-stone-500">{tr("Niemand eingetragen.", "Niemand ingepland.")}</li>}
          </ul>
          {shiftUser && (
            <form action={saveShift} className="mt-3 space-y-2 rounded-xl bg-sand-100 p-3" key={`${shiftUser.id}${sel}`}>
              <input type="hidden" name="user_id" value={shiftUser.id} /><input type="hidden" name="date" value={sel} /><input type="hidden" name="back" value={backUrl} />
              <div className="text-sm font-semibold">{shiftUser.name}</div>
              <select name="kind" className="input" defaultValue={shiftOfSel(shiftUser.id)?.kind || "shop"}>
                {Object.entries(SHIFT_KIND).map(([k, l]) => <option key={k} value={k}>{lbl(user.lang, l)}</option>)}<option value="none">{tr("– Eintrag entfernen –", "– Invoer verwijderen –")}</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="label">{tr("von", "van")}</label><input type="time" name="start_time" className="input" defaultValue={hm(shiftOfSel(shiftUser.id)?.start_time) || shiftForRole(weekday(sel), shiftUser.role)?.start || "10:00"} /></div>
                <div><label className="label">{tr("bis", "tot")}</label><input type="time" name="end_time" className="input" defaultValue={hm(shiftOfSel(shiftUser.id)?.end_time) || shiftForRole(weekday(sel), shiftUser.role)?.end || "18:30"} /></div>
                <div><label className="label">{tr("Pause von", "pauze van")}</label><input type="time" name="break_start" className="input" defaultValue={hm(shiftOfSel(shiftUser.id)?.break_start)} /></div>
                <div><label className="label">{tr("Pause bis", "pauze tot")}</label><input type="time" name="break_end" className="input" defaultValue={hm(shiftOfSel(shiftUser.id)?.break_end)} /></div>
                <div><label className="label">{tr("2. Pause von", "2e pauze van")}</label><input type="time" name="break2_start" className="input" defaultValue={hm(shiftOfSel(shiftUser.id)?.break2_start)} /></div>
                <div><label className="label">{tr("2. Pause bis", "2e pauze tot")}</label><input type="time" name="break2_end" className="input" defaultValue={hm(shiftOfSel(shiftUser.id)?.break2_end)} /></div>
              </div>
              <input name="note" className="input" placeholder={tr("Notiz", "Notitie")} defaultValue={shiftOfSel(shiftUser.id)?.note || ""} />
              <div className="flex gap-2"><Submit>{tr("Speichern", "Opslaan")}</Submit><Link href={backUrl} scroll={false} className="btn-ghost">{tr("Abbrechen", "Annuleren")}</Link></div>
            </form>
          )}

          <h3 className="mb-2 mt-5 text-sm font-semibold uppercase tracking-wide text-stone-400">{tr("Termine", "Afspraken")}</h3>
          <ul className="space-y-2">
            {evOn(sel).map((e) => (
              <li key={e.id} className={`rounded-lg p-2.5 text-sm ${EVENT_KIND[e.kind]?.color || "bg-sand-100"}`}>
                <div className="flex items-start gap-2">
                  <div className="flex-1"><div className="font-medium">{e.title}</div><div className="text-xs opacity-80">{e.start_time ? `${hm(e.start_time)}${e.end_time ? "–" + hm(e.end_time) : ""} · ` : ""}{lbl(user.lang, EVENT_KIND[e.kind])}</div>{e.note && <div className="mt-1 whitespace-pre-wrap">{e.note}</div>}</div>
                  {(isAdmin || e.created_by === user.id) && <Link href={`${backUrl}&edit=${e.id}`} scroll={false} className="text-xs underline">{tr("Ändern", "Wijzig")}</Link>}
                </div>
              </li>
            ))}
            {!evOn(sel).length && <li className="text-sm text-stone-500">{tr("Keine Termine.", "Geen afspraken.")}</li>}
          </ul>
          <details className="mt-3" open={!!editing}>
            <summary className="cursor-pointer text-sm font-medium text-brand">{editing ? tr("Termin ändern", "Afspraak wijzigen") : `+ ${tr("Termin eintragen", "Afspraak toevoegen")}`}</summary>
            <form action={saveEvent} className="mt-2 space-y-2" key={editing?.id || `${sel}-${events.length}`}>
              <input type="hidden" name="id" value={editing?.id || ""} /><input type="hidden" name="back" value={backUrl} />
              <input name="title" className="input" placeholder={tr("Titel", "Titel")} defaultValue={editing?.title} required />
              <div className="grid grid-cols-2 gap-2">
                <div><label className="label">{tr("Datum", "Datum")}</label><input type="date" name="date" className="input" defaultValue={editing?.date || sel} required /></div>
                <div><label className="label">{tr("bis (optional)", "t/m (optioneel)")}</label><input type="date" name="end_date" className="input" defaultValue={editing?.end_date || ""} /></div>
                <div><label className="label">{tr("von", "van")}</label><input type="time" name="start_time" className="input" defaultValue={hm(editing?.start_time)} /></div>
                <div><label className="label">{tr("bis", "tot")}</label><input type="time" name="end_time" className="input" defaultValue={hm(editing?.end_time)} /></div>
              </div>
              <select name="kind" className="input" defaultValue={editing?.kind || "event"}>{Object.entries(EVENT_KIND).map(([k, l]) => <option key={k} value={k}>{lbl(user.lang, l)}</option>)}</select>
              <textarea name="note" className="input" rows={2} placeholder={tr("Notiz", "Notitie")} defaultValue={editing?.note || ""} />
              <div className="flex gap-2"><Submit>{tr("Speichern", "Opslaan")}</Submit>{editing && <Link href={backUrl} scroll={false} className="btn-ghost">{tr("Abbrechen", "Annuleren")}</Link>}</div>
            </form>
            {editing && <form action={deleteEvent} className="mt-2"><input type="hidden" name="id" value={editing.id} /><input type="hidden" name="back" value={backUrl} /><ConfirmSubmit confirm={tr("Wirklich löschen?", "Echt verwijderen?")}>{tr("Löschen", "Verwijderen")}</ConfirmSubmit></form>}
          </details>
        </section>

        <section className="card">
          <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-stone-400">{tr("Woran wird gearbeitet", "Waar wordt aan gewerkt")}</h3>
          <p className="mb-2 text-xs text-stone-500">{tr("Plane ein, wann du an welcher Aufgabe sitzt – und hak ab, wenn der Block geschafft ist.", "Plan in wanneer je aan welke opdracht werkt – en vink af als het blok klaar is.")}</p>
          <ul className="divide-y divide-sand-200">
            {plOn(sel).map((p) => (
              <li key={p.id} className="flex items-start gap-2 py-2">
                <form action={togglePlan} className="flex-1"><input type="hidden" name="id" value={p.id} />
                  <button className="flex w-full items-start gap-3 text-left text-sm" disabled={!isAdmin && p.user_id !== user.id}>
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${p.done ? "border-emerald-600 bg-emerald-600 text-white" : "border-sand-400 bg-white"}`}>{p.done ? "✓" : ""}</span>
                    <span><span className={`block font-medium ${p.done ? "text-stone-400 line-through" : ""}`}>{p.title}</span><span className="text-xs text-stone-500"><span style={{ color: p.color }} className="font-semibold">{p.name}</span>{p.start_time ? ` · ${hm(p.start_time)}${p.end_time ? "–" + hm(p.end_time) : ""}` : ""}{p.note ? ` · ${p.note}` : ""}</span></span>
                  </button>
                </form>
                <Link href={`/app/tasks/${p.task_id}`} className="pt-0.5 text-xs text-brand hover:underline">{tr("öffnen", "open")}</Link>
                {(isAdmin || p.user_id === user.id) && <form action={deletePlan}><input type="hidden" name="id" value={p.id} /><button className="px-1 text-stone-300 hover:text-red-600" aria-label="x">×</button></form>}
              </li>
            ))}
            {!plOn(sel).length && <li className="py-2 text-sm text-stone-500">{tr("Noch nichts eingeplant.", "Nog niets ingepland.")}</li>}
          </ul>
          <form action={savePlan} className="mt-3 space-y-2 rounded-xl bg-sand-100 p-3" key={`${sel}-${plans.length}`}>
            <input type="hidden" name="date" value={sel} /><input type="hidden" name="back" value={backUrl} />
            <select name="task_id" className="input" required defaultValue=""><option value="" disabled>{tr("Aufgabe wählen …", "Opdracht kiezen …")}</option>{myTasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select>
            <div className="grid grid-cols-2 gap-2"><input type="time" name="start_time" className="input" aria-label="von" /><input type="time" name="end_time" className="input" aria-label="bis" /></div>
            {isAdmin && <select name="user_id" className="input" defaultValue=""><option value="">{tr("Für mich", "Voor mezelf")}</option>{users.filter((u) => u.id !== user.id).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>}
            <input name="note" className="input" placeholder={tr("Was genau? (optional)", "Wat precies? (optioneel)")} />
            <Submit className="btn-ghost">{tr("Einplanen", "Inplannen")}</Submit>
          </form>
        </section>

        <section className="card">
          <div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-semibold uppercase tracking-wide text-stone-400">{tr("Storepflege", "Winkelverzorging")}</h3><span className="text-sm text-stone-500">{cleaning.filter((c) => c.done_by).length}/{cleaning.length}</span></div>
          {cleaning.length ? <CleaningList rows={cleaning} date={sel} lang={user.lang} zones={zones} /> : <p className="text-sm text-stone-500">{tr("Laden geschlossen.", "Winkel gesloten.")}</p>}
        </section>
      </div>
    </div>
  );
}
