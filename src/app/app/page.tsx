import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { q, q1 } from "@/lib/server/db";
import { cleaningFor, internHours, MINE, tasksQuery, zoneOwners } from "@/lib/server/queries";
import { EVENT_KIND, REQUEST_KIND, SHIFT_KIND, T, lbl, pick } from "@/lib/i18n";
import { addDays, dateTime, hm, longDate, monday, shortDate, today, weekday } from "@/lib/dates";
import { OPENING } from "@/lib/hours";
import { ConfirmSubmit } from "@/components/client";
import { addFocus, countOnline, deleteFocus, saveCustomerRequest, toggleFocus } from "./actions";
import { Avatar, Badge } from "@/components/ui";
import { TaskCard } from "@/components/TaskCard";
import { HoursCard } from "@/components/Hours";
import { DayChecklist, type PlanRow } from "@/components/DayChecklist";

/** Kleine attentieregel bovenaan: kleur, tekst, link. */
function Alert({ href, tone, children }: { href: string; tone: "amber" | "brand" | "rose"; children: React.ReactNode }) {
  const c = tone === "amber" ? "bg-amber-50 ring-amber-200" : tone === "rose" ? "bg-rose-50 ring-rose-200" : "bg-brand-light ring-brand/30";
  return <Link href={href} className={`block rounded-2xl p-3 text-sm ring-1 hover:opacity-90 ${c}`}>{children}</Link>;
}

