import Link from "next/link";
import { KB_CATEGORY } from "@/lib/i18n";
import { deleteKbPage, saveKbPage } from "@/app/app/actions";
import { ConfirmSubmit, Submit } from "./client";

type P = { id: string; slug: string; category: string; title_de: string; title_nl: string | null; body_de: string; body_nl: string | null };

export function KbForm({ page }: { page?: P }) {
  return (
    <div className="max-w-3xl">
      <form action={saveKbPage} className="card space-y-4">
        <input type="hidden" name="id" value={page?.id || ""} /><input type="hidden" name="slug" value={page?.slug || ""} />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-1"><label className="label">Categorie</label><select name="category" className="input" defaultValue={page?.category || "shop"}>{Object.entries(KB_CATEGORY).map(([k, l]) => <option key={k} value={k}>{l.nl}</option>)}</select></div>
          <div><label className="label">Titel (Duits)</label><input name="title_de" className="input" defaultValue={page?.title_de} required /></div>
          <div><label className="label">Titel (Nederlands, optioneel)</label><input name="title_nl" className="input" defaultValue={page?.title_nl || ""} /></div>
        </div>
        <p className="text-xs text-stone-500">Opmaak: <code>### Kopje</code> · <code>- lijst</code> · <code>1. stappen</code> · <code>**vet**</code> · <code>[[nog invullen]]</code> wordt geel gemarkeerd · links worden automatisch klikbaar.</p>
        <div><label className="label">Tekst (Duits) – dit zien de stagiairs</label><textarea name="body_de" className="input font-mono !text-[13px]" rows={18} defaultValue={page?.body_de} /></div>
        <div><label className="label">Tekst (Nederlands, optioneel – leeg = Duitse tekst tonen)</label><textarea name="body_nl" className="input font-mono !text-[13px]" rows={8} defaultValue={page?.body_nl || ""} /></div>
        <div className="flex gap-2"><Submit>Opslaan</Submit><Link href={page ? `/app/kb/${page.slug}` : "/app/kb"} className="btn-ghost">Annuleren</Link></div>
      </form>
      {page && <form action={deleteKbPage} className="mt-4"><input type="hidden" name="id" value={page.id} /><ConfirmSubmit confirm="Echt verwijderen?">Pagina verwijderen</ConfirmSubmit></form>}
    </div>
  );
}
