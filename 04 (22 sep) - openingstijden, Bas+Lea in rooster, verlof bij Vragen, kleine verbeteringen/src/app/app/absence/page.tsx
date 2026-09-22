import { requireUser } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { team } from "@/lib/server/queries";
import { T } from "@/lib/i18n";
import { shortDate, today } from "@/lib/dates";
import { Avatar, Empty, PageHeader } from "@/components/ui";
import { ConfirmSubmit, Submit } from "@/components/client";
import { decideAbsence, deleteAbsence, requestAbsence } from "../actions";

const KIND = { free: { de: "Frei / Urlaub", nl: "Vrij / vakantie" }, school: { de: "Schule / Prüfung", nl: "School / toets" }, sick: { de: "Krank", nl: "Ziek" }, other: { de: "Sonstiges", nl: "Overig" } } as const;
const STATUS = { requested: { de: "Angefragt", nl: "Aangevraagd", c: "bg-amber-100 text-amber-800" }, approved: { de: "Genehmigt", nl: "Goedgekeurd", c: "bg-emerald-100 text-emerald-800" }, declined: { de: "Abgelehnt", nl: "Afgewezen", c: "bg-red-100 text-red-700" } } as const;

export default async function Absence({ searchParams }: { searchParams: { saved?: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const isAdmin = user.role === "admin";
  const [rows, users] = await Promise.all([
    q<{ id: string; user_id: string; date: string; end_date: string | null; kind: keyof typeof KIND; note: string | null; status: keyof typeof STATUS; name: string; color: string }>(
      `select a.*, u.name, u.color from absences a join users u on u.id = a.user_id where ${isAdmin ? "true" : "a.user_id = $1"} order by (a.status = 'requested') desc, a.date desc limit 100`, isAdmin ? [] : [user.id]),
    team(),
  ]);
  return (
    <div className="max-w-3xl">
      <PageHeader title={tr("Abwesenheit", "Afwezigheid")} sub={tr("Frei, Klausur, Schulveranstaltung: bitte so früh wie möglich eintragen, mindestens zwei Wochen vorher. Nach der Freigabe steht es automatisch im Dienstplan.", "Vrij, toets, schoolactiviteit: graag zo vroeg mogelijk invullen, minstens twee weken vooraf. Na goedkeuring staat het automatisch in het rooster.")} />
      {searchParams.saved && <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{tr("Eingetragen.", "Ingevuld.")}</p>}
      <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{tr("Krank? Bitte zuerst Lea anrufen oder per WhatsApp schreiben (+49 1523 3836673), am besten vor 9 Uhr – und danach hier eintragen. Die Schule informierst du selbst.", "Ziek? Eerst Lea bellen of appen (+49 1523 3836673), liefst voor 9 uur – en daarna hier invullen. School informeer je zelf.")}</p>
      <form action={requestAbsence} className="card mb-6 grid gap-3 sm:grid-cols-2" key={rows.length}>
        {isAdmin && <div className="sm:col-span-2"><label className="label">{tr("Für wen", "Voor wie")}</label><select name="user_id" className="input">{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>}
        <div><label className="label">{tr("Von", "Van")}</label><input type="date" name="date" className="input" defaultValue={today()} required /></div>
        <div><label className="label">{tr("Bis (optional)", "T/m (optioneel)")}</label><input type="date" name="end_date" className="input" /></div>
        <div><label className="label">{tr("Grund", "Reden")}</label><select name="kind" className="input">{Object.entries(KIND).map(([k, l]) => <option key={k} value={k}>{user.lang === "nl" ? l.nl : l.de}</option>)}</select></div>
        <div><label className="label">{tr("Notiz", "Notitie")}</label><input name="note" className="input" /></div>
        <div><Submit>{isAdmin ? tr("Eintragen", "Invoeren") : tr("Anfragen", "Aanvragen")}</Submit></div>
      </form>
      {!rows.length && <Empty>{tr("Keine Einträge.", "Geen invoer.")}</Empty>}
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-3 text-sm ring-1 ring-sand-200">
            <Avatar name={r.name} color={r.color} size="h-6 w-6 text-[10px]" /><b>{r.name}</b>
            <span className="capitalize">{shortDate(r.date, user.lang)}{r.end_date ? ` – ${shortDate(r.end_date, user.lang)}` : ""}</span>
            <span className="text-stone-500">{user.lang === "nl" ? KIND[r.kind].nl : KIND[r.kind].de}{r.note ? ` · ${r.note}` : ""}</span>
            <span className={`badge ml-auto ${STATUS[r.status].c}`}>{user.lang === "nl" ? STATUS[r.status].nl : STATUS[r.status].de}</span>
            {isAdmin && r.status === "requested" && <form action={decideAbsence} className="flex gap-1"><input type="hidden" name="id" value={r.id} /><button name="status" value="approved" className="btn-primary btn-sm">{tr("Genehmigen", "Goedkeuren")}</button><button name="status" value="declined" className="btn-ghost btn-sm">{tr("Ablehnen", "Afwijzen")}</button></form>}
            {(isAdmin || r.status === "requested") && <form action={deleteAbsence}><input type="hidden" name="id" value={r.id} /><ConfirmSubmit className="px-1 text-stone-300 hover:text-red-600" confirm="?">×</ConfirmSubmit></form>}
          </li>
        ))}
      </ul>
    </div>
  );
}
