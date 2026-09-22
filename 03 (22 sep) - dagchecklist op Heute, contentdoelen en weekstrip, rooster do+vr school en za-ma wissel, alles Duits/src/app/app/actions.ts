"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { q, q1 } from "@/lib/server/db";
import { hashPassword, logout, requireAdmin, requireUser } from "@/lib/server/auth";
import { migrate } from "@/lib/server/setup";
import { addDays, weekday } from "@/lib/dates";
import { BUCKET, supabaseAdmin, supabaseConfigured } from "@/lib/server/storage";

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const opt = (fd: FormData, k: string) => s(fd, k) || null;
const num = (fd: FormData, k: string) => {
  const v = s(fd, k).replace(",", ".");
  return v === "" || isNaN(Number(v)) ? null : Number(v);
};
const isDate = (v: string | null) => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);
const back = (fd: FormData, fallback: string) => {
  const b = s(fd, "back");
  return b.startsWith("/app") ? b : fallback;
};

export async function signOut() {
  await logout();
  redirect("/login");
}

/* ───────── Kalender ───────── */
export async function saveEvent(fd: FormData) {
  const u = await requireUser();
  const id = opt(fd, "id");
  const date = s(fd, "date");
  if (!s(fd, "title") || !isDate(date)) return;
  const endDate = isDate(opt(fd, "end_date")) && s(fd, "end_date") > date ? s(fd, "end_date") : null;
  const vals = [s(fd, "title"), opt(fd, "note"), date, endDate, opt(fd, "start_time"), opt(fd, "end_time"), s(fd, "kind") || "event"];
  if (id) {
    const ev = await q1<{ created_by: string }>("select created_by from events where id = $1", [id]);
    if (!ev || (u.role !== "admin" && ev.created_by !== u.id)) return;
    await q("update events set title=$1, note=$2, date=$3, end_date=$4, start_time=$5, end_time=$6, kind=$7 where id=$8", [...vals, id]);
  } else {
    await q("insert into events (title, note, date, end_date, start_time, end_time, kind, created_by) values ($1,$2,$3,$4,$5,$6,$7,$8)", [...vals, u.id]);
  }
  revalidatePath("/app", "layout");
  redirect(back(fd, "/app/calendar"));
}

export async function deleteEvent(fd: FormData) {
  const u = await requireUser();
  const id = s(fd, "id");
  if (u.role === "admin") await q("delete from events where id = $1", [id]);
  else await q("delete from events where id = $1 and created_by = $2", [id, u.id]);
  revalidatePath("/app", "layout");
  redirect(back(fd, "/app/calendar"));
}

/* ───────── Dienstplan ───────── */
export async function saveShift(fd: FormData) {
  await requireAdmin();
  const userId = s(fd, "user_id");
  const date = s(fd, "date");
  if (!userId || !isDate(date)) return;
  const kind = s(fd, "kind") || "shop";
  if (kind === "none") {
    await q("delete from shifts where user_id = $1 and date = $2", [userId, date]);
  } else {
    const timed = kind === "shop" || kind === "home";
    await q(
      `insert into shifts (user_id, date, kind, start_time, end_time, break_start, break_end, note)
       values ($1,$2,$3,$4,$5,$6,$7,$8)
       on conflict (user_id, date) do update set kind=excluded.kind, start_time=excluded.start_time, end_time=excluded.end_time,
         break_start=excluded.break_start, break_end=excluded.break_end, note=excluded.note`,
      [userId, date, kind, timed ? opt(fd, "start_time") : null, timed ? opt(fd, "end_time") : null, timed ? opt(fd, "break_start") : null, timed ? opt(fd, "break_end") : null, opt(fd, "note")],
    );
  }
  revalidatePath("/app", "layout");
  redirect(back(fd, "/app/roster"));
}

/**
 * Vult het rooster voor een aantal weken. Per stagiair: vaste winkeldagen (di–vr) en schooldagen.
 * Zaterdagen wisselen af; wie die week zaterdag NIET werkt, doet die maandag thuiswerk.
 */
