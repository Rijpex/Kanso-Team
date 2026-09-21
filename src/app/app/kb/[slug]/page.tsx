import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/server/auth";
import { q1 } from "@/lib/server/db";
import { T, pick } from "@/lib/i18n";
import { dateTime } from "@/lib/dates";
import { BackLink } from "@/components/ui";
import { Markdown } from "@/components/Markdown";

export default async function KbPage({ params }: { params: { slug: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const p = await q1<{ slug: string; title_de: string; title_nl: string | null; body_de: string; body_nl: string | null; updated_at: string }>("select * from kb_pages where slug = $1", [params.slug]);
  if (!p) notFound();
  const onlyGerman = user.lang === "nl" && !p.body_nl;
  return (
    <article className="max-w-3xl">
      <BackLink href="/app/kb" label={tr("Wissen", "Kennis")} />
      <div className="flex items-start justify-between gap-3">
        <h1>{pick(user.lang, p.title_de, p.title_nl)}</h1>
        {user.role === "admin" && <Link href={`/app/kb/${p.slug}/edit`} className="btn-ghost btn-sm shrink-0">Bewerken</Link>}
      </div>
      {onlyGerman && <p className="mt-1 text-xs text-stone-400">Deze pagina is er alleen in het Duits.</p>}
      <div className="card mt-4"><Markdown text={pick(user.lang, p.body_de, p.body_nl)} /></div>
      <p className="mt-3 text-xs text-stone-400">{tr("Zuletzt geändert", "Laatst gewijzigd")}: {dateTime(p.updated_at, user.lang)} · <Link href="/app/questions" className="underline">{tr("Etwas unklar? Frage stellen", "Iets onduidelijk? Stel een vraag")}</Link></p>
    </article>
  );
}
