import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/server/auth";
import { q, q1 } from "@/lib/server/db";
import { IDEA_STATUS, T, lbl } from "@/lib/i18n";
import { calc, eur, IDEA_CHECKS } from "@/lib/ideas";
import { BackLink, Badge } from "@/components/ui";
import { Comments, type CommentRow } from "@/components/Comments";
import { IdeaForm, type Idea } from "@/components/IdeaForm";
import { ConfirmSubmit } from "@/components/client";
import { deleteIdea, setIdeaStatus } from "../../actions";

export default async function IdeaPage({ params, searchParams }: { params: { id: string }; searchParams: { edit?: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const r = await q1<Idea & { uname: string | null }>("select i.*, u.name as uname from ideas i left join users u on u.id = i.user_id where i.id = $1", [params.id]).catch(() => null);
  if (!r) notFound();
  const comments = await q<CommentRow>("select c.id, c.body, c.created_at, c.user_id, u.name, u.color, u.role from comments c left join users u on u.id = c.user_id where c.idea_id = $1 order by c.created_at", [r.id]);
  const c = calc(r.ek, r.vk, r.vat, r.extra_cost, r.moq);
  const canEdit = user.role === "admin" || r.user_id === user.id;
  const statuses = Object.keys(IDEA_STATUS).filter((k) => user.role === "admin" || !["approved", "rejected"].includes(k) || k === r.status);
  const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (v ? <div className="flex justify-between gap-4 border-b border-sand-200 py-1.5 text-sm last:border-0"><span className="text-stone-500">{k}</span><span className="text-right font-medium">{v}</span></div> : null);

  if (searchParams.edit && canEdit) {
    return (<div className="max-w-2xl"><BackLink href={`/app/ideas/${r.id}`} label={r.name} /><h1 className="mb-4">{tr("Idee bearbeiten", "Idee bewerken")}</h1><div className="card"><IdeaForm lang={user.lang} idea={r} /></div></div>);
  }
  return (
    <div className="max-w-3xl">
      <BackLink href="/app/ideas" label={tr("Produktideen", "Productideeën")} />
      <div className="flex items-start justify-between gap-3">
        <div><h1>{r.name}</h1><p className="muted mt-0.5">{r.uname}{r.supplier ? ` · ${r.supplier}` : ""}{r.world ? ` · ${r.world}` : ""}</p></div>
        {canEdit && <Link href={`/app/ideas/${r.id}?edit=1`} className="btn-ghost btn-sm shrink-0">{tr("Bearbeiten", "Bewerken")}</Link>}
      </div>
      <form action={setIdeaStatus} className="mt-3 flex flex-wrap gap-1.5"><input type="hidden" name="id" value={r.id} />
        {statuses.map((k) => <button key={k} name="status" value={k} className={`btn btn-sm ${r.status === k ? "bg-ink text-white" : "bg-white text-stone-600 ring-1 ring-sand-300 hover:bg-sand-100"}`}>{lbl(user.lang, IDEA_STATUS[k])}</button>)}
      </form>
      {user.role !== "admin" && <p className="mt-1 text-xs text-stone-500">{tr("„Machen wir!“ und „Passt nicht“ entscheiden Lea und Bas.", "\"Gaan we doen!\" en \"Past niet\" beslissen Lea en Bas.")}</p>}

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <section className="card">
          <h2 className="mb-2">{tr("Kalkulation", "Calculatie")}</h2>
          {c ? (<>
            <Row k={tr("Einkauf pro Stück (netto)", "Inkoop per stuk (netto)")} v={eur(r.ek!)} />
            <Row k={tr("+ Versand, Zoll, Verpackung", "+ verzending, invoer, verpakking")} v={r.extra_cost ? eur(r.extra_cost) : null} />
            <Row k={tr("Einstandspreis", "Kostprijs")} v={eur(c.landed)} />
            <Row k={tr(`Verkaufspreis (brutto, ${r.vat} % MwSt)`, `Verkoopprijs (bruto, ${r.vat} % btw)`)} v={eur(r.vk!)} />
            <Row k="VK netto" v={eur(c.net)} />
            <Row k={tr("Marge pro Stück", "Marge per stuk")} v={<span className={c.margin > 0 ? "" : "text-red-700"}>{eur(c.margin)} · {c.pct.toFixed(0)} %</span>} />
            <Row k={tr("Faktor (VK ÷ EK)", "Factor (VK ÷ EK)")} v={c.factor.toFixed(1)} />
            <Row k={tr("Mindestbestellmenge", "Minimale afname")} v={r.moq ? `${r.moq} ${tr("Stück", "stuks")}` : null} />
            <Row k={tr("Erste Bestellung kostet", "Eerste bestelling kost")} v={c.invest != null ? eur(c.invest) : null} />
            <Row k={tr("Geld wieder drin nach", "Geld terug na")} v={c.breakEven != null ? `${c.breakEven} ${tr("verkauften Stück", "verkochte stuks")}` : null} />
            <Row k={tr("Wenn alles verkauft ist, bleiben", "Als alles verkocht is, blijft")} v={c.profitAll != null ? eur(c.profitAll) : null} />
            <Row k={tr("Günstigster Preis online", "Laagste prijs online")} v={r.online_price ? <span className={r.vk! > r.online_price ? "text-amber-700" : ""}>{eur(r.online_price)}</span> : null} />
          </>) : <p className="text-sm text-stone-500">{tr("Noch keine Preise eingetragen.", "Nog geen prijzen ingevuld.")}</p>}
        </section>
        <section className="card">
          <h2 className="mb-2">KANSO-Check · {r.checks.length}/{IDEA_CHECKS.length}</h2>
          <ul className="space-y-1.5 text-sm">{IDEA_CHECKS.map((k) => { const ok = r.checks.includes(k.key); return <li key={k.key} className={`flex items-start gap-2 ${ok ? "" : "text-stone-400"}`}><span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] ${ok ? "bg-emerald-600 text-white" : "bg-sand-200"}`}>{ok ? "✓" : ""}</span>{user.lang === "nl" ? k.nl : k.de}</li>; })}</ul>
          <div className="mt-3"><Row k={tr("Muster gesehen", "Sample gezien")} v={r.sample ? tr("ja", "ja") : tr("noch nicht", "nog niet")} /><Row k={tr("Lieferzeit", "Levertijd")} v={r.lead_time} /><Row k={tr("Saison", "Seizoen")} v={r.season} /></div>
        </section>
      </div>
      <section className="card mt-5 space-y-3 text-sm">
        {r.occasion && <div><div className="label">{tr("Für wen und zu welchem Anlass", "Voor wie en welke gelegenheid")}</div>{r.occasion}</div>}
        {r.why && <div><div className="label">{tr("Warum passt es zu KANSO", "Waarom past het bij KANSO")}</div><span className="whitespace-pre-wrap">{r.why}</span></div>}
        {r.packaging && <div><div className="label">{tr("Verpackung", "Verpakking")}</div>{r.packaging}</div>}
        {r.link && /^https?:\/\//i.test(r.link) && <a href={r.link} target="_blank" rel="noreferrer" className="block truncate text-brand underline">{r.link}</a>}
        {!r.occasion && !r.why && !r.packaging && !r.link && <span className="text-stone-500">{tr("Noch keine Beschreibung.", "Nog geen omschrijving.")}</span>}
      </section>
      <section className="card mt-5"><h2 className="mb-3">{tr("Besprechen", "Bespreken")}</h2><Comments rows={comments} lang={user.lang} me={user} target={{ idea_id: r.id }} placeholder={tr("Frage, Einwand oder Feedback …", "Vraag, bezwaar of feedback …")} /></section>
      {canEdit && <form action={deleteIdea} className="mt-6"><input type="hidden" name="id" value={r.id} /><ConfirmSubmit confirm={tr("Wirklich löschen?", "Echt verwijderen?")}>{tr("Idee löschen", "Idee verwijderen")}</ConfirmSubmit></form>}
    </div>
  );
}