export async function generateRoster(fd: FormData) {
  await requireAdmin();
  const from = s(fd, "from");
  const weeks = Math.min(Math.max(Number(s(fd, "weeks")) || 4, 1), 26);
  const firstSat = s(fd, "first_saturday"); // user id die de eerste zaterdag werkt
  const overwrite = s(fd, "overwrite") === "on";
  if (!isDate(from)) return;
  const interns = await q<{ id: string }>("select id from users where role = 'intern' and active order by created_at");
  if (!interns.length) return;
  const startMonday = addDays(from, 1 - weekday(from));
  const order = [...interns.filter((i) => i.id === firstSat), ...interns.filter((i) => i.id !== firstSat)];
  const t = (k: string, d: string) => opt(fd, k) || d;

  // Zaterdagen per kalendermaand tellen (school: max. 2 per maand), inclusief wat al in het rooster staat
  const satCount = new Map<string, number>();
  const key = (uid: string, d: string) => `${uid}_${d.slice(0, 7)}`;
  const existing = await q<{ user_id: string; date: string }>("select user_id, date from shifts where kind = 'shop' and extract(isodow from date) = 6 and date >= $1::date - interval '31 days'", [startMonday]);
  const horizonEnd = addDays(startMonday, weeks * 7);
  for (const e of existing) if (overwrite ? e.date < from || e.date >= horizonEnd : true) satCount.set(key(e.user_id, e.date), (satCount.get(key(e.user_id, e.date)) || 0) + 1);

  let turn = 0;

  for (let w = 0; w < weeks; w++) {
    const mon = addDays(startMonday, w * 7);
    const sat = addDays(mon, 5);
    // Wie is aan de beurt? Sla over als diegene deze maand al 2 zaterdagen heeft.
    let satWorker: { id: string } | null = null;
    for (let k = 0; k < order.length; k++) {
      const cand = order[(turn + k) % order.length];
      if ((satCount.get(key(cand.id, sat)) || 0) < 2) { satWorker = cand; turn = turn + k + 1; break; }
    }
    if (satWorker && sat >= from) satCount.set(key(satWorker.id, sat), (satCount.get(key(satWorker.id, sat)) || 0) + 1);

    for (let i = 0; i < interns.length; i++) {
      const it = interns[i];
      const brk: [string, string] = i % 2 === 0 ? [t("break_a_start", "12:30"), t("break_a_end", "13:30")] : [t("break_b_start", "13:30"), t("break_b_end", "14:30")];
      const worksSat = satWorker?.id === it.id;
      // Zelfde week: wie zaterdag niet werkt, heeft maandag thuiswerk
      const mondayHome = s(fd, "monday_home") === "on" && interns.length > 1 && !!satWorker && !worksSat;
      for (let wd = 1; wd <= 6; wd++) {
        const date = addDays(mon, wd - 1);
        if (date < from) continue;
        let row: [string, string | null, string | null, string | null, string | null] | null = null;
        if (wd === 1) {
          row = mondayHome ? ["home", t("home_start", "10:00"), t("home_end", "14:30"), null, null] : ["off", null, null, null, null];
        } else if (wd === 6) {
          row = worksSat ? ["shop", t("sat_start", "10:00"), t("sat_end", "17:00"), brk[0], brk[1]] : ["off", null, null, null, null];
        } else {
          const choice = s(fd, `d_${it.id}_${wd}`) || "shop";
          if (choice === "shop") row = ["shop", t("week_start", "10:00"), t("week_end", "18:30"), brk[0], brk[1]];
          else if (choice === "school") row = ["school", null, null, null, null];
          else if (choice === "off") row = ["off", null, null, null, null];
          // "skip" = deze dag niet vullen
        }
        if (!row) continue;
        await q(
          `insert into shifts (user_id, date, kind, start_time, end_time, break_start, break_end) values ($1,$2,$3,$4,$5,$6,$7)
           on conflict (user_id, date) do ${overwrite ? "update set kind=excluded.kind, start_time=excluded.start_time, end_time=excluded.end_time, break_start=excluded.break_start, break_end=excluded.break_end" : "nothing"}`,
          [it.id, date, ...row],
        );
      }
    }
  }
  revalidatePath("/app", "layout");
  redirect(`/app/roster?w=${startMonday}`);
}

/* ───────── Putzplan ───────── */
export async function toggleCleaning(fd: FormData) {
  const u = await requireUser();
  const taskId = s(fd, "task_id");
  const date = s(fd, "date");
  if (!isDate(date)) return;
  const existing = await q1("select 1 from cleaning_checks where task_id = $1 and date = $2", [taskId, date]);
  if (existing) await q("delete from cleaning_checks where task_id = $1 and date = $2", [taskId, date]);
  else await q("insert into cleaning_checks (task_id, date, user_id) values ($1,$2,$3) on conflict do nothing", [taskId, date, u.id]);
  revalidatePath("/app", "layout");
}

