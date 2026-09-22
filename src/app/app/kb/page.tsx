import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { KB_CATEGORY, T, lbl, pick } from "@/lib/i18n";
import { PageHeader } from "@/components/ui";

export default async function Kb({ searchParams }: { searchParams: { q?: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const term = (searchParams.q || "").trim();
  const pages = await q<{ slug: string; category: string; title_de: string; title_nl: string | null; todo: boolean }>(
    `select slug, category, title_de, title_nl, (body_de like '%[[%') as todo from kb_pages
      where $1 = '' or title_de ilike '%' || $1 || '%' or body_de ilike '%' || $1 || '%' or coalesce(body_nl,'') ilike '%' || $1 || '%'
      order by position`, [term]);
  const cats = [...Object.keys(KB_CATEGORY), ...new Set(pages.map((p) => p.category).filter((c) => !KB_CATEGORY[c]))];
  return (
    <div>
      <PageHeader title={tr("Wissen", "Kennis")} sub={tr("Alles zum Nachlesen. Fehlt etwas? Stell eine Frage – dann ergänzen wir es hier.", "Alles om na te lezen. Mis je iets? Stel een vraag – dan vullen we het hier aan.")}>
        {user.role === "admin" && <Link href="/app/kb/new" className="btn-primary">+ {tr("Neue Seite", "Nieuwe pagina")}</Link>}
      </PageHeader>
      <form className="mb-5 flex gap-2"><input name="q" className="input" placeholder={tr("Suchen …", "Zoeken …")} defaultValue={term} /><button className="btn-ghost">{tr("Suchen", "Zoeken")}</button></form>
      <div className="space-y-6">
        {cats.map((c) => {
          const list = pages.filter((p) => p.category === c);
          if (!list.length) return null;
          return (
            <section key={c}>
              <h2 className="mb-2">{lbl(user.lang, KB_CATEGORY[c]) || c}</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {list.map((p) => (
                  <Link key={p.slug} href={`/app/kb/${p.slug}`} className="flex items-center justify-between gap-2 rounded-xl bg-white p-3 text-sm font-medium ring-1 ring-sand-200 hover:ring-brand">
                    {pick(user.lang, p.title_de, p.title_nl)}
                    {user.role === "admin" && p.todo && <span className="badge shrink-0 bg-amber-100 text-amber-800">{tr("noch ausfüllen", "nog invullen")}</span>}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
