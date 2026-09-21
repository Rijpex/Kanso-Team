import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { T, URGENCY, lbl } from "@/lib/i18n";
import { dateTime } from "@/lib/dates";
import { Avatar, Empty, PageHeader } from "@/components/ui";
import { Submit } from "@/components/client";
import { askQuestion } from "../actions";

export default async function Questions() {
  const user = await requireUser();
  const tr = T(user.lang);
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
      {!rows.length && <Empty>{tr("Noch keine Fragen.", "Nog geen vragen.")}</Empty>}
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={`/app/questions/${r.id}`} className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-sand-200 hover:ring-brand">
              <Avatar name={r.name || "?"} color={r.color} />
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{r.title}</span><span className="text-xs text-stone-500">{r.name} · {dateTime(r.created_at, user.lang)} · {r.n} {tr("Antworten", "reacties")}</span></span>
              {r.status === "open" && r.urgency !== "checkin" && <span className={`badge ${URGENCY[r.urgency]?.color}`}>{lbl(user.lang, URGENCY[r.urgency])}</span>}
              <span className={`badge ${r.status === "open" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{r.status === "open" ? tr("Offen", "Open") : tr("Beantwortet", "Beantwoord")}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