export async function saveCleaningTask(fd: FormData) {
  await requireAdmin();
  const id = opt(fd, "id");
  const freq = s(fd, "freq") === "weekly" ? "weekly" : "daily";
  const zone = ["a", "b"].includes(s(fd, "zone")) ? s(fd, "zone") : null;
  const vals = [s(fd, "title_de"), opt(fd, "title_nl"), freq, freq === "weekly" ? Number(s(fd, "weekday")) || 2 : null, s(fd, "moment") || "day", zone];
  if (!vals[0]) return;
  if (id) await q("update cleaning_tasks set title_de=$1, title_nl=$2, freq=$3, weekday=$4, moment=$5, zone=$6 where id=$7", [...vals, id]);
  else await q("insert into cleaning_tasks (title_de, title_nl, freq, weekday, moment, zone, position) values ($1,$2,$3,$4,$5,$6, (select coalesce(max(position),0)+1 from cleaning_tasks))", vals);
  revalidatePath("/app", "layout");
}

export async function deleteCleaningTask(fd: FormData) {
  await requireAdmin();
  await q("update cleaning_tasks set active = false where id = $1", [s(fd, "id")]);
  revalidatePath("/app", "layout");
}

/* ───────── Aufgaben ───────── */
export async function saveTask(fd: FormData) {
  const u = await requireUser();
  const id = opt(fd, "id");
  const title = s(fd, "title");
  if (!title) return;
  const vals = [title, opt(fd, "description"), s(fd, "category") || "shop", isDate(opt(fd, "due")) ? s(fd, "due") : null, s(fd, "home_ok") === "on"];
  let taskId = id;
  if (id) {
    await q("update tasks set title=$1, description=$2, category=$3, due=$4, home_ok=$5, updated_at=now() where id=$6", [...vals, id]);
  } else {
    const row = await q1<{ id: string }>("insert into tasks (title, description, category, due, home_ok, created_by) values ($1,$2,$3,$4,$5,$6) returning id", [...vals, u.id]);
    taskId = row!.id;
  }
  const assignees = fd.getAll("assignees").map(String).filter(Boolean);
  await q("delete from task_assignees where task_id = $1", [taskId]);
  for (const a of assignees) await q("insert into task_assignees (task_id, user_id) values ($1,$2) on conflict do nothing", [taskId, a]);
  revalidatePath("/app", "layout");
  redirect(`/app/tasks/${taskId}`);
}

export async function setTaskStatus(fd: FormData) {
  await requireUser();
  const status = s(fd, "status");
  if (!["todo", "doing", "review", "done"].includes(status)) return;
  await q("update tasks set status = $1, updated_at = now() where id = $2", [status, s(fd, "id")]);
  revalidatePath("/app", "layout");
}

export async function deleteTask(fd: FormData) {
  await requireAdmin();
  const id = s(fd, "id");
  if (supabaseConfigured()) {
    const paths = await q<{ storage_path: string }>("select storage_path from files where task_id = $1 and storage = 'supabase'", [id]);
    if (paths.length) await supabaseAdmin().storage.from(BUCKET).remove(paths.map((p) => p.storage_path)).catch(() => undefined);
  }
  await q("delete from tasks where id = $1", [id]);
  revalidatePath("/app", "layout");
  redirect("/app/tasks");
}

export async function addChecklistItem(fd: FormData) {
  await requireUser();
  const text = s(fd, "text");
  if (!text) return;
  await q("insert into task_checklist (task_id, text, position) values ($1,$2,(select coalesce(max(position),0)+1 from task_checklist where task_id = $1))", [s(fd, "task_id"), text]);
  revalidatePath("/app", "layout");
}
export async function toggleChecklistItem(fd: FormData) {
  await requireUser();
  await q("update task_checklist set done = not done where id = $1", [s(fd, "id")]);
  revalidatePath("/app", "layout");
}
export async function deleteChecklistItem(fd: FormData) {
  await requireUser();
  await q("delete from task_checklist where id = $1", [s(fd, "id")]);
  revalidatePath("/app", "layout");
}

export async function addComment(fd: FormData) {
  const u = await requireUser();
  const body = s(fd, "body");
  if (!body) return;
  const taskId = opt(fd, "task_id");
  const questionId = opt(fd, "question_id");
  const ideaId = opt(fd, "idea_id");
  if (!taskId && !questionId && !ideaId) return;
  await q("insert into comments (task_id, question_id, idea_id, user_id, body) values ($1,$2,$3,$4,$5)", [taskId, questionId, ideaId, u.id, body]);
  if (taskId) await q("update tasks set updated_at = now() where id = $1", [taskId]);
  if (questionId && u.role === "admin") await q("update questions set status = 'answered' where id = $1", [questionId]);
  if (questionId && u.role !== "admin") await q("update questions set status = 'open' where id = $1", [questionId]);
  revalidatePath("/app", "layout");
}

