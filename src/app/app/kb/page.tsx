import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { KB_CATEGORY, T, lbl, pick } from "@/lib/i18n";
import { kbStyle, readMinutes, teaser } from "@/lib/kb";
import { Icon } from "@/components/Nav";

export default async function Kb({ searchParams }: { searchParams: { q?: string; c?: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const isSeller = user.role === "seller";
  const term = (searchParams.q || "").trim();
  const pages = await q<{ slug: string; category: string; title_de: string; title_nl: string | null; body_de: string; body_nl: string | null; todo: boolean }>(
    `select slug, category, title_de, title_nl, body_de, body_nl, (body_de like '%[[%') as todo from kb_pages
      where $1 = '' or title_de ilike '%' || $1 || '%' or body_de ilike '%' || $1 || '%' or coalesce(body_nl,'') ilike '%' || $1 || '%'
      order by position, title_de`, [term]);
  const allCats = [...Object.keys(KB_CATEGORY), ...new Set(pages.map((p) => p.category).filter((c) => !KB_CATEGORY[c]))];
  const visible = isSeller ? ["verkauf", "produkte", "anleitungen"] : allCats;
  const withPages = visible.filter((c) => pages.some((p) => p.category === c));
  const active = searchParams.c && withPages.includes(searchParams.c) ? searchParams.c : "";
  const cats = active ? [active] : withPages;
  const href = (c: string) => `/app/kb?${new URLSearchParams({ ...(c ? { c } : {}), ...(term ? { q: term } : {}) })}`;
  const chip = (on: boolean) => `shrink-0 rounded-full px-3 py-1.5 text-sm transition ${on ? "bg-ink text-white" : "bg-white text-stone-700 ring-1 ring-sand-300 hover:bg-sand-100"}`;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1>{isSeller ? tr("Produktwissen", "Productkennis") : tr("Wissen", "Kennis")}</h1>
          <p className="muted mt-1 max-w-xl">{isSeller
            ? tr("Alles fürs Verkaufsgespräch: Produkte, Preise, Rabatte, Argumente.", "Alles voor het verkoopgesprek: producten, prijzen, kortingen, argumenten.")
            : tr("Alles zum Nachlesen. Fehlt etwas? Stell eine Frage – dann ergänzen wir es hier.", "Alles om na te lezen. Mis je iets? Stel een vraag – dan vullen we het hier aan.")}</p>
        </div>
        {user.role === "admin" && <Link href="/app/kb/new" className="btn-primary">+ {tr("Neue Seite", "Nieuwe pagina")}</Link>}
      </div>

      <form className="relative mb-3">
        {active && <input type="hidden" name="c" value={active} />}
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        </span>
        <input name="q" className="input !py-2.5 !pl-9" placeholder={tr("Suchen, z. B. Rabatt, Kamado, Lieferzeit …", "Zoeken, bijv. korting, kamado, levertijd …")} defaultValue={term} />
      </form>

      {withPages.length > 1 && (
        <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
          <Link href={href("")} className={chip(!active)}>{tr("Alle", "Alle")}</Link>
          {withPages.map((c) => <Link key={c} href={href(c)} className={chip(active === c)}>{lbl(user.lang, KB_CATEGORY[c]) || c}</Link>)}
        </div>
      )}

      {term && <p className="mb-4 text-sm text-stone-500">{pages.filter((p) => cats.includes(p.category)).length} {tr("Treffer für", "resultaten voor")} „{term}“ · <Link href={href(active)} className="underline">{tr("Suche löschen", "Zoekopdracht wissen")}</Link></p>}

      <div className="space-y-8">
        {cats.map((c) => {
          const list = pages.filter((p) => p.category === c);
          if (!list.length) return null;
          const st = kbStyle(c);
          return (
            <section key={c}>
              <div className="mb-3 flex items-center gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${st.tone}`}><Icon name={st.icon} className="h-4 w-4" /></span>
                <h2>{lbl(user.lang, KB_CATEGORY[c]) || c}</h2>
                <span className="text-sm text-stone-400">{list.length}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((p) => {
                  const body = pick(user.lang, p.body_de, p.body_nl);
                  return (
                    <Link key={p.slug} href={`/app/kb/${p.slug}`} className="group flex flex-col rounded-2xl bg-white p-4 ring-1 ring-sand-200 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-sand-300">
                      <span className="flex items-start justify-between gap-2">
                        <span className="font-semibold leading-snug">{pick(user.lang, p.title_de, p.title_nl)}</span>
                        <span className="mt-0.5 shrink-0 text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-ink">→</span>
                      </span>
                      <span className="mt-1.5 line-clamp-2 text-sm text-stone-500">{teaser(body)}</span>
                      <span className="mt-3 flex items-center gap-2 text-xs text-stone-400">
                        {readMinutes(body)} {tr("Min. Lesezeit", "min. leestijd")}
                        {user.role === "admin" && p.todo && <span className="badge bg-amber-100 text-amber-800">{tr("noch ausfüllen", "nog invullen")}</span>}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
        {!cats.some((c) => pages.some((p) => p.category === c)) && <p className="card text-sm text-stone-500">{tr("Nichts gefunden. Probier ein anderes Wort oder stell eine Frage.", "Niets gevonden. Probeer een ander woord of stel een vraag.")}</p>}
      </div>
    </div>
  );
}
