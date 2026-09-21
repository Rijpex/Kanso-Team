import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { q, q1 } from "@/lib/server/db";
import { cleaningFor, MINE, tasksQuery, zoneOwners } from "@/lib/server/queries";
import { EVENT_KIND, SHIFT_KIND, T, lbl } from "@/lib/i18n";
import { addDays, dateTime, hm, longDate, monday, shortDate, today } from "@/lib/dates";
import { ConfirmSubmit } from "@/components/client";
import { addFocus, addQuote, countOnline, deleteFocus, toggleFocus } from "./actions";
import { Avatar, Badge } from "@/components/ui";
import { TaskCard } from "@/components/TaskCard";
import { CleaningList } from "@/components/CleaningList";

export default async function Today() {
  const user = await requireUser();
  const tr = T(user.lang);
  const d = today();
  const isAdmin = user.role === "admin";

  const week = monday(d);
  const [shifts, cleaning, myTasks, events, recent, onb, openQuestions, focus, journal, zones] = await Promise.all([
    q<{ user_id: string; name: string; color: string; kind: string; start_time: string; end_time: string; break_start: string; break_end: string; note: string | null }>(
      "select s.*, u.name, u.color from shifts s join users u on u.id = s.user_id where s.date = $1 and u.active order by u.created_at", [d]),
    cleaningFor(d),
    isAdmin ? tasksQuery("t.status in ('review','doing')") : tasksQuery(`t.status <> 'done' and ${MINE}`, [user.id]),
    q<{ id: string; title: string; date: string; end_date: string | null; start_time: string | null; kind: string }>(
      "select id, title, date, end_date, start_time, kind from events where coalesce(end_date, date) >= $1 and date <= $2 order by date, start_time nulls first limit 8", [d, addDays(d, 14)]),
    q<{ id: string; body: string; created_at: string; name: string; color: string; task_id: string | null; question_id: string | null; idea_id: string | null; ref: string }>(
      `select c.id, c.body, c.created_at, u.name, u.color, c.task_id, c.question_id, c.idea_id, coalesce(t.title, qu.title, i.name) as ref
         from comments c join users u on u.id = c.user_id
         left join tasks t on t.id = c.task_id left join questions qu on qu.id = c.question_id left join ideas i on i.id = c.idea_id
        where c.user_id <> $1 order by c.created_at desc limit 5`, [user.id]),
    isAdmin ? null : q1<{ done: number; total: number }>(
      "select (select count(*)::int from onboarding_checks where user_id = $1) as done, (select count(*)::int from onboarding_items) as total", [user.id]),
    isAdmin ? q<{ id: string; title: string; name: string }>("select qu.id, qu.title, u.name from questions qu left join users u on u.id = qu.user_id where qu.status = 'open' order by qu.created_at") : [],
    q<{ id: string; text: string; done_by: string | null; done_name: string | null }>("select f.id, f.text, f.done_by, u.name as done_name from focus f left join users u on u.id = f.done_by where f.week = $1 order by f.created_at", [week]),
    q<{ id: string; date: string; kind: string; text: string | null }>("select id, date, kind, text from journal where date = $1 or (kind = 'quote' and date > $2) order by created_at desc", [d, addDays(d, -7)]),
    zoneOwners(d),
  ]);
  const [plansToday, hasReflection] = await Promise.all([
    q<{ id: string; task_id: string; title: string; start_time: string | null; end_time: string | null; done: boolean; name: string; color: string; user_id: string }>(
      `select p.id, p.task_id, t.title, p.start_time, p.end_time, p.done, u.name, u.color, p.user_id from task_plans p join tasks t on t.id = p.task_id join users u on u.id = p.user_id
        where p.date = $1 ${isAdmin ? "" : "and p.user_id = $2"} order by p.start_time nulls last`, isAdmin ? [d] : [d, user.id]),
    isAdmin ? Promise.resolve(true) : q1("select 1 from reflections where user_id = $1 and week = $2", [user.id, week]).then(Boolean),
  ]);
  const wd = new Date(`${d}T12:00:00Z`).getUTCDay();
  const remindReflect = !isAdmin && !hasReflection && (wd === 5 || wd === 6);
  const onlineToday = journal.filter((j) => j.kind === "online" && j.date === d).length;
  const quotes = journal.filter((j) => j.kind === "quote").slice(0, 4);
  const mine = shifts.find((s) => s.user_id === user.id);
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Europe/Berlin" }).format(new Date()));
  const greet = hour < 11 ? tr("Guten Morgen", "Goedemorgen") : hour < 17 ? tr("Hallo", "Hoi") : tr("Guten Abend", "Goedenavond");

  return (
    <div className="space-y-5">
      <div>
        <p className="muted capitalize">{longDate(d, user.lang)}</p>
        <h1>{greet}, {user.name}</h1>
      </div>

      {!isAdmin && onb && onb.total > 0 && onb.done < onb.total && (
        <Link href="/app/onboarding" className="card block !bg-brand-light hover:ring-brand">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>{tr("Deine Einarbeitung", "Jouw inwerkplan")}</span>
            <span>{onb.done} / {onb.total}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-brand" style={{ width: `${(onb.done / onb.total) * 100}%` }} /></div>
        </Link>
      )}

      {remindReflect && (
        <Link href="/app/reflect" className="card block !bg-brand-light hover:ring-brand"><div className="text-sm font-medium">{tr("Fünf Minuten für deinen Wochenrückblick?", "Vijf minuten voor je weekboek?")}</div><div className="text-sm text-stone-600">{tr("Was hast du gelernt, was war gut, was war schwierig – nur Lea und Bas lesen mit.", "Wat heb je geleerd, wat ging goed, wat was lastig – alleen Lea en Bas lezen mee.")}</div></Link>
      )}

      {isAdmin && openQuestions.length > 0 && (
        <section className="card !bg-amber-50 !ring-amber-200">
          <h2 className="mb-2">{tr("Offene Fragen", "Open vragen")} ({openQuestions.length})</h2>
          <ul className="space-y-1 text-sm">
            {openQuestions.map((x) => <li key={x.id}><Link className="hover:underline" href={`/app/questions/${x.id}`}><b>{x.name}:</b> {x.title}</Link></li>)}
          </ul>
        </section>
      )}


      <section className="card">
        <div className="mb-2 flex items-center justify-between"><h2>{tr("Fokus dieser Woche", "Focus deze week")}</h2><span className="text-xs text-stone-400">max. 3</span></div>
        <ul className="space-y-1">
          {focus.map((f) => (
            <li key={f.id} className="flex items-center gap-2">
              <form action={toggleFocus} className="flex-1"><input type="hidden" name="id" value={f.id} />
                <button className="flex w-full items-center gap-3 py-1 text-left text-sm">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${f.done_by ? "border-emerald-600 bg-emerald-600 text-white" : "border-sand-400 bg-white"}`}>{f.done_by ? "✓" : ""}</span>
                  <span className={f.done_by ? "text-stone-400 line-through" : "font-medium"}>{f.text}</span>
                  {f.done_name && <span className="text-xs text-stone-400">{f.done_name}</span>}
                </button>
              </form>
              {isAdmin && <form action={deleteFocus}><input type="hidden" name="id" value={f.id} /><ConfirmSubmit className="px-1 text-stone-300 hover:text-red-600" confirm="?">×</ConfirmSubmit></form>}
            </li>
          ))}
          {!focus.length && <li className="text-sm text-stone-500">{isAdmin ? "Nog geen focus voor deze week. Zet er maximaal drie punten in." : tr("Noch kein Fokus eingetragen – kommt nach dem Check-in.", "Nog geen focus – komt na de check-in.")}</li>}
        </ul>
        {isAdmin && focus.length < 3 && (
          <form action={addFocus} className="mt-2 flex gap-2" key={focus.length}><input type="hidden" name="week" value={week} /><input name="text" className="input" placeholder="Fokuspunkt (auf Deutsch, für die Praktikantinnen)" required /><button className="btn-ghost">+</button></form>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card">
          <div className="mb-3 flex items-center justify-between"><h2>{tr("Wer arbeitet heute", "Wie werkt vandaag")}</h2><Link href="/app/calendar" className="text-sm text-brand hover:underline">{tr("Agenda", "Agenda")} →</Link></div>
          {!isAdmin && (
            <div className="mb-3 rounded-xl bg-sand-100 p-3 text-sm">
              {mine && (mine.kind === "shop" || mine.kind === "home") ? (
                <>
                  <div className="font-medium">{tr("Deine Schicht", "Jouw dienst")}: {hm(mine.start_time)}–{hm(mine.end_time)} · {lbl(user.lang, SHIFT_KIND[mine.kind])}</div>
                  {mine.break_start && <div className="text-stone-600">{tr("Pause", "Pauze")}: {hm(mine.break_start)}–{hm(mine.break_end)}</div>}
                  {mine.note && <div className="text-stone-600">{mine.note}</div>}
                </>
              ) : mine ? (
                <div className="font-medium">{tr("Heute", "Vandaag")}: {lbl(user.lang, SHIFT_KIND[mine.kind])}</div>
              ) : (
                <div className="text-stone-500">{tr("Für heute ist keine Schicht eingetragen.", "Voor vandaag staat er geen dienst.")}</div>
              )}
            </div>
          )}
          <ul className="space-y-2 text-sm">
            {shifts.filter((s) => s.kind !== "off").map((s) => (
              <li key={s.user_id} className="flex items-center gap-2">
                <Avatar name={s.name} color={s.color} /> <span className="font-medium">{s.name}</span>
                <Badge l={SHIFT_KIND[s.kind]} lang={user.lang} />
                <span className="ml-auto text-stone-500">{s.start_time ? `${hm(s.start_time)}–${hm(s.end_time)}` : ""}{s.break_start ? ` · ${tr("Pause", "pauze")} ${hm(s.break_start)}` : ""}</span>
              </li>
            ))}
            {!shifts.filter((s) => s.kind !== "off").length && <li className="text-stone-500">{tr("Niemand eingetragen.", "Niemand ingepland.")}</li>}
          </ul>
        </section>

        <section className="card">
          <div className="mb-3 flex items-center justify-between"><h2>{tr("Termine", "Agenda")}</h2><Link href="/app/calendar" className="text-sm text-brand hover:underline">{tr("Kalender", "Agenda")} →</Link></div>
          <ul className="space-y-2 text-sm">
            {events.map((e) => (
              <li key={e.id} className="flex items-center gap-2">
                <span className="w-24 shrink-0 text-stone-500">{e.date <= d ? tr("Heute", "Vandaag") : shortDate(e.date, user.lang)}</span>
                <span className="flex-1 font-medium">{e.title}</span>
                {e.start_time && <span className="text-stone-500">{hm(e.start_time)}</span>}
                <Badge l={EVENT_KIND[e.kind]} lang={user.lang} />
              </li>
            ))}
            {!events.length && <li className="text-stone-500">{tr("Keine Termine in den nächsten 2 Wochen.", "Geen afspraken de komende 2 weken.")}</li>}
          </ul>
        </section>

        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2>{isAdmin ? tr("In Arbeit & zur Kontrolle", "Bezig & ter controle") : tr("Deine Aufgaben", "Jouw opdrachten")}</h2>
            <Link href="/app/tasks" className="text-sm text-brand hover:underline">{tr("Alle", "Alle")} →</Link>
          </div>
          {plansToday.length > 0 && (
            <div className="mb-3 rounded-xl bg-sand-100 p-3">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500">{tr("Heute eingeplant", "Vandaag ingepland")}</div>
              <ul className="space-y-1 text-sm">{plansToday.map((p) => <li key={p.id}><Link href={`/app/calendar?d=${d}`} className={`flex items-center gap-2 hover:underline ${p.done ? "text-stone-400 line-through" : ""}`}><span className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.color }} />{p.start_time ? `${hm(p.start_time)}${p.end_time ? "–" + hm(p.end_time) : ""} · ` : ""}{isAdmin ? `${p.name}: ` : ""}{p.title}</Link></li>)}</ul>
            </div>
          )}
          <div className="space-y-2">
            {myTasks.slice(0, 6).map((t) => <TaskCard key={t.id} t={t} lang={user.lang} showStatus />)}
            {!myTasks.length && <p className="text-sm text-stone-500">{tr("Nichts offen – super!", "Niets open – top!")}</p>}
          </div>
        </section>

        <section className="card">
          <div className="mb-3 flex items-center justify-between"><h2><Link href="/app/cleaning" className="hover:underline">{tr("Storepflege heute", "Winkelverzorging vandaag")}</Link></h2><span className="text-sm text-stone-500">{cleaning.filter((c) => c.done_by).length}/{cleaning.length}</span></div>
          {cleaning.length ? <CleaningList rows={cleaning} date={d} lang={user.lang} zones={zones} /> : <p className="text-sm text-stone-500">{tr("Heute ist der Laden geschlossen.", "Vandaag is de winkel dicht.")}</p>}
        </section>
      </div>


      <section className="card">
        <div className="mb-3 flex items-center justify-between"><h2>{tr("Heute im Laden", "Vandaag in de winkel")}</h2><Link href="/app/journal" className="text-sm text-brand hover:underline">{tr("Kundenstimmen", "Klantstemmen")} →</Link></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-sm font-medium">{tr("Online-Anfragen heute", "Online-aanvragen vandaag")}</div>
            <p className="text-xs text-stone-500">{tr("„Kann ich das online bestellen?“ – jede zählt.", "\"Kan ik dat online bestellen?\" – elke telt.")}</p>
            <form action={countOnline} className="mt-2 flex items-center gap-3"><input type="hidden" name="date" value={d} /><span className="text-3xl font-semibold tabular-nums">{onlineToday}</span><button className="btn-ghost">+1</button></form>
          </div>
          <div>
            <div className="text-sm font-medium">{tr("Kundensatz des Tages", "Klantzin van de dag")}</div>
            <p className="text-xs text-stone-500">{tr("Was hat jemand heute gesagt, das hängen blieb?", "Wat zei iemand vandaag dat bleef hangen?")}</p>
            <form action={addQuote} className="mt-2 flex gap-2" key={quotes.length}><input type="hidden" name="date" value={d} /><input name="text" className="input" placeholder="„…“" required /><button className="btn-ghost">{tr("Merken", "Bewaar")}</button></form>
            <ul className="mt-2 space-y-1 text-sm text-stone-600">{quotes.map((x) => <li key={x.id}>„{x.text}“ <span className="text-xs text-stone-400">{x.date === d ? tr("heute", "vandaag") : shortDate(x.date, user.lang)}</span></li>)}</ul>
          </div>
        </div>
      </section>

      {recent.length > 0 && (
        <section className="card">
          <h2 className="mb-3">{tr("Neueste Kommentare", "Laatste reacties")}</h2>
          <ul className="space-y-3 text-sm">
            {recent.map((c) => (
              <li key={c.id}>
                <Link href={c.task_id ? `/app/tasks/${c.task_id}` : c.idea_id ? `/app/ideas/${c.idea_id}` : `/app/questions/${c.question_id}`} className="flex gap-2 hover:opacity-80">
                  <Avatar name={c.name} color={c.color} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-stone-500">{c.name} · {c.ref} · {dateTime(c.created_at, user.lang)}</span>
                    <span className="line-clamp-2">{c.body}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