export async function deleteComment(fd: FormData) {
  const u = await requireUser();
  if (u.role === "admin") await q("delete from comments where id = $1", [s(fd, "id")]);
  else await q("delete from comments where id = $1 and user_id = $2", [s(fd, "id"), u.id]);
  revalidatePath("/app", "layout");
}

export async function deleteFile(fd: FormData) {
  const u = await requireUser();
  const f = await q1<{ id: string; storage: string; storage_path: string; uploaded_by: string }>("select id, storage, storage_path, uploaded_by from files where id = $1", [s(fd, "id")]);
  if (!f || (u.role !== "admin" && f.uploaded_by !== u.id)) return;
  if (f.storage === "supabase" && supabaseConfigured()) await supabaseAdmin().storage.from(BUCKET).remove([f.storage_path]).catch(() => undefined);
  await q("delete from files where id = $1", [f.id]);
  revalidatePath("/app", "layout");
}

/* ───────── Fragen ───────── */
export async function askQuestion(fd: FormData) {
  const u = await requireUser();
  const title = s(fd, "title");
  if (!title) return;
  const urgency = ["checkin", "today", "now"].includes(s(fd, "urgency")) ? s(fd, "urgency") : "checkin";
  const row = await q1<{ id: string }>("insert into questions (user_id, title, body, urgency) values ($1,$2,$3,$4) returning id", [u.id, title, opt(fd, "body"), urgency]);
  revalidatePath("/app", "layout");
  redirect(`/app/questions/${row!.id}`);
}
export async function setQuestionStatus(fd: FormData) {
  await requireUser();
  await q("update questions set status = $1 where id = $2", [s(fd, "status") === "answered" ? "answered" : "open", s(fd, "id")]);
  revalidatePath("/app", "layout");
}
export async function deleteQuestion(fd: FormData) {
  await requireAdmin();
  await q("delete from questions where id = $1", [s(fd, "id")]);
  revalidatePath("/app", "layout");
  redirect("/app/questions");
}

/* ───────── Wissen ───────── */
export async function saveKbPage(fd: FormData) {
  await requireAdmin();
  const id = opt(fd, "id");
  const titleDe = s(fd, "title_de");
  if (!titleDe) return;
  let slug = s(fd, "slug");
  if (id) {
    await q("update kb_pages set category=$1, title_de=$2, title_nl=$3, body_de=$4, body_nl=$5, updated_at=now() where id=$6", [s(fd, "category") || "shop", titleDe, opt(fd, "title_nl"), s(fd, "body_de"), opt(fd, "body_nl"), id]);
  } else {
    slug = titleDe.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "seite";
    if (await q1("select 1 from kb_pages where slug = $1", [slug])) slug = `${slug}-${Date.now().toString(36)}`;
    await q("insert into kb_pages (slug, category, title_de, title_nl, body_de, body_nl, position) values ($1,$2,$3,$4,$5,$6,(select coalesce(max(position),0)+1 from kb_pages))", [slug, s(fd, "category") || "shop", titleDe, opt(fd, "title_nl"), s(fd, "body_de"), opt(fd, "body_nl")]);
  }
  revalidatePath("/app", "layout");
  redirect(`/app/kb/${slug}`);
}
export async function deleteKbPage(fd: FormData) {
  await requireAdmin();
  await q("delete from kb_pages where id = $1", [s(fd, "id")]);
  revalidatePath("/app", "layout");
  redirect("/app/kb");
}

/* ───────── Einarbeitung ───────── */
export async function toggleOnboarding(fd: FormData) {
  const u = await requireUser();
  const itemId = s(fd, "item_id");
  const has = await q1("select 1 from onboarding_checks where item_id = $1 and user_id = $2", [itemId, u.id]);
  if (has) await q("delete from onboarding_checks where item_id = $1 and user_id = $2", [itemId, u.id]);
  else await q("insert into onboarding_checks (item_id, user_id) values ($1,$2) on conflict do nothing", [itemId, u.id]);
  revalidatePath("/app", "layout");
}
export async function saveOnboardingItem(fd: FormData) {
  await requireAdmin();
  const de = s(fd, "title_de");
  if (!de) return;
  await q("insert into onboarding_items (day, position, title_de, hint_de) values ($1,(select coalesce(max(position),0)+1 from onboarding_items),$2,$3)", [Number(s(fd, "day")) || 1, de, opt(fd, "hint_de")]);
  revalidatePath("/app", "layout");
}
export async function deleteOnboardingItem(fd: FormData) {
  await requireAdmin();
  await q("delete from onboarding_items where id = $1", [s(fd, "id")]);
  revalidatePath("/app", "layout");
}

