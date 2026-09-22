import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/server/auth";
import { q1 } from "@/lib/server/db";
import { BackLink } from "@/components/ui";
import { KbForm } from "@/components/KbForm";

export default async function EditKb({ params }: { params: { slug: string } }) {
  const me = await requireAdmin();
  const p = await q1<any>("select * from kb_pages where slug = $1", [params.slug]);
  if (!p) notFound();
  return (<div><BackLink href={`/app/kb/${p.slug}`} label={p.title_de} /><h1 className="mb-4">{me.lang === "nl" ? "Pagina bewerken" : "Seite bearbeiten"}</h1><KbForm page={p} lang={me.lang} /></div>);
}
