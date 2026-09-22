import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { IDEA_STATUS, T } from "@/lib/i18n";
import { calc, eur, IDEA_CHECKS } from "@/lib/ideas";
import { Avatar, Badge, Empty, PageHeader } from "@/components/ui";
import { IdeaForm, type Idea } from "@/components/IdeaForm";

type Row = Idea & { uname: string | null; color: string | null; n: number };

export default async function Ideas({ searchParams }: { searchParams: { new?: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const rows = await q<Row>("select i.*, u.name as uname, u.color, (select count(*)::int from comments c where c.idea_id = i.id) as n from ideas i left join users u on u.id = i.user_id order by (i.status in ('approved','rejected')), i.created_at desc");
  return (
    <div>
      <PageHeader title={tr("Produktideen", "Productideeën")} sub={tr("Neue Dinge finden, die zu KANSO passen und sich rechnen – und beides belegen können. Einmal im Monat stellt ihr eure Vorschläge vor.", "Nieuwe dingen vinden die bij KANSO passen én renderen – en dat allebei kunnen onderbouwen. Eén keer per maand presenteren jullie de voorstellen.")}>
        <Link href="/app/kb/preise-kalkulieren" className="btn-ghost btn-sm">{tr("Wie rechnet man Marge?", "Hoe reken je marge uit?")}</Link>
      </PageHeader>
      <div className="grid gap-5 lg:grid-cols-[1fr_24rem]">
        <section className="space-y-2">
          {!rows.length && <Empty>{tr("Noch keine Ideen. Trag die erste ein.", "Nog geen ideeën. Zet de eerste erin.")}</Empty>}
          {rows.map((r) => {
            const c = calc(r.ek, r.vk, r.vat, r.extra_cost, r.moq);
            return (
              <Link key={r.id} href={`/app/ideas/${r.id}`} className="block rounded-xl bg-white p-3 ring-1 ring-sand-200 hover:ring-brand">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{r.name}</span>
                  <Badge l={IDEA_STATUS[r.status]} lang={user.lang} />
                  {r.world && <span className="badge bg-sand-100 text-stone-600">{r.world}</span>}
                  {r.uname && <span className="ml-auto"><Avatar name={r.uname} color={r.color} size="h-6 w-6 text-[10px]" /></span>}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-stone-600">
                  {r.supplier && <span>{r.supplier}</span>}
                  {r.vk != null && <span>VK {eur(r.vk)}</span>}
                  {c && <span className={`font-semibold ${c.margin > 0 ? "" : "text-red-700"}`}>{tr("Marge", "Marge")} {eur(c.margin)} · {c.pct.toFixed(0)} % · {tr("Faktor", "factor")} {c.factor.toFixed(1)}</span>}
                  {c?.invest != null && <span>{tr("Erste Bestellung", "Eerste bestelling")} {eur(c.invest)}</span>}
                  <span>KANSO-Check {r.checks.length}/{IDEA_CHECKS.length}</span>
                  {r.n > 0 && <span>{r.n} {tr("Kommentare", "reacties")}</span>}
                </div>
                {r.why && <p className="mt-1.5 line-clamp-2 text-sm text-stone-700">{r.why}</p>}
              </Link>
            );
          })}
        </section>
        <aside className="card h-fit">
          <h2 className="mb-3">{tr("Neue Produktidee", "Nieuw productidee")}</h2>
          <IdeaForm lang={user.lang} key={rows.length} />
        </aside>
      </div>
    </div>
  );
}