/* ───────── Produktideen ───────── */
export async function saveIdea(fd: FormData) {
  const u = await requireUser();
  const id = opt(fd, "id");
  const name = s(fd, "name");
  if (!name) return;
  const checks = fd.getAll("checks").map(String).filter(Boolean);
  const vals = [name, opt(fd, "supplier"), opt(fd, "link"), num(fd, "ek"), num(fd, "vk"), num(fd, "vat") ?? 19, num(fd, "moq"), opt(fd, "packaging"), opt(fd, "why"),
    opt(fd, "world"), opt(fd, "occasion"), num(fd, "extra_cost"), num(fd, "online_price"), opt(fd, "lead_time"), opt(fd, "season"), checks, s(fd, "sample") === "on"];
  let ideaId = id;
  if (id) {
    const own = await q1<{ user_id: string }>("select user_id from ideas where id = $1", [id]);
    if (!own || (u.role !== "admin" && own.user_id !== u.id)) return;
    await q("update ideas set name=$1, supplier=$2, link=$3, ek=$4, vk=$5, vat=$6, moq=$7, packaging=$8, why=$9, world=$10, occasion=$11, extra_cost=$12, online_price=$13, lead_time=$14, season=$15, checks=$16, sample=$17 where id=$18", [...vals, id]);
  } else {
    const row = await q1<{ id: string }>("insert into ideas (name, supplier, link, ek, vk, vat, moq, packaging, why, world, occasion, extra_cost, online_price, lead_time, season, checks, sample, user_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) returning id", [...vals, u.id]);
    ideaId = row!.id;
  }
  revalidatePath("/app", "layout");
  redirect(`/app/ideas/${ideaId}`);
}
export async function setIdeaStatus(fd: FormData) {
  const u = await requireUser();
  const status = s(fd, "status");
  if (!["idea", "research", "discuss", "approved", "rejected"].includes(status)) return;
  if (["approved", "rejected"].includes(status) && u.role !== "admin") return;
  await q("update ideas set status = $1 where id = $2", [status, s(fd, "id")]);
  revalidatePath("/app", "layout");
}
export async function deleteIdea(fd: FormData) {
  const u = await requireUser();
  if (u.role === "admin") await q("delete from ideas where id = $1", [s(fd, "id")]);
  else await q("delete from ideas where id = $1 and user_id = $2", [s(fd, "id"), u.id]);
  revalidatePath("/app", "layout");
  redirect("/app/ideas");
}

/* ───────── Content-Plan ───────── */
export async function saveContent(fd: FormData) {
  const u = await requireUser();
  const id = opt(fd, "id");
  const title = s(fd, "title");
  if (!title) return;
  const kind = ["reel", "story", "post"].includes(s(fd, "kind")) ? s(fd, "kind") : "reel";
  const vals = [title, opt(fd, "idea"), kind, isDate(opt(fd, "date")) ? s(fd, "date") : null, opt(fd, "owner_id") ?? u.id, opt(fd, "link"), opt(fd, "pillar"), opt(fd, "brand")];
  if (id) await q("update content_items set title=$1, idea=$2, kind=$3, date=$4, owner_id=$5, link=$6, pillar=$7, brand=$8 where id=$9", [...vals, id]);
  else await q("insert into content_items (title, idea, kind, date, owner_id, link, pillar, brand) values ($1,$2,$3,$4,$5,$6,$7,$8)", vals);
  revalidatePath("/app", "layout");
  redirect(back(fd, "/app/content"));
}
export async function setContentStatus(fd: FormData) {
  const u = await requireUser();
  const status = s(fd, "status");
  if (!["idea", "filmed", "edited", "approved", "posted"].includes(status)) return;
  const cur = await q1<{ status: string }>("select status from content_items where id = $1", [s(fd, "id")]);
  if (!cur) return;
  // Freigabe nur durch Admins; posten erst nach Freigabe
  if (status === "approved" && u.role !== "admin") return;
  if (status === "posted" && u.role !== "admin" && cur.status !== "approved") return;
  await q("update content_items set status = $1 where id = $2", [status, s(fd, "id")]);
  revalidatePath("/app", "layout");
}
export async function deleteContent(fd: FormData) {
  const u = await requireUser();
  if (u.role === "admin") await q("delete from content_items where id = $1", [s(fd, "id")]);
  else await q("delete from content_items where id = $1 and owner_id = $2", [s(fd, "id"), u.id]);
  revalidatePath("/app", "layout");
  redirect("/app/content");
}

