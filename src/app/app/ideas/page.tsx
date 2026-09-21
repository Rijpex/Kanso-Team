import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { IDEA_STATUS, T, lbl } from "@/lib/i18n";
import { Avatar, Badge, Empty, PageHeader } from "@/components/ui";
import { AutoSubmitSelect, ConfirmSubmit, Submit } from "@/components/client";
import { MarginFields } from "@/components/MarginCalc";
import { deleteIdea, saveIdea, setIdeaStatus } from "../actions";

type Row = { id: string; user_id: string | null; name: string; supplier: string | null; link: string | null; ek: number | null; vk: number | null; vat: number; moq: number | null; packaging: string | null; why: string | null; status: string; uname: string | null; color: string | null };
const eur = (x: number) => x.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

export default async function Ideas({ searchParams }: { searchParams: { edit?: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const rows = await q<Row>("select i.*, u.name as uname, u.color from ideas i left join users u on u.id = i.user_id order by i.created_at desc");
  const editing = rows.find((r) => r.id === searchParams.edit);
  const statuses = Object.keys(IDEA_STATUS).filter((k) => user.role === "admin" || !["approved", "rejected"].includes(k));

  return (
    <div>
      <PageHeader title={tr("Produktideen", "Productideeën")} sub={tr("Was würde gut zu Kansō passen? Trag Ideen ein – der Hub rechnet die Marge aus, dann besprechen wir sie zusammen.", "Wat zou goed bij Kansō passen? Zet ideeën erin – de hub rekent de marge uit, daarna bespreken we ze samen.")}>
        <Link href="/app/kb/preise-kalkulieren" className="btn-ghost btn-sm">{tr("Wie rechnet man Marge?", "Hoe reken je marge uit?")}</Link>
      </PageHeader>
      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <section className="space-y-2">
          {!rows.length && <Empty>{tr("Noch keine Ideen. Trag rechts die erste ein!", "Nog geen ideeën. Zet rechts de eerste erin!")}</Empty>}
          {rows.map((r) => {
            const net = r.vk ? r.vk / (1 + r.vat / 100) : null;
            const m = net && r.ek ? net - r.ek : null;
            const pct = m && net ? (m / net) * 100 : null;
            return (
              <div key={r.id} className="rounded-xl bg-white p-3 ring-1 ring-sand-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{r.name}</span>
                  <Badge l={IDEA_STATUS[r.status]} lang={user.lang} />
                  {r.uname && <span className="ml-auto"><Avatar name={r.uname} color={r.color} size="h-6 w-6 text-[10px]" /></span>}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-stone-600">
                  {r.supplier && <span>{tr("Lieferant", "Leverancier")}: {r.supplier}</span>}
                  {r.ek != null && <span>EK {eur(r.ek)}</span>}
                  {r.vk != null && <span>VK {eur(r.vk)}</span>}
                  {pct != null && m != null && <span className="font-semibold">{tr("Marge", "Marge")} {eur(m)} · {pct.toFixed(0)} % · {tr("Faktor", "factor")} {(r.vk! / r.ek!).toFixed(1)}</span>}
                  {r.moq != null && <span>MOQ {r.moq}{r.ek != null ? ` (= ${eur(r.moq * r.ek)})` : ""}</span>}
                </div>
                {r.why && <p className="mt-1.5 whitespace-pre-wrap text-sm text-stone-700">{r.why}</p>}
                {r.packaging && <p className="mt-1 text-sm text-stone-500">{tr("Verpackung", "Verpakking")}: {r.packaging}</p>}
                {r.link && /^https?:\/\//i.test(r.link) && <a href={r.link} target="_blank" rel="noreferrer" className="mt-1 block truncate text-sm text-brand underline">{r.link}</a>}
                <div className="mt-2 flex items-center gap-2">
                  <form action={setIdeaStatus}><input type="hidden" name="id" value={r.id} />
                    <AutoSubmitSelect name="status" defaultValue={r.status} key={r.status} className="input !w-auto !py-1 text-xs">
                      {[...new Set([...statuses, r.status])].map((k) => <option key={k} value={k}>{lbl(user.lang, IDEA_STATUS[k])}</option>)}
                    </AutoSubmitSelect>
                  </form>
                  {(user.role === "admin" || r.user_id === user.id) && <Link href={`/app/ideas?edit=${r.id}`} className="text-xs text-brand hover:underline">{tr("Bearbeiten", "Bewerken")}</Link>}
                </div>
              </div>
            );
          })}
        </section>
        <aside className="card h-fit">
          <h2 className="mb-3">{editing ? tr("Idee bearbeiten", "Idee bewerken") : tr("Neue Produktidee", "Nieuw productidee")}</h2>
          <form action={saveIdea} className="space-y-3" key={editing?.id || "new"}>
            <input type="hidden" name="id" value={editing?.id || ""} />
            <div><label className="label">{tr("Produkt", "Product")}</label><input name="name" className="input" defaultValue={editing?.name} required /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="label">{tr("Lieferant / Marke", "Leverancier / merk")}</label><input name="supplier" className="input" defaultValue={editing?.supplier || ""} /></div>
              <div><label className="label">{tr("Mindestmenge (MOQ)", "Min. afname (MOQ)")}</label><input name="moq" inputMode="numeric" className="input" defaultValue={editing?.moq ?? ""} /></div>
            </div>
            <div><label className="label">Link</label><input name="link" className="input" placeholder="https://…" defaultValue={editing?.link || ""} /></div>
            <MarginFields lang={user.lang} ek={editing?.ek} vk={editing?.vk} vat={editing?.vat} />
            <div><label className="label">{tr("Warum passt es zu uns?", "Waarom past het bij ons?")}</label><textarea name="why" className="input" rows={3} defaultValue={editing?.why || ""} /></div>
            <div><label className="label">{tr("Verpackung / eigenes Label möglich?", "Verpakking / eigen label mogelijk?")}</label><input name="packaging" className="input" defaultValue={editing?.packaging || ""} /></div>
            <div className="flex gap-2"><Submit>{tr("Speichern", "Opslaan")}</Submit>{editing && <Link href="/app/ideas" className="btn-ghost">{tr("Abbrechen", "Annuleren")}</Link>}</div>
          </form>
          {editing && <form action={deleteIdea} className="mt-3"><input type="hidden" name="id" value={editing.id} /><ConfirmSubmit confirm={tr("Wirklich löschen?", "Echt verwijderen?")}>{tr("Löschen", "Verwijderen")}</ConfirmSubmit></form>}
        </aside>
      </div>
    </div>
  );
}