export default async function Today() {
  const user = await requireUser();
  const tr = T(user.lang);
  const d = today();
  const isAdmin = user.role === "admin";

  const week = monday(d);
  const tomorrow = addDays(d, 1);
  const [shifts, cleaning, myTasks, events, recent, onb, openQuestions, focus, journal, zones] = await Promise.all([
    q<{ user_id: string; name: string; color: string; kind: string; start_time: string; end_time: string; break_start: string; break_end: string; break2_start: string | null; break2_end: string | null; note: string | null }>(
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
    q<{ id: string; date: string; kind: string; text: string | null }>("select id, date, kind, text from (select id, date, 'online' as kind, null::text as text, created_at from journal where kind = 'online' and date = $1 union all select id, date, kind, text, created_at from customer_requests where date > $2) x order by created_at desc", [d, addDays(d, -7)]),
    zoneOwners(d),
  ]);
  const [plansToday, hasReflection, dailyChecks, storyWeek, hours, tomorrowShifts, openActions, absenceReq, waiting, tip] = await Promise.all([
    q<PlanRow>(
      `select p.id, p.task_id, t.title, p.start_time, p.end_time, p.done, u.name, u.color, p.user_id from task_plans p join tasks t on t.id = p.task_id join users u on u.id = p.user_id
        where p.date = $1 ${isAdmin ? "" : "and p.user_id = $2"} order by p.start_time nulls last`, isAdmin ? [d] : [d, user.id]),
    isAdmin ? Promise.resolve(true) : q1("select 1 from reflections where user_id = $1 and week = $2", [user.id, week]).then(Boolean),
    q<{ key: string; name: string | null }>("select c.key, u.name from daily_checks c left join users u on u.id = c.user_id where c.date = $1", [d]),
    q1<{ n: number }>("select count(*)::int as n from content_items where kind = 'story' and status = 'posted' and date between $1 and $2", [week, addDays(week, 6)]),
    internHours(d),
    q<{ name: string; color: string; kind: string; start_time: string | null; end_time: string | null }>(
      "select u.name, u.color, s.kind, s.start_time, s.end_time from shifts s join users u on u.id = s.user_id where s.date = $1 and u.active and s.kind <> 'off' order by u.created_at", [tomorrow]),
    q<{ id: string; text: string; kind: string; product: string | null; action_note: string | null }>(
      "select id, text, kind, product, action_note from customer_requests where status = 'open' and action_needed order by created_at limit 5"),
    isAdmin ? q<{ id: string; name: string; date: string }>("select a.id, u.name, a.date::text as date from absences a join users u on u.id = a.user_id where a.status = 'requested' order by a.date") : [],
    q<{ id: string; title: string; status: string; name: string | null }>(
      `select c.id, c.title, c.status, u.name from content_items c left join users u on u.id = c.owner_id
        where c.status = 'edited' ${isAdmin ? "" : "and c.owner_id = $1"} order by c.date nulls last limit 4`, isAdmin ? [] : [user.id]),
    q<{ slug: string; title_de: string; title_nl: string | null }>("select slug, title_de, title_nl from kb_pages order by category, position, slug"),
  ]);
  const shopClosed = weekday(d) === 1 || weekday(d) === 7;
  const wd = new Date(`${d}T12:00:00Z`).getUTCDay();
  const remindReflect = !isAdmin && !hasReflection && (wd === 5 || wd === 6);
  const onlineToday = journal.filter((j) => j.kind === "online" && j.date === d).length;
  const quotes = journal.filter((j) => j.kind !== "online").slice(0, 4);
  const mine = shifts.find((s) => s.user_id === user.id);
  const working = shifts.filter((s) => s.kind !== "off");
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Europe/Berlin" }).format(new Date()));
  const greet = hour < 11 ? tr("Guten Morgen", "Goedemorgen") : hour < 17 ? tr("Hallo", "Hoi") : tr("Guten Abend", "Goedenavond");
  const openToday = OPENING[weekday(d)];
  const openTomorrow = OPENING[weekday(tomorrow)];
  const storiesGoal = await q1<{ stories: number | null }>("select stories from social_goals where month = $1", [`${d.slice(0, 7)}-01`]).then((g) => g?.stories ?? 4);
  const storiesDone = storyWeek?.n ?? 0;
  // Wissenshappen: jeden Tag eine andere Seite, für alle gleich.
  const tipPage = tip.length ? tip[Number(d.slice(8)) % tip.length] : null;

  return (
    <div className="space-y-5">
      {/* ── Kopzone: datum, openingstijden, wie er vandaag is ── */}
      <section className="card !bg-white">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div>
            <p className="muted capitalize">{longDate(d, user.lang)}</p>
            <h1>{greet}, {user.name}</h1>
            <p className="mt-1 text-sm">
              {openToday
                ? <><span className="font-medium text-emerald-700">{tr("Heute geöffnet", "Vandaag open")} {openToday.open}–{openToday.close}</span></>
                : <span className="font-medium text-stone-500">{tr("Heute geschlossen", "Vandaag gesloten")}</span>}
              <span className="text-stone-400"> · {tr("morgen", "morgen")} {openTomorrow ? `${openTomorrow.open}–${openTomorrow.close}` : tr("geschlossen", "gesloten")}
                {tomorrowShifts.length > 0 && <> ({tomorrowShifts.map((s) => s.name).join(", ")})</>}</span>
            </p>
            {mine && (mine.kind === "shop" || mine.kind === "home") ? (
              <p className="mt-2 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-brand-light px-3 py-2 text-sm">
                <b>{tr("Deine Schicht", "Jouw dienst")}</b> {hm(mine.start_time)}–{hm(mine.end_time)}
                <Badge l={SHIFT_KIND[mine.kind]} lang={user.lang} />
                {mine.break_start && <span className="text-stone-600">{tr("Pause", "Pauze")} {hm(mine.break_start)}–{hm(mine.break_end)}{mine.break2_start && <> · {hm(mine.break2_start)}–{hm(mine.break2_end)}</>}</span>}
                {mine.note && <span className="text-stone-600">· {mine.note}</span>}
              </p>
            ) : mine ? (
              <p className="mt-2 inline-block rounded-xl bg-sand-100 px-3 py-2 text-sm"><b>{tr("Heute", "Vandaag")}:</b> {lbl(user.lang, SHIFT_KIND[mine.kind])}</p>
            ) : !isAdmin ? (
              <p className="mt-2 inline-block rounded-xl bg-sand-100 px-3 py-2 text-sm text-stone-500">{tr("Für heute ist keine Schicht eingetragen.", "Voor vandaag staat er geen dienst.")}</p>
            ) : null}
          </div>
          <div className="sm:min-w-[14rem]">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-stone-400">{tr("Heute im Team", "Vandaag in het team")}</span>
              <Link href="/app/roster" className="text-xs text-brand hover:underline">{tr("Dienstplan", "Rooster")} →</Link>
            </div>
            <ul className="space-y-1.5 text-sm">
              {working.map((s) => (
                <li key={s.user_id} className={`flex items-center gap-2 rounded-lg px-1.5 py-1 ${s.user_id === user.id ? "bg-sand-100" : ""}`}>
                  <Avatar name={s.name} color={s.color} size="h-6 w-6 text-[10px]" />
                  <span className="font-medium">{s.name}</span>
                  {s.kind !== "shop" && <Badge l={SHIFT_KIND[s.kind]} lang={user.lang} />}
                  <span className="ml-auto tabular-nums text-stone-500">{s.start_time ? `${hm(s.start_time)}–${hm(s.end_time)}` : ""}</span>
                </li>
              ))}
              {!working.length && <li className="text-stone-500">{tr("Niemand eingetragen.", "Niemand ingepland.")}</li>}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Attentieregels ── */}
      {(openActions.length > 0 || absenceReq.length > 0 || waiting.length > 0 || remindReflect || (!isAdmin && onb && onb.total > 0 && onb.done < onb.total) || (isAdmin && openQuestions.length > 0)) && (
        <div className="grid gap-2 sm:grid-cols-2">
          {isAdmin && openQuestions.length > 0 && (
            <Alert href="/app/questions" tone="amber"><b>{openQuestions.length} {openQuestions.length === 1 ? tr("offene Frage", "open vraag") : tr("offene Fragen", "open vragen")}</b> · {openQuestions.slice(0, 2).map((x) => `${x.name}: ${x.title}`).join(" · ")}</Alert>
          )}
          {openActions.length > 0 && (
            <Alert href="/app/journal" tone="amber">
              <b>{openActions.length} {openActions.length === 1 ? tr("Kundenfrage wartet auf eine Aktion", "klantvraag wacht op actie") : tr("Kundenfragen warten auf eine Aktion", "klantvragen wachten op actie")}</b>
              <span className="mt-0.5 block text-stone-600">{openActions.slice(0, 2).map((x) => `${lbl(user.lang, REQUEST_KIND[x.kind])}: ${x.product || x.text}`).join(" · ")}</span>
            </Alert>
          )}
          {absenceReq.length > 0 && (
            <Alert href="/app/absence" tone="amber"><b>{absenceReq.length} {absenceReq.length === 1 ? tr("Abwesenheits-Anfrage", "vrij-aanvraag") : tr("Abwesenheits-Anfragen", "vrij-aanvragen")}</b> · {absenceReq.slice(0, 3).map((a) => `${a.name} ${shortDate(a.date, user.lang)}`).join(" · ")}</Alert>
          )}
          {waiting.length > 0 && (
            <Alert href="/app/content" tone="brand">
              <b>{waiting.length} {waiting.length === 1
                ? (isAdmin ? tr("Beitrag wartet auf deine Freigabe", "post wacht op jouw goedkeuring") : tr("Beitrag wartet auf Freigabe", "post wacht op goedkeuring"))
                : (isAdmin ? tr("Beiträge warten auf deine Freigabe", "posts wachten op jouw goedkeuring") : tr("Beiträge warten auf Freigabe", "posts wachten op goedkeuring"))}</b>
              <span className="mt-0.5 block text-stone-600">{waiting.map((w) => w.title).join(" · ")}</span>
            </Alert>
          )}
          {!isAdmin && onb && onb.total > 0 && onb.done < onb.total && (
            <Alert href="/app/onboarding" tone="brand">
              <span className="flex items-center justify-between font-medium"><span>{tr("Deine Einarbeitung", "Jouw inwerkplan")}</span><span>{onb.done} / {onb.total}</span></span>
              <span className="mt-2 block h-2 overflow-hidden rounded-full bg-white"><span className="block h-full rounded-full bg-brand" style={{ width: `${(onb.done / onb.total) * 100}%` }} /></span>
            </Alert>
          )}
          {remindReflect && (
            <Alert href="/app/reflect" tone="brand">
              <b>{tr("Fünf Minuten für deinen Wochenrückblick?", "Vijf minuten voor je weekboek?")}</b>
              <span className="mt-0.5 block text-stone-600">{tr("Was hast du gelernt, was war gut, was war schwierig – nur Lea und Bas lesen mit.", "Wat heb je geleerd, wat ging goed, wat was lastig – alleen Lea en Bas lezen mee.")}</span>
            </Alert>
          )}
        </div>
      )}

      {/* ── Hoofdkolommen: de dag links, de rest rechts ── */}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <DayChecklist date={d} lang={user.lang} cleaning={cleaning} plans={plansToday} daily={dailyChecks} storyWeek={{ done: storiesDone, goal: storiesGoal }} zones={zones} me={user} isAdmin={isAdmin} closed={shopClosed} />

          <section className="card">
            <div className="mb-3 flex items-center justify-between"><h2>{tr("Heute im Laden", "Vandaag in de winkel")}</h2><Link href="/app/journal" className="text-sm text-brand hover:underline">{tr("Kundenfragen", "Klantvragen")} →</Link></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm font-medium">{tr("Online-Anfragen heute", "Online-aanvragen vandaag")}</div>
                <p className="text-xs text-stone-500">{tr("„Kann ich das online bestellen?“ – jede zählt.", "\"Kan ik dat online bestellen?\" – elke telt.")}</p>
                <form action={countOnline} className="mt-2 flex items-center gap-3"><input type="hidden" name="date" value={d} /><span className="text-3xl font-semibold tabular-nums">{onlineToday}</span><button className="btn-ghost">+1</button></form>
              </div>
              <div>
                <div className="text-sm font-medium">{tr("Kundenfrage oder Kundensatz", "Klantvraag of klantzin")}</div>
                <p className="text-xs text-stone-500">{tr("Was hat jemand heute gefragt oder gesagt? Kurz notieren – Details später unter Kundenfragen.", "Wat vroeg of zei iemand vandaag? Kort noteren – details later bij Klantvragen.")}</p>
                <form action={saveCustomerRequest} className="mt-2 flex gap-2" key={quotes.length}><input type="hidden" name="date" value={d} /><input type="hidden" name="back" value="/app" /><select name="kind" className="input !w-auto" defaultValue="question"><option value="question">{tr("Frage", "Vraag")}</option><option value="wish">{tr("Wunsch", "Wens")}</option><option value="quote">{tr("Satz", "Zin")}</option></select><input name="text" className="input" placeholder="„…“" required /><button className="btn-ghost">{tr("Merken", "Bewaar")}</button></form>
                <ul className="mt-2 space-y-1 text-sm text-stone-600">{quotes.map((x) => <li key={x.id}>{x.kind === "quote" ? `„${x.text}“` : x.text} <span className="text-xs text-stone-400">{x.date === d ? tr("heute", "vandaag") : shortDate(x.date, user.lang)}</span></li>)}</ul>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="mb-3 flex items-center justify-between">
              <h2>{isAdmin ? tr("In Arbeit & zur Kontrolle", "Bezig & ter controle") : tr("Deine Aufgaben", "Jouw opdrachten")}</h2>
              <Link href="/app/tasks" className="text-sm text-brand hover:underline">{tr("Alle", "Alle")} →</Link>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {myTasks.slice(0, 6).map((t) => <TaskCard key={t.id} t={t} lang={user.lang} showStatus />)}
              {!myTasks.length && <p className="text-sm text-stone-500">{tr("Nichts offen – super!", "Niets open – top!")}</p>}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <HoursCard rows={hours} lang={user.lang} me={user} isAdmin={isAdmin} />

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
              {!focus.length && <li className="text-sm text-stone-500">{isAdmin ? tr("Noch kein Fokus für diese Woche. Trag bis zu drei Punkte ein.", "Nog geen focus voor deze week. Zet er maximaal drie punten in.") : tr("Noch kein Fokus eingetragen – kommt nach dem Check-in.", "Nog geen focus – komt na de check-in.")}</li>}
            </ul>
            {isAdmin && focus.length < 3 && (
              <form action={addFocus} className="mt-2 flex gap-2" key={focus.length}><input type="hidden" name="week" value={week} /><input name="text" className="input" placeholder={tr("Fokuspunkt", "Fokuspunkt (auf Deutsch, für de stagiairs)")} required /><button className="btn-ghost">+</button></form>
            )}
          </section>

          <section className="card">
            <div className="mb-3 flex items-center justify-between"><h2>{tr("Termine", "Agenda")}</h2><Link href="/app/calendar" className="text-sm text-brand hover:underline">{tr("Kalender", "Agenda")} →</Link></div>
            <ul className="space-y-2 text-sm">
              {events.map((e) => (
                <li key={e.id} className="flex items-start gap-2">
                  <span className="w-20 shrink-0 text-stone-500">{e.date <= d ? tr("Heute", "Vandaag") : shortDate(e.date, user.lang)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium leading-snug">{e.title}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
                      {e.start_time && <span>{hm(e.start_time)}</span>}
                      <Badge l={EVENT_KIND[e.kind]} lang={user.lang} />
                    </span>
                  </span>
                </li>
              ))}
              {!events.length && <li className="text-stone-500">{tr("Keine Termine in den nächsten 2 Wochen.", "Geen afspraken de komende 2 weken.")}</li>}
            </ul>
          </section>

          {tipPage && (
            <Link href={`/app/kb/${tipPage.slug}`} className="card block hover:ring-brand">
              <div className="text-xs font-semibold uppercase tracking-wide text-stone-400">{tr("Wissenshappen für heute", "Kennishapje voor vandaag")}</div>
              <div className="mt-1 text-sm font-medium">{pick(user.lang, tipPage.title_de, tipPage.title_nl)}</div>
              <div className="text-xs text-stone-500">{tr("Fünf Minuten lesen – morgen kommt eine andere Seite.", "Vijf minuten lezen – morgen komt een andere pagina.")}</div>
            </Link>
          )}

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
      </div>
    </div>
  );
}