/* ───────── Team & Profil ───────── */
export async function saveUser(fd: FormData) {
  await requireAdmin();
  const id = opt(fd, "id");
  const name = s(fd, "name");
  const username = s(fd, "username").toLowerCase();
  const role = s(fd, "role") === "admin" ? "admin" : "intern";
  const lang = s(fd, "lang") === "nl" ? "nl" : "de";
  const color = /^#[0-9a-f]{6}$/i.test(s(fd, "color")) ? s(fd, "color") : "#7a6a4f";
  const password = s(fd, "password");
  if (!name || !/^[a-z0-9._-]{2,30}$/.test(username)) redirect("/app/team?error=name");
  const clash = await q1<{ id: string }>("select id from users where lower(username) = $1", [username]);
  if (clash && clash.id !== id) redirect("/app/team?error=exists");
  if (id) {
    await q("update users set name=$1, username=$2, role=$3, lang=$4, color=$5 where id=$6", [name, username, role, lang, color, id]);
    if (password) {
      if (password.length < 6) redirect("/app/team?error=pw");
      await q("update users set password_hash = $1 where id = $2", [await hashPassword(password), id]);
      await q("delete from sessions where user_id = $1", [id]);
    }
  } else {
    if (password.length < 6) redirect("/app/team?error=pw");
    await q("insert into users (name, username, role, lang, color, password_hash) values ($1,$2,$3,$4,$5,$6)", [name, username, role, lang, color, await hashPassword(password)]);
  }
  revalidatePath("/app", "layout");
  redirect("/app/team?saved=1");
}

export async function setUserActive(fd: FormData) {
  const me = await requireAdmin();
  const id = s(fd, "id");
  if (id === me.id) return;
  const active = s(fd, "active") === "true";
  await q("update users set active = $1 where id = $2", [active, id]);
  if (!active) await q("delete from sessions where user_id = $1", [id]);
  revalidatePath("/app", "layout");
}

export async function updateProfile(fd: FormData) {
  const u = await requireUser();
  const lang = s(fd, "lang") === "nl" ? "nl" : "de";
  await q("update users set lang = $1 where id = $2", [lang, u.id]);
  const pw = s(fd, "new_password");
  if (pw) {
    const row = await q1<{ password_hash: string }>("select password_hash from users where id = $1", [u.id]);
    if (pw.length < 6 || !row || !(await bcrypt.compare(s(fd, "current_password"), row.password_hash))) redirect("/app/profile?error=1");
    await q("update users set password_hash = $1 where id = $2", [await hashPassword(pw), u.id]);
  }
  revalidatePath("/app", "layout");
  redirect("/app/profile?saved=1");
}

export async function updateDatabase() {
  await requireAdmin();
  await migrate();
  revalidatePath("/app", "layout");
  redirect("/app/team?saved=1");
}

/* ───────── Wochenfokus ───────── */
export async function addFocus(fd: FormData) {
  await requireAdmin();
  const text = s(fd, "text");
  const week = s(fd, "week");
  if (!text || !isDate(week)) return;
  const n = await q1<{ n: number }>("select count(*)::int as n from focus where week = $1", [week]);
  if ((n?.n ?? 0) >= 3) return;
  await q("insert into focus (week, text) values ($1,$2)", [week, text]);
  revalidatePath("/app", "layout");
}
export async function toggleFocus(fd: FormData) {
  const u = await requireUser();
  await q("update focus set done_by = case when done_by is null then $2::uuid else null end where id = $1", [s(fd, "id"), u.id]);
  revalidatePath("/app", "layout");
}
export async function deleteFocus(fd: FormData) {
  await requireAdmin();
  await q("delete from focus where id = $1", [s(fd, "id")]);
  revalidatePath("/app", "layout");
}

/* ───────── Markentagebuch ───────── */
export async function countOnline(fd: FormData) {
  const u = await requireUser();
  const date = s(fd, "date");
  if (!isDate(date)) return;
  await q("insert into journal (date, kind, user_id) values ($1,'online',$2)", [date, u.id]);
  revalidatePath("/app", "layout");
}
export async function addQuote(fd: FormData) {
  const u = await requireUser();
  const text = s(fd, "text");
  const date = s(fd, "date");
  if (!text || !isDate(date)) return;
  await q("insert into journal (date, kind, text, user_id) values ($1,'quote',$2,$3)", [date, text, u.id]);
  revalidatePath("/app", "layout");
}
export async function deleteJournal(fd: FormData) {
  await requireAdmin();
  await q("delete from journal where id = $1", [s(fd, "id")]);
  revalidatePath("/app", "layout");
}

