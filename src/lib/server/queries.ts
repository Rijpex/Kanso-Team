import "server-only";
import { q, q1 } from "./db";
import { isoWeek, weekday } from "@/lib/dates";

export type TeamUser = { id: string; name: string; role: "admin" | "intern"; color: string; username: string; lang: "de" | "nl"; active: boolean };
export const team = (onlyActive = true) => q<TeamUser>(`select id, name, role, color, username, lang, active from users ${onlyActive ? "where active" : ""} order by role desc, created_at`);

export type CleaningRow = { id: string; title_de: string; title_nl: string | null; freq: string; weekday: number | null; moment: string; zone: string | null; done_by: string | null; done_color: string | null };
export async function cleaningFor(date: string): Promise<CleaningRow[]> {
  const wd = weekday(date);
  if (wd === 1) return []; // maandag gesloten
  if (wd === 7) {
    // zondag alleen bij verkaufsoffener Sonntag (staat als agenda-item met kind 'shop')
    const open = await q1("select 1 from events where date = $1 and kind = 'shop'", [date]);
    if (!open) return [];
  }
  return q<CleaningRow>(
    `select t.id, t.title_de, t.title_nl, t.freq, t.weekday, t.moment, t.zone, u.name as done_by, u.color as done_color
       from cleaning_tasks t
       left join cleaning_checks c on c.task_id = t.id and c.date = $1
       left join users u on u.id = c.user_id
      where t.active and (t.freq = 'daily' or t.weekday = $2)
      order by case t.moment when 'open' then 0 when 'day' then 1 else 2 end, t.position`,
    [date, wd],
  );
}

export type TaskRow = {
  id: string; title: string; description: string | null; category: string; status: string; due: string | null; home_ok: boolean;
  updated_at: string; assignees: { id: string; name: string; color: string }[]; comments: number; files: number; check_done: number; check_total: number; next_plan: string | null;
};
export function tasksQuery(where = "true", params: unknown[] = []) {
  return q<TaskRow>(
    `select t.*,
        coalesce((select json_agg(json_build_object('id', u.id, 'name', u.name, 'color', u.color) order by u.name)
                    from task_assignees a join users u on u.id = a.user_id where a.task_id = t.id), '[]') as assignees,
        (select count(*)::int from comments c where c.task_id = t.id) as comments,
        (select count(*)::int from files f where f.task_id = t.id) as files,
        (select count(*)::int from task_checklist k where k.task_id = t.id and k.done) as check_done,
        (select count(*)::int from task_checklist k where k.task_id = t.id) as check_total,
        (select min(p.date)::text from task_plans p where p.task_id = t.id and not p.done and p.date >= current_date) as next_plan
       from tasks t
      where ${where}
      order by t.due nulls last, t.created_at`,
    params,
  );
}
/** Opdrachten van deze persoon: toegewezen aan haar, of aan niemand (= voor alle stagiairs). */
export const MINE = `(exists (select 1 from task_assignees a where a.task_id = t.id and a.user_id = $1)
  or not exists (select 1 from task_assignees a where a.task_id = t.id))`;

/** Storepflege-Bereiche wechseln jede Woche: gerade KW → erste Praktikantin hat Bereich A. */
export async function zoneOwners(date: string): Promise<{ a?: { id: string; name: string; color: string }; b?: { id: string; name: string; color: string } }> {
  const interns = await q<{ id: string; name: string; color: string }>("select id, name, color from users where role = 'intern' and active order by created_at limit 2");
  if (interns.length < 2) return { a: interns[0], b: interns[0] };
  const even = isoWeek(date) % 2 === 0;
  return { a: interns[even ? 0 : 1], b: interns[even ? 1 : 0] };
}
