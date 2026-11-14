import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/server/auth";
import { q, q1 } from "@/lib/server/db";
import { KB_CATEGORY, T, lbl, pick } from "@/lib/i18n";
import { dateTime } from "@/lib/dates";
import { headings, kbStyle, readMinutes } from "@/lib/kb";
import { Markdown } from "@/components/Markdown";
import { Icon } from "@/components/Nav";

const SELLER_CATS = ["verkauf", "produkte", "anleitungen"];

export default async function KbPage({ params }: { params: { slug: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const p = await q1<{ slug: string; category: string; title_de: string; title_nl: string | null; body_de: string; body_nl: string | null; updated_at: string }>("select * from kb_pages where slug = $1", [params.slug]);
  if (!p) notFound();
  const siblings = await q<{ slug: string; title_de: string; title_nl: string | null }>(
    "select slug, title_de, title_nl from kb_pages where category = $1 order by position, title_de", [p.category]);
  const allowed = user.role !== "seller" || SELLER_CATS.includes(p.category);
  const body = pick(user.lang, p.body_de, p.body_nl);
  const toc = headings(body);
  const idx = siblings.findIndex((s) => s.slug === p.slug);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const catLabel = lbl(user.lang, KB_CATEGORY[p.category]) || p.category;
  const st = kbStyle(p.category);
  const title = (s: { title_de: string; title_nl: string | null }) => pick(user.lang, s.title_de, s.title_nl);
  const overview = user.role === "seller" ? tr("Produktwissen", "Productkennis") : tr("Wissen", "Kennis");
  const onlyGerman = user.lang === "nl" && !p.body_nl;
  if (!allowed) notFound();

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-8">
      <article className="min-w-0">
        {/* Kopf: zurück + Kategorie, bleibt auf dem Handy oben stehen */}
        <div className="sticky top-[53px] z-10 -mx-4 mb-4 flex items-center gap-2 border-b border-sand-200 bg-sand-50/95 px-4 py-2 backdrop-blur lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <Link href="/app/kb" className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium ring-1 ring-sand-300 hover:bg-sand-100">
            <span aria-hidden>←</span> {overview}
          </Link>
          <Link href={`/app/kb?c=${p.category}`} className={`inline-flex items-center gap-1.5 truncate rounded-full px-3 py-1.5 text-sm ${st.tone}`}>
            <Icon name={st.icon} className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{catLabel}</span>
          </Link>
        </div>

        <div className="flex items-start justify-between gap-3">
          <h1 className="text-[26px] leading-tight">{title(p)}</h1>
          {user.role === "admin" && <Link href={`/app/kb/${p.slug}/edit`} className="btn-ghost btn-sm shrink-0">{tr("Bearbeiten", "Bewerken")}</Link>}
        </div>
        <p className="mt-1.5 text-xs text-stone-400">{readMinutes(body)} {tr("Min. Lesezeit", "min. leestijd")} · {tr("zuletzt geändert", "laatst gewijzigd")} {dateTime(p.updated_at, user.lang)}</p>
        {onlyGerman && <p className="mt-1 text-xs text-stone-400">Deze pagina is er alleen in het Duits.</p>}

        {/* Inhalt auf dem Handy: aufklappbar */}
        {toc.length > 2 && (
          <details className="mt-4 rounded-2xl bg-white ring-1 ring-sand-200 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold">
              {tr("Auf dieser Seite", "Op deze pagina")} <span className="text-stone-400">{toc.length} {tr("Abschnitte", "onderdelen")} ▾</span>
            </summary>
            <ol className="border-t border-sand-200 px-4 py-2 text-sm">
              {toc.map((h, i) => <li key={h.id}><a href={`#${h.id}`} className="flex gap-2 py-1.5 text-stone-600 hover:text-ink"><span className="w-5 text-stone-300">{i + 1}</span>{h.title}</a></li>)}
            </ol>
          </details>
        )}

        <div className="card mt-4 !p-5 sm:!p-7"><Markdown text={body} /></div>

        {/* Weiter in dieser Kategorie */}
        {(prev || next) && (
          <nav className="mt-5 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link href={`/app/kb/${prev.slug}`} className="rounded-2xl bg-white p-4 ring-1 ring-sand-200 hover:ring-sand-300">
                <span className="text-xs text-stone-400">← {tr("Vorherige", "Vorige")}</span>
                <span className="mt-0.5 block font-medium leading-snug">{title(prev)}</span>
              </Link>
            ) : <span className="hidden sm:block" />}
            {next && (
              <Link href={`/app/kb/${next.slug}`} className="rounded-2xl bg-white p-4 text-right ring-1 ring-sand-200 hover:ring-sand-300">
                <span className="text-xs text-stone-400">{tr("Nächste", "Volgende")} →</span>
                <span className="mt-0.5 block font-medium leading-snug">{title(next)}</span>
              </Link>
            )}
          </nav>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link href="/app/kb" className="btn-ghost">← {tr("Zur Übersicht", "Naar het overzicht")}</Link>
          <Link href="/app/questions" className="text-stone-500 underline hover:text-ink">{tr("Etwas unklar? Frage stellen", "Iets onduidelijk? Stel een vraag")}</Link>
        </div>
      </article>

      {/* Seitenleiste am Computer: Inhalt dieser Seite + andere Seiten der Kategorie */}
      <aside className="hidden lg:block">
        <div className="sticky top-8 space-y-6">
          {toc.length > 1 && (
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">{tr("Auf dieser Seite", "Op deze pagina")}</div>
              <ol className="space-y-0.5 border-l border-sand-200 text-sm">
                {toc.map((h) => <li key={h.id}><a href={`#${h.id}`} className="-ml-px block border-l border-transparent py-1 pl-3 text-stone-500 hover:border-ink hover:text-ink">{h.title}</a></li>)}
              </ol>
            </div>
          )}
          {siblings.length > 1 && (
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">{catLabel}</div>
              <ul className="space-y-0.5 text-sm">
                {siblings.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/app/kb/${s.slug}`} className={`block rounded-lg px-2.5 py-1.5 ${s.slug === p.slug ? "bg-ink font-medium text-white" : "text-stone-600 hover:bg-sand-200 hover:text-ink"}`}>{title(s)}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
