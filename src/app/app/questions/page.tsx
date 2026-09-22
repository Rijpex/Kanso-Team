import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { T, URGENCY, lbl } from "@/lib/i18n";
import { dateTime, shortDate, today } from "@/lib/dates";
import { Avatar, Empty, PageHeader } from "@/components/ui";
import { Submit } from "@/components/client";
import { askQuestion, requestAbsence } from "../actions";

export default async function Questions() {
  const user = await requireUser();
  const tr = T(user.lang);
  const absences = await q<{ id: string; date: string; end_date: string | null; kind: string; status: string }>("select id, date, end_date, kind, status from absences where user_id = $1 and coalesce(end_date, date) >= current_date order by date limit 5", [user.id]);
  const rows = await q<{ id: string; title: string; status: string; urgency: string; created_at: string; name: string | null; color: string | null; n: number }>(
    `select qu.id, qu.title, qu.status, qu.urgency, qu.created_at, u.name, u.color, (select count(*)::int from comments c where c.question_id = qu.id) as n
       from questions qu left join users u on u.id = qu.user_id order by (qu.status = 'open') desc, qu.created_at desc limit 100`);
  return (
    <div className="max-w-3xl">
      <PageHeader title={tr("Fragen", "Vragen")} sub={tr("Es gibt keine dummen Fragen. Schreib einfach – Bas oder Lea antworten.", "Domme vragen bestaan niet. Schrijf het gewoon op – Bas of Lea antwoorden.")} />
      <form action={askQuestion} className="card mb-5 space-y-3">
        <input name="title" className="input" placeholder={tr("Deine Frage in einem Satz …", "Je vraag in één zin …")} required />
        <textarea name="body" className="input" rows={2} placeholder={tr("Mehr Details (optional)", "Meer details (optioneel)")} />
        <div className="flex flex-wrap items-center gap-2">
          <select name="urgency" className="input !w-auto" defaultValue="checkin">{Object.entries(URGENCY).map(([k, l]) => <option key={k} value={k}>{lbl(user.lang, l)}</option>)}</select>
          <Submit>{tr("Frage stellen", "Vraag stellen")}</Submit>
        </div>
        <p className="text-xs text-stone-500">{tr("Kunde wartet, Kasse streikt, jemand ist verletzt? Nicht schreiben – Lea anrufen: +49 1523 3836673.", "Klant wacht, kassa hapert, iemand gewond? Niet schrijven – Lea bellen: +49 1523 3836673.")}</p>
      </form>
      <section className="card mb-5">
        <div className="flex items-baseline justify-between"><h2>{tr("Urlaub & Frei", "Vakantie & verlof")}</h2><Link href="/app/absence" className="text-sm text-brand hover:underline">{tr("Alle Anfragen", "Alle aanvragen")} →</Link></div>
        <p className="muted mb-3">{tr("Urlaub, Klausur, Schulveranstaltung – möglichst zwei Wochen vorher. Nach der Freigabe steht es automatisch im Dienstplan.", "Vakantie, toets, schoolactiviteit – liefst twee weken vooraf. Na goedkeuring staat het automatisch in het rooster.")}</p>
        <form action={requestAbsence} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]" key={absences.length}><input type="hidden" name="back" value="/app/questions" />
          <div><label className="label">{tr("Von", "Van")}</label><input type="date" name="date" className="input" defaultValue={today()} required /></div>
          <div><label className="label">{tr("Bis", "T/m")}</label><input type="date" name="end_date" className="input" /></div>
          <div><label className="label">{tr("Grund", "Reden")}</label><select name="kind" className="input"><option value="free">{tr("Urlaub / frei", "Vakantie / vrij")}</option><option value="school">{tr("Schule / Klausur", "School / toets")}</option><option value="other">{tr("Sonstiges", "Overig")}</option></select></div>
          <div><label className="label">{tr("Notiz", "Notitie")}</label><input name="note" className="input" /></div>
          <div className="flex items-end"><Submit className="btn-ghost">{tr("Anfragen", "Aanvragen")}</Submit></div>
        </form>
        {absences.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2 text-xs">
            {absences.map((a) => <li key={a.id} className={`badge ${a.status === "approved" ? "bg-emerald-100 text-emerald-800" : a.status === "declined" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>{shortDate(a.date, user.lang)}{a.end_date ? `–${shortDate(a.end_date, user.lang)}` : ""} · {a.status === "approved" ? tr("genehmigt", "goedgekeurd") : a.status === "declined" ? tr("abgelehnt", "afgewezen") : tr("angefragt", "aangevraagd")}</li>)}
          </ul>
        )}
      </section>
      <h2 className="mb-2">{tr("Fragen", "Vragen")}</h2>
      {!rows.length && <Empty>{tr("Noch keine Fragen.", "Nog geen vragen.")}</Empty>}
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={`/app/questions/${r.id}`} className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-sand-200 hover:ring-brand">
              <Avatar name={r.name || "?"} color={r.color} />
              <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{r.title}</span><span className="text-xs text-stone-500">{r.name} · {dateTime(r.created_at, user.lang)} · {r.n} {tr("Antworten", "reacties")}</span></span>
              {r.status === "open" && r.urgency !== "checkin" && <span className={`badge ${URGENCY[r.urgency]?.color}`}>{lbl(user.lang, URGENCY[r.urgency])}</span>}
              <span className={`badge ${r.status === "open" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{r.status === "open" ? tr("Offen", "Open") : tr("Beantwortet", "Beantwoord")}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
