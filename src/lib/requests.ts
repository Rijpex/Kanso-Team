import { IDEA_STAGE, LEAD_STAGE, type Lang } from "./i18n";

/** Leads, Kundenfragen und Ideen teilen sich eine Tabelle (customer_requests); hier das Gemeinsame. */
export type Tab = "lead" | "question" | "idea";
export const TABS: Tab[] = ["lead", "question", "idea"];
export const tabOf = (kind: string): Tab => (kind === "lead" ? "lead" : kind === "idea" ? "idea" : "question");
export const stageOptions = (kind: string) => (kind === "lead" ? LEAD_STAGE : IDEA_STAGE);
export const CLOSED_STAGES = ["won", "lost", "doing", "later", "no"];

export type Activity = { request_id: string; n: number; last_at: string | null; last_by: string | null; last_name: string | null; last_role: string | null; last_body: string | null };

/** Titel eines Eintrags: Lead = Name, Idee = Satz, Frage = Text */
export function requestTitle(r: { kind: string; text: string; contact_name?: string | null; title?: string | null }) {
  return r.kind === "lead" ? r.contact_name || r.text : r.kind === "idea" ? r.title || r.text : r.text;
}

/** Gibt es für diese Person etwas Neues an dem Eintrag? (Antwort von jemand anderem oder Status von jemand anderem gesetzt, nach dem eigenen letzten Beitrag) */
export function isNewFor(me: { id: string }, r: { user_id: string | null; stage_at: string | null; stage_by: string | null; created_at: string }, a?: Activity, myLastAt?: string | null): "reply" | "stage" | null {
  const mine = myLastAt ? new Date(myLastAt).getTime() : new Date(r.created_at).getTime();
  if (a?.last_at && a.last_by && a.last_by !== me.id && new Date(a.last_at).getTime() > mine) return "reply";
  if (r.stage_at && r.stage_by && r.stage_by !== me.id && r.user_id === me.id && new Date(r.stage_at).getTime() > mine) return "stage";
  return null;
}

export const tabLabel = (lang: Lang): Record<Tab, string> => (lang === "nl" ? { lead: "Leads", question: "Klantvragen", idea: "Ideeën" } : { lead: "Leads", question: "Kundenfragen", idea: "Ideen" });
