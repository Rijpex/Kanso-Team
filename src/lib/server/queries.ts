import "server-only";
import { q, q1 } from "./db";
import { addDays, isoWeek, monday, weekday } from "@/lib/dates";
import { shiftMinutes } from "@/lib/hours";

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

/* ───────── Praktikumsstunden ─────────
 * Eén bron: het rooster. Een dag telt mee als hij in het verleden ligt, van het soort
 * "Laden" of "Homeoffice" is, en op of na de startdatum van de stage valt.
 * worked_minutes op een dienst is een handmatige correctie en gaat vóór de roostertijden.
 * before_minutes zijn uren van vóór de hub, die Bas of Lea met de hand invullen.
 */
export type MonthRow = { month: string; minutes: number; days: number };
export type DayRow = {
  user_id: string; date: string; kind: string; start_time: string | null; end_time: string | null;
  break_start: string | null; break_end: string | null; break2_start: string | null; break2_end: string | null;
  worked_minutes: number | null; note: string | null; minutes: number; counts: boolean;
};
export type HoursRow = {
  user_id: string; name: string; color: string;
  startDate: string | null; endDate: string | null; targetMinutes: number; beforeMinutes: number;
  weekDone: number; weekPlanned: number; monthDone: number; monthPlanned: number;
  rosterMinutes: number; doneMinutes: number; futureMinutes: number;
  days: number; firstDate: string | null; lastDate: string | null;
  months: MonthRow[];
};

type ShiftRow = {
  user_id: string; name: string; color: string; date: string; kind: string;
  start_time: string | null; end_time: string | null; break_start: string | null; break_end: string | null;
  break2_start: string | null; break2_end: string | null; worked_minutes: number | null; note: string | null;
  start_date: string | null; end_date: string | null; target_hours: number | null; before_minutes: number;
};

const SHIFT_SELECT = `select s.user_id, u.name, u.color, s.date::text as date, s.kind, s.start_time, s.end_time,
        s.break_start, s.break_end, s.break2_start, s.break2_end, s.worked_minutes, s.note,
        u.start_date::text as start_date, u.end_date::text as end_date, u.target_hours, u.before_minutes
   from shifts s join users u on u.id = s.user_id
  where u.role = 'intern' and u.active and s.kind in ('shop','home')
  order by u.created_at, s.date`;

/** Minuten van één dag: handmatige correctie, anders uit de roostertijden. */
const dayMinutes = (r: ShiftRow | DayRow) => (r.worked_minutes != null ? Math.max(0, r.worked_minutes) : shiftMinutes(r));

export async function internHours(date: string): Promise<HoursRow[]> {
  const week = monday(date);
  const weekEnd = addDays(week, 6);
  const monthStart = `${date.slice(0, 7)}-01`;
  const monthEnd = `${date.slice(0, 7)}-31`;
  const rows = await q<ShiftRow>(SHIFT_SELECT);
  const map = new Map<string, HoursRow>();
  const months = new Map<string, Map<string, MonthRow>>();
  for (const r of rows) {
    const cur = map.get(r.user_id) ?? {
      user_id: r.user_id, name: r.name, color: r.color,
      startDate: r.start_date, endDate: r.end_date,
      targetMinutes: (r.target_hours ?? 900) * 60, beforeMinutes: r.before_minutes || 0,
      weekDone: 0, weekPlanned: 0, monthDone: 0, monthPlanned: 0,
      rosterMinutes: 0, doneMinutes: 0, futureMinutes: 0, days: 0, firstDate: null, lastDate: null, months: [],
    };
    map.set(r.user_id, cur);
    const min = dayMinutes(r);
    if (!min) continue;
    const started = !r.start_date || r.date >= r.start_date;
    const past = r.date <= date;
    if (started) {
      if (past) {
        cur.rosterMinutes += min;
        cur.days += 1;
        cur.lastDate = r.date;
        if (!cur.firstDate) cur.firstDate = r.date;
        const key = r.date.slice(0, 7);
        const mm = months.get(r.user_id) ?? new Map<string, MonthRow>();
        const row = mm.get(key) ?? { month: `${key}-01`, minutes: 0, days: 0 };
        row.minutes += min; row.days += 1;
        mm.set(key, row); months.set(r.user_id, mm);
      } else {
        cur.futureMinutes += min;
      }
    }
    if (r.date >= week && r.date <= weekEnd) { cur.weekPlanned += min; if (past) cur.weekDone += min; }
    if (r.date >= monthStart && r.date <= monthEnd) { cur.monthPlanned += min; if (past) cur.monthDone += min; }
  }
  for (const row of map.values()) {
    row.doneMinutes = row.rosterMinutes + row.beforeMinutes;
    row.months = [...(months.get(row.user_id)?.values() ?? [])].sort((a, b) => (a.month < b.month ? 1 : -1));
  }
  return [...map.values()];
}

/** Alle roosterdagen van de stagiaires, nieuwste eerst – voor de urenpagina. */
export async function internDays(date: string): Promise<DayRow[]> {
  const rows = await q<ShiftRow>(SHIFT_SELECT);
  return rows
    .map((r) => ({
      user_id: r.user_id, date: r.date, kind: r.kind, start_time: r.start_time, end_time: r.end_time,
      break_start: r.break_start, break_end: r.break_end, break2_start: r.break2_start, break2_end: r.break2_end,
      worked_minutes: r.worked_minutes, note: r.note, minutes: dayMinutes(r),
      counts: r.date <= date && (!r.start_date || r.date >= r.start_date),
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