/* ───────── Werkblokken (opdracht ↔ agenda) ───────── */
export async function savePlan(fd: FormData) {
  const u = await requireUser();
  const taskId = s(fd, "task_id");
  const date = s(fd, "date");
  if (!taskId || !isDate(date)) return;
  // Stagiairs plannen voor zichzelf; beheerders mogen voor iedereen plannen
  const userId = u.role === "admin" && s(fd, "user_id") ? s(fd, "user_id") : u.id;
  await q("insert into task_plans (task_id, user_id, date, start_time, end_time, note) values ($1,$2,$3,$4,$5,$6)", [taskId, userId, date, opt(fd, "start_time"), opt(fd, "end_time"), opt(fd, "note")]);
  await q("update tasks set status = 'doing', updated_at = now() where id = $1 and status = 'todo' and $2::date <= current_date", [taskId, date]);
  revalidatePath("/app", "layout");
  redirect(back(fd, `/app/tasks/${taskId}`));
}
export async function togglePlan(fd: FormData) {
  const u = await requireUser();
  if (u.role === "admin") await q("update task_plans set done = not done where id = $1", [s(fd, "id")]);
  else await q("update task_plans set done = not done where id = $1 and user_id = $2", [s(fd, "id"), u.id]);
  revalidatePath("/app", "layout");
}
export async function deletePlan(fd: FormData) {
  const u = await requireUser();
  if (u.role === "admin") await q("delete from task_plans where id = $1", [s(fd, "id")]);
  else await q("delete from task_plans where id = $1 and user_id = $2", [s(fd, "id"), u.id]);
  revalidatePath("/app", "layout");
}

/* ───────── Instagram-Zahlen & Ziele ───────── */
const int = (fd: FormData, k: string) => { const v = num(fd, k); return v === null ? null : Math.round(v); };
export async function saveSocialStats(fd: FormData) {
  const u = await requireUser();
  const date = s(fd, "date");
  if (!isDate(date)) return;
  await q(
    `insert into social_stats (date, followers, reach, interactions, profile_visits, note, user_id) values ($1,$2,$3,$4,$5,$6,$7)
     on conflict (date) do update set followers=excluded.followers, reach=excluded.reach, interactions=excluded.interactions, profile_visits=excluded.profile_visits, note=excluded.note, user_id=excluded.user_id`,
    [date, int(fd, "followers"), int(fd, "reach"), int(fd, "interactions"), int(fd, "profile_visits"), opt(fd, "note"), u.id],
  );
  revalidatePath("/app", "layout");
  redirect("/app/content");
}
export async function saveSocialGoals(fd: FormData) {
  const u = await requireUser();
  const month = s(fd, "month");
  if (!isDate(month)) return;
  await q(
    `insert into social_goals (month, followers, reach, interactions, posts, stories, note, updated_by) values ($1,$2,$3,$4,$5,$6,$7,$8)
     on conflict (month) do update set followers=excluded.followers, reach=excluded.reach, interactions=excluded.interactions, posts=excluded.posts, stories=excluded.stories, note=excluded.note, updated_by=excluded.updated_by`,
    [month, int(fd, "followers"), int(fd, "reach"), int(fd, "interactions"), int(fd, "posts"), int(fd, "stories"), opt(fd, "note"), u.id],
  );
  revalidatePath("/app", "layout");
  redirect("/app/content");
}

/* ───────── Wochenrückblick ───────── */
export async function saveReflection(fd: FormData) {
  const u = await requireUser();
  const week = s(fd, "week");
  if (!isDate(week)) return;
  const mood = Math.min(5, Math.max(1, Number(s(fd, "mood")) || 0)) || null;
  await q(
    `insert into reflections (user_id, week, learned, liked, hard, next, mood) values ($1,$2,$3,$4,$5,$6,$7)
     on conflict (user_id, week) do update set learned=excluded.learned, liked=excluded.liked, hard=excluded.hard, next=excluded.next, mood=excluded.mood, updated_at=now()`,
    [u.id, week, opt(fd, "learned"), opt(fd, "liked"), opt(fd, "hard"), opt(fd, "next"), mood],
  );
  revalidatePath("/app", "layout");
  redirect("/app/reflect?saved=1");
}
export async function saveReflectionFeedback(fd: FormData) {
  const u = await requireAdmin();
  await q("update reflections set feedback = $1, feedback_by = $2, feedback_at = now() where id = $3", [opt(fd, "feedback"), u.id, s(fd, "id")]);
  revalidatePath("/app", "layout");
}

