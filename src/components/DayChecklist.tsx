import Link from "next/link";
import { T, pick, type Lang } from "@/lib/i18n";
import { hm } from "@/lib/dates";
import type { CleaningRow } from "@/lib/server/queries";
import { toggleCleaning, toggleDaily, togglePlan } from "@/app/app/actions";

export type PlanRow = { id: string; task_id: string; title: string; start_time: string | null; end_time: string | null; done: boolean; name: string; color: string; user_id: string };
type Owner = { id: string; name: string; color: string };
type Item = { id: string; label: string; done: boolean; by?: string | null; owner?: Owner | null; form: "clean" | "daily" | "plan"; href?: string; hint?: string; weekly?: boolean; disabled?: boolean };

function Check({ it, date, lang }: { it: Item; date: string; lang: Lang }) {
  const action = it.form === "clean" ? toggleCleaning : it.form === "daily" ? toggleDaily : togglePlan;
  return (
    <li>
      <form action={action}>
        {it.form === "clean" && <input type="hidden" name="task_id" value={it.id} />}
        {it.form === "daily" && <input type="hidden" name="key" value={it.id} />}
        {it.form === "plan" && <input type="hidden" name="id" value={it.id} />}
        <input type="hidden" name="date" value={date} />
        <div className="flex items-start gap-3 py-1.5">
          <button className="flex min-w-0 flex-1 items-start gap-3 text-left text-sm" disabled={it.disabled}>
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${it.done ? "border-emerald-600 bg-emerald-600 text-white" : "border-sand-400 bg-white"}`}>{it.done ? "✓" : ""}</span>
            <span className="min-w-0">
              <span className={`block ${it.done ? "text-stone-400 line-through" : ""}`}>{it.label}</span>
              {(it.hint || it.by || it.owner || it.weekly) && (
                <span className="flex flex-wrap items-center gap-1.5 text-xs text-stone-400">
                  {it.hint && <span>{it.hint}</span>}
                  {it.owner && !it.done && <span className="rounded px-1 font-semibold text-white" style={{ background: it.owner.color }}>{it.owner.name}</span>}
                  {it.weekly && <span className="rounded bg-sand-100 px-1">{lang === "nl" ? "wekelijks" : "wöchentlich"}</span>}
                  {it.by && <span>✓ {it.by}</span>}
                </span>
              )}
            </span>
          </button>
          {it.href && <Link href={it.href} className="shrink-0 pt-0.5 text-xs text-brand hover:underline">{lang === "nl" ? "open" : "öffnen"}</Link>}
        </div>
      </form>
    </li>
  );
}

/**
 * Eén dagchecklist: morgen → ingeplande opdrachten → overdag → afsluiten.
 * Vaste punten (Tag geplant, Story) komen uit daily_checks; Storepflege uit cleaning_tasks; werkblokken uit task_plans.
 */
export function DayChecklist({ date, lang, cleaning, plans, daily, storyWeek, zones, me, isAdmin, closed, phase = "open" }: {
  date: string; lang: Lang; cleaning: CleaningRow[]; plans: PlanRow[]; daily: { key: string; name: string | null }[]; storyWeek: { done: number; goal: number };
  zones?: { a?: Owner; b?: Owner }; me: { id: string }; isAdmin: boolean; closed: boolean; phase?: "open" | "day" | "close";
}) {
  const tr = T(lang);
  const dk = (key: string) => daily.find((d) => d.key === key);
  const cleanItems = (moment: string): Item[] => cleaning.filter((c) => c.moment === moment).map((c) => ({ id: c.id, label: pick(lang, c.title_de, c.title_nl), done: !!c.done_by, by: c.done_by, owner: c.zone ? zones?.[c.zone as "a" | "b"] : null, form: "clean", weekly: c.freq === "weekly" }));
  const planItems: Item[] = plans.map((p) => ({ id: p.id, label: p.title, done: p.done, hint: `${p.start_time ? `${hm(p.start_time)}${p.end_time ? "–" + hm(p.end_time) : ""} · ` : ""}${p.name}`, form: "plan", href: `/app/tasks/${p.task_id}`, disabled: !isAdmin && p.user_id !== me.id }));
  const planCheck: Item = { id: "plan", label: tr("Tag geplant: Aufgaben für heute in der Agenda eingeplant", "Dag gepland: opdrachten voor vandaag in de agenda gezet"), done: !!dk("plan") || plans.length > 0, by: dk("plan")?.name, form: "daily", href: "/app/calendar" };
  // Storys sind ein Wochenziel (Standard: 4 pro Woche). Ist es erreicht, verschwindet der Punkt.
  const storyOpen = storyWeek.done < storyWeek.goal;
  const storyCheck: Item = {
    id: "story", label: tr("Story gepostet", "Story gepost"), done: !storyOpen || !!dk("story"), by: dk("story")?.name, form: "daily", href: "/app/content",
    hint: tr(`diese Woche ${storyWeek.done} von ${storyWeek.goal}`, `deze week ${storyWeek.done} van ${storyWeek.goal}`),
  };

  const groups: { key: string; title: string; items: Item[] }[] = closed
    ? [{ key: "home", title: tr("Homeoffice", "Thuiswerk"), items: [planCheck, ...planItems, ...(storyOpen ? [storyCheck] : [])] }]
    : [
        { key: "open", title: tr("Vor dem Öffnen", "Voor opening"), items: [...cleanItems("open"), planCheck] },
        { key: "plan", title: tr("Heute eingeplant", "Vandaag ingepland"), items: planItems },
        { key: "day", title: tr("Tagsüber", "Overdag"), items: [...(storyOpen ? [storyCheck] : []), ...cleanItems("day")] },
        { key: "close", title: tr("Zum Feierabend", "Bij sluiten"), items: cleanItems("close") },
      ];
  const all = groups.flatMap((g) => g.items);
  const done = all.filter((i) => i.done).length;
  return (
    <section className="card">
      <div className="mb-1 flex items-center justify-between">
        <h2>{isAdmin ? tr("Der Tag im Laden", "De dag in de winkel") : tr("Dein Tag", "Jouw dag")}</h2>
        <span className={`text-sm font-semibold tabular-nums ${done === all.length && all.length ? "text-emerald-700" : "text-stone-500"}`}>{done} / {all.length}</span>
      </div>
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-sand-100"><div className={`h-full rounded-full transition-all ${done === all.length && all.length ? "bg-emerald-600" : "bg-ink"}`} style={{ width: `${all.length ? (done / all.length) * 100 : 0}%` }} /></div>
      <div className="divide-y divide-sand-200 border-t border-sand-200">
        {groups.map((g) => {
          const n = g.items.filter((i) => i.done).length;
          const complete = g.items.length > 0 && n === g.items.length;
          // Aufgeklappt: der aktuelle Tagesabschnitt und die eingeplanten Aufgaben, solange noch etwas offen ist
          const open = closed || (!complete && (g.key === phase || g.key === "plan"));
          return (
            <details key={g.key} open={open} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center gap-2 py-2 text-sm">
                <span className="text-stone-400 transition group-open:rotate-90">›</span>
                <span className="font-semibold">{g.title}</span>
                {g.key === phase && !closed && <span className="badge bg-brand-light text-brand-dark">{tr("jetzt", "nu")}</span>}
                <span className={`ml-auto text-xs tabular-nums ${complete ? "font-semibold text-emerald-700" : "text-stone-400"}`}>{g.items.length ? `${n} / ${g.items.length}` : "–"}</span>
              </summary>
              {g.items.length ? <ul className="divide-y divide-sand-100 pb-1 pl-5">{g.items.map((it) => <Check key={`${it.form}-${it.id}`} it={it} date={date} lang={lang} />)}</ul>
                : <p className="pb-2 pl-5 text-sm text-stone-400">{tr("Noch nichts eingeplant –", "Nog niets ingepland –")} <Link href="/app/calendar" className="text-brand underline">{tr("in der Agenda einplanen", "inplannen in de agenda")}</Link></p>}
            </details>
          );
        })}
      </div>
    </section>
  );
}
