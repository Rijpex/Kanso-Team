import Link from "next/link";
import { KB_CATEGORY } from "@/lib/i18n";
import { deleteKbPage, saveKbPage } from "@/app/app/actions";
import { ConfirmSubmit, Submit } from "./client";

type P = { id: string; slug: string; category: string; title_de: string; title_nl: string | null; body_de: string; body_nl: string | null };

export function KbForm({ page, lang = "nl" }: { page?: P; lang?: "de" | "nl" }) {
  const tr = (de: string, nl: string) => (lang === "nl" ? nl : de);
  return (
    <div className="max-w-3xl">
      <form action={saveKbPage} className="card space-y-4">
        <input type="hidden" name="id" value={page?.id || ""} /><input type="hidden" name="slug" value={page?.slug || ""} />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-1"><label className="label">{tr("Kategorie", "Categorie")}</label><select name="category" className="input" defaultValue={page?.category || "shop"}>{Object.entries(KB_CATEGORY).map(([k, l]) => <option key={k} value={k}>{lang === "nl" ? l.nl : l.de}</option>)}</select></div>
          <div><label className="label">{tr("Titel (Deutsch)", "Titel (Duits)")}</label><input name="title_de" className="input" defaultValue={page?.title_de} required /></div>
          <div><label className="label">{tr("Titel (Niederländisch, optional)", "Titel (Nederlands, optioneel)")}</label><input name="title_nl" className="input" defaultValue={page?.title_nl || ""} /></div>
        </div>
        <p className="text-xs text-stone-500">{tr("Formatierung", "Opmaak")}: <code>### {tr("Überschrift", "Kopje")}</code> · <code>- {tr("Liste", "lijst")}</code> · <code>1. {tr("Schritte", "stappen")}</code> · <code>**{tr("fett", "vet")}**</code> · <code>[[{tr("noch ausfüllen", "nog invullen")}]]</code> {tr("wird gelb markiert · Links werden automatisch klickbar.", "wordt geel gemarkeerd · links worden automatisch klikbaar.")}</p>
        <div><label className="label">{tr("Text (Deutsch) – das sehen die Praktikantinnen", "Tekst (Duits) – dit zien de stagiairs")}</label><textarea name="body_de" className="input font-mono !text-[13px]" rows={18} defaultValue={page?.body_de} /></div>
        <div><label className="label">{tr("Text (Niederländisch, optional – leer = deutscher Text)", "Tekst (Nederlands, optioneel – leeg = Duitse tekst tonen)")}</label><textarea name="body_nl" className="input font-mono !text-[13px]" rows={8} defaultValue={page?.body_nl || ""} /></div>
        <div className="flex gap-2"><Submit>{tr("Speichern", "Opslaan")}</Submit><Link href={page ? `/app/kb/${page.slug}` : "/app/kb"} className="btn-ghost">{tr("Abbrechen", "Annuleren")}</Link></div>
      </form>
      {page && <form action={deleteKbPage} className="mt-4"><input type="hidden" name="id" value={page.id} /><ConfirmSubmit confirm={tr("Wirklich löschen?", "Echt verwijderen?")}>{tr("Seite löschen", "Pagina verwijderen")}</ConfirmSubmit></form>}
    </div>
  );
}