/* ───────── Lernziele ───────── */
export async function setSkillLevel(fd: FormData) {
  const u = await requireUser();
  const level = Math.min(3, Math.max(0, Number(s(fd, "level")) || 0));
  const skillId = s(fd, "skill_id");
  if (u.role === "admin") {
    const target = s(fd, "user_id");
    if (!target) return;
    await q("insert into skill_levels (skill_id, user_id, confirmed, confirmed_by) values ($1,$2,$3,$4) on conflict (skill_id, user_id) do update set confirmed=excluded.confirmed, confirmed_by=excluded.confirmed_by, updated_at=now()", [skillId, target, level, u.id]);
  } else {
    await q("insert into skill_levels (skill_id, user_id, level) values ($1,$2,$3) on conflict (skill_id, user_id) do update set level=excluded.level, updated_at=now()", [skillId, u.id, level]);
  }
  revalidatePath("/app", "layout");
}
export async function saveSkill(fd: FormData) {
  await requireAdmin();
  const title = s(fd, "title_de");
  if (!title) return;
  await q("insert into skills (area, title_de, position) values ($1,$2,(select coalesce(max(position),0)+1 from skills))", [s(fd, "area") || "Laden", title]);
  revalidatePath("/app", "layout");
}
export async function deleteSkill(fd: FormData) {
  await requireAdmin();
  await q("delete from skills where id = $1", [s(fd, "id")]);
  revalidatePath("/app", "layout");
}

/* ───────── Abwesenheit ───────── */
async function applyAbsence(id: string) {
  const a = await q1<{ user_id: string; date: string; end_date: string | null; kind: string; note: string | null }>("select user_id, date, end_date, kind, note from absences where id = $1", [id]);
  if (!a) return;
  const label = a.kind === "sick" ? "krank" : a.kind === "school" ? "Schule" : "frei";
  for (let d = a.date, i = 0; d <= (a.end_date || a.date) && i < 60; d = addDays(d, 1), i++) {
    if (weekday(d) === 7) continue;
    await q(
      `insert into shifts (user_id, date, kind, note) values ($1,$2,$3,$4)
       on conflict (user_id, date) do update set kind=excluded.kind, start_time=null, end_time=null, break_start=null, break_end=null, note=excluded.note`,
      [a.user_id, d, a.kind === "school" ? "school" : "off", a.note ? `${label}: ${a.note}` : label],
    );
  }
}
export async function requestAbsence(fd: FormData) {
  const u = await requireUser();
  const date = s(fd, "date");
  if (!isDate(date)) return;
  const end = isDate(opt(fd, "end_date")) && s(fd, "end_date") > date ? s(fd, "end_date") : null;
  const kind = ["free", "school", "sick", "other"].includes(s(fd, "kind")) ? s(fd, "kind") : "free";
  const userId = u.role === "admin" && s(fd, "user_id") ? s(fd, "user_id") : u.id;
  // Krankmeldung gilt sofort; alles andere muss freigegeben werden
  const status = kind === "sick" || u.role === "admin" ? "approved" : "requested";
  const row = await q1<{ id: string }>("insert into absences (user_id, date, end_date, kind, note, status, decided_by) values ($1,$2,$3,$4,$5,$6,$7) returning id", [userId, date, end, kind, opt(fd, "note"), status, u.role === "admin" ? u.id : null]);
  if (status === "approved") await applyAbsence(row!.id);
  revalidatePath("/app", "layout");
  redirect("/app/absence?saved=1");
}
export async function decideAbsence(fd: FormData) {
  const u = await requireAdmin();
  const status = s(fd, "status") === "approved" ? "approved" : "declined";
  await q("update absences set status = $1, decided_by = $2 where id = $3", [status, u.id, s(fd, "id")]);
  if (status === "approved") await applyAbsence(s(fd, "id"));
  revalidatePath("/app", "layout");
}
export async function deleteAbsence(fd: FormData) {
  const u = await requireUser();
  if (u.role === "admin") await q("delete from absences where id = $1", [s(fd, "id")]);
  else await q("delete from absences where id = $1 and user_id = $2 and status = 'requested'", [s(fd, "id"), u.id]);
  revalidatePath("/app", "layout");
}

/* ───────── Tagescheckliste ───────── */
export async function toggleDaily(fd: FormData) {
  const u = await requireUser();
  const date = s(fd, "date");
  const key = s(fd, "key");
  if (!isDate(date) || !/^[a-z_]{1,30}$/.test(key)) return;
  const has = await q1("select 1 from daily_checks where date = $1 and key = $2", [date, key]);
  if (has) await q("delete from daily_checks where date = $1 and key = $2", [date, key]);
  else await q("insert into daily_checks (date, key, user_id) values ($1,$2,$3) on conflict do nothing", [date, key, u.id]);
  revalidatePath("/app", "layout");
}
