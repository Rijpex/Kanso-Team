import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { REQUEST_KIND, T, lbl } from "@/lib/i18n";
import { shortDate, today } from "@/lib/dates";
import { Badge, Empty, PageHeader } from "@/components/ui";
import { ConfirmSubmit, Submit } from "@/components/client";
import { deleteCustomerRequest, saveCustomerRequest, toggleCustomerRequest } from "../actions";

type R = { id: string; date: string; kind: string; text: string; product: string | null; answer: string | null; action_needed: boolean; action_note: string | null; status: string; name: string | null };

export default async function CustomerRequests({ searchParams }: { searchParams: { edit?: string; all?: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const isAdmin = user.role === "admin";
  const showAll = searchParams.all === "1";
  const [rows, online] = await Promise.all([
    q<R>(`select r.*, u.name from customer_requests r left join users u on u.id = r.user_id order by (r.status = 'open') desc, r.date desc, r.created_at desc limit ${showAll ? 500 : 60}`),
    q<{ week: string; n: number }>("select date_trunc('week', date)::date::text as week, count(*)::int as n from journal where kind = 'online' group by 1 order by 1 desc limit 8"),
  ]);
  const editing = searchParams.edit ? rows.find((r) => r.id === searchParams.edit) : undefined;
  const open = rows.filter((r) => r.status === "open");
  const done = rows.filter((r) => r.status !== "open");
  const max = Math.max(1, ...online.map((o) => o.n));

  const Item = ({ r }: { r: R }) => (
    <li className={`rounded-xl bg-white p-3 ring-1 ring-sand-200 ${r.status === "done" ? "opacity-80" : ""}`}>
      <div className="flex items-start gap-3">
        <form action={toggleCustomerRequest} className="pt-0.5"><input type="hidden" name="id" value={r.id} />
          <button className={`h-5 w-5 rounded-md border text-xs ${r.status === "done" ? "border-brand bg-brand text-white" : "border-sand-300 bg-white hover:border-brand"}`} title={tr(r.status === "done" ? "Wieder öffnen" : "Erledigt", r.status === "done" ? "Weer openen" : "Afgehandeld")}>{r.status === "done" ? "✓" : ""}</button>
        </form>
        <div className="min-w-0 flex-1 text-sm">
          <div className="flex flex-wrap items-center gap-2"><Badge l={REQUEST_KIND[r.kind]} lang={user.lang} />{r.product && <span className="font-medium">{r.product}</span>}<span className="text-xs text-stone-400">{shortDate(r.date, user.lang)}{r.name ? ` · ${r.name}` : ""}</span></div>
          <p className={`mt-1 ${r.kind === "quote" ? "italic" : ""}`}>{r.kind === "quote" ? `„${r.text}“` : r.text}</p>
          {r.answer && <p className="mt-1 text-stone-600"><span className="text-xs uppercase tracking-wide text-stone-400">{tr("Geantwortet", "Geantwoord")}: </span>{r.answer}</p>}
          {r.action_needed && <p className="mt-1 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-900">→ {r.action_note || tr("Daraus sollten wir etwas machen.", "Hier moeten we iets mee doen.")}</p>}
        </div>
        <div className="flex shrink-0 gap-1 text-xs">
          <Link href={`/app/journal?edit=${r.id}`} className="btn-ghost btn-sm">{tr("Ändern", "Wijzig")}</Link>
          {isAdmin && <form action={deleteCustomerRequest}><input type="hidden" name="id" value={r.id} /><ConfirmSubmit className="px-2 text-stone-300 hover:text-red-600" confirm="?">×</ConfirmSubmit></form>}
        </div>
      </div>
    </li>
  );

  return (
    <div className="max-w-3xl">
      <PageHeader title={tr("Kundenfragen", "Klantvragen")} sub={tr("Was Kundinnen und Kunden fragen, suchen oder sagen – aufschreiben, damit wir später etwas daraus machen können.", "Wat klanten vragen, zoeken of zeggen – opschrijven, zodat we er later iets mee kunnen doen.")} />

      <section className="card mb-5">
        <h2 className="mb-1">{editing ? tr("Eintrag ändern", "Invoer wijzigen") : tr("Neu aufschreiben", "Nieuw vastleggen")}</h2>
        <p className="mb-3 text-xs text-stone-500">{tr("Kurz reicht: Was wurde gefragt, zu welchem Produkt, was haben wir geantwortet. Hake „Daraus sollten wir etwas machen“ an, wenn Bas oder Lea sich das anschauen sollen.", "Kort is genoeg: wat werd gevraagd, over welk product, wat hebben we geantwoord. Vink \"hier moeten we iets mee\" aan als Bas of Lea ernaar moeten kijken.")}</p>
        <form action={saveCustomerRequest} className="space-y-3 text-sm" key={editing?.id || `new-${rows.length}`}>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <input type="hidden" name="back" value="/app/journal" />
          <div className="grid gap-3 sm:grid-cols-3">
            <div><label className="label">{tr("Art", "Soort")}</label>
              <select name="kind" className="input" defaultValue={editing?.kind || "question"}>{Object.entries(REQUEST_KIND).map(([k, l]) => <option key={k} value={k}>{lbl(user.lang, l)}</option>)}</select></div>
            <div><label className="label">{tr("Datum", "Datum")}</label><input type="date" name="date" className="input" defaultValue={editing?.date || today()} required /></div>
            <div><label className="label">{tr("Produkt / Thema", "Product / onderwerp")}</label><input name="product" className="input" defaultValue={editing?.product || ""} placeholder={tr("z. B. Tenderflame, Pergola, Gewürze", "bv. Tenderflame, pergola, spices")} /></div>
          </div>
          <div><label className="label">{tr("Was hat die Kundin / der Kunde gefragt oder gesagt?", "Wat vroeg of zei de klant?")}</label><textarea name="text" className="input" rows={2} required defaultValue={editing?.text || ""} placeholder={tr("„Habt ihr das auch in Grün?“ · „Kann man die Tischfeuer draußen stehen lassen?“", "\"Hebben jullie dit ook in groen?\" · \"Kan het tafelvuur buiten blijven staan?\"")} /></div>
          <div><label className="label">{tr("Was haben wir geantwortet? (optional)", "Wat hebben we geantwoord? (optioneel)")}</label><input name="answer" className="input" defaultValue={editing?.answer || ""} /></div>
          <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
            <label className="flex items-center gap-2"><input type="checkbox" name="action_needed" defaultChecked={editing?.action_needed ?? true} /> {tr("Daraus sollten wir etwas machen", "Hier moeten we iets mee")}</label>
            <input name="action_note" className="input" defaultValue={editing?.action_note || ""} placeholder={tr("z. B. Lieferant fragen, ins Sortiment prüfen, FAQ auf der Website", "bv. leverancier vragen, in assortiment bekijken, FAQ op de website")} />
          </div>
          <div className="flex gap-2"><Submit>{editing ? tr("Speichern", "Opslaan") : tr("Aufschreiben", "Vastleggen")}</Submit>{editing && <Link href="/app/journal" className="btn-ghost">{tr("Abbrechen", "Annuleren")}</Link>}</div>
        </form>
      </section>

      <h2 className="mb-2">{tr("Offen – daraus etwas machen", "Open – hier iets mee doen")} <span className="text-sm font-normal text-stone-400">{open.length}</span></h2>
      {!open.length && <Empty>{tr("Nichts offen. Sobald eine Frage aufkommt, die wir nicht sofort beantworten können: hier eintragen.", "Niets open. Zodra een vraag opkomt die we niet direct kunnen beantwoorden: hier invoeren.")}</Empty>}
      <ul className="space-y-2">{open.map((r) => <Item key={r.id} r={r} />)}</ul>

      <h2 className="mb-2 mt-6">{tr("Erledigt / nur notiert", "Afgehandeld / alleen genoteerd")} <span className="text-sm font-normal text-stone-400">{done.length}</span></h2>
      {!done.length && <p className="text-sm text-stone-500">{tr("Noch nichts.", "Nog niets.")}</p>}
      <ul className="space-y-2">{done.map((r) => <Item key={r.id} r={r} />)}</ul>
      {!showAll && rows.length >= 60 && <p className="mt-2 text-sm"><Link href="/app/journal?all=1" className="text-brand hover:underline">{tr("Alle anzeigen", "Alles tonen")}</Link></p>}

      {online.length > 0 && (
        <section className="card mt-6">
          <h2 className="mb-1">{tr("Online-Anfragen pro Woche", "Online-aanvragen per week")}</h2>
          <p className="mb-3 text-xs text-stone-500">{tr("„Kann ich das online bestellen?“ – auf der Heute-Seite mit +1 gezählt.", "\"Kan ik dat online bestellen?\" – op Vandaag met +1 geteld.")}</p>
          <ul className="space-y-1.5 text-sm">
            {online.map((o) => (
              <li key={o.week} className="flex items-center gap-3"><span className="w-28 shrink-0 text-stone-500">{tr("ab", "vanaf")} {shortDate(o.week, user.lang)}</span><span className="h-3 rounded-full bg-brand" style={{ width: `${(o.n / max) * 70}%` }} /><span className="tabular-nums">{o.n}</span></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
