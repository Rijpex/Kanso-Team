import Link from "next/link";
import { T, type Lang } from "@/lib/i18n";
import { IDEA_CHECKS, WORLDS } from "@/lib/ideas";
import { saveIdea } from "@/app/app/actions";
import { MarginFields } from "./MarginCalc";
import { Submit } from "./client";

export type Idea = { id: string; user_id: string | null; name: string; supplier: string | null; link: string | null; ek: number | null; vk: number | null; vat: number; moq: number | null; packaging: string | null; why: string | null; status: string; world: string | null; occasion: string | null; extra_cost: number | null; online_price: number | null; lead_time: string | null; season: string | null; checks: string[]; sample: boolean };

export function IdeaForm({ lang, idea }: { lang: Lang; idea?: Idea }) {
  const tr = T(lang);
  return (
    <form action={saveIdea} className="space-y-3">
      <input type="hidden" name="id" value={idea?.id || ""} />
      <div><label className="label">{tr("Produkt", "Product")}</label><input name="name" className="input" defaultValue={idea?.name} required /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="label">{tr("Lieferant / Marke", "Leverancier / merk")}</label><input name="supplier" className="input" defaultValue={idea?.supplier || ""} /></div>
        <div><label className="label">{tr("Welt im Laden", "Wereld in de winkel")}</label><input name="world" list="worlds" className="input" defaultValue={idea?.world || ""} autoComplete="off" /><datalist id="worlds">{WORLDS.map((w) => <option key={w} value={w} />)}</datalist></div>
      </div>
      <div><label className="label">Link</label><input name="link" className="input" placeholder="https://…" defaultValue={idea?.link || ""} /></div>
      <div><label className="label">{tr("Für wen und zu welchem Anlass?", "Voor wie en bij welke gelegenheid?")}</label><input name="occasion" className="input" placeholder={tr("z. B. Mitbringsel zum Abendessen, Touristin sucht Andenken", "bijv. cadeautje bij een etentje, toerist zoekt souvenir")} defaultValue={idea?.occasion || ""} /></div>
      <MarginFields lang={lang} ek={idea?.ek} vk={idea?.vk} vat={idea?.vat} extra={idea?.extra_cost} moq={idea?.moq} online={idea?.online_price} />
      <div className="grid grid-cols-2 gap-2">
        <div><label className="label">{tr("Lieferzeit", "Levertijd")}</label><input name="lead_time" className="input" placeholder={tr("z. B. 2 Wochen", "bijv. 2 weken")} defaultValue={idea?.lead_time || ""} /></div>
        <div><label className="label">{tr("Saison", "Seizoen")}</label><input name="season" list="seasons" className="input" defaultValue={idea?.season || ""} autoComplete="off" /><datalist id="seasons">{["Ganzjährig", "Frühling / Sommer", "Herbst", "Weihnachten / Winter"].map((w) => <option key={w} value={w} />)}</datalist></div>
      </div>
      <div><label className="label">{tr("Warum passt es zu KANSO? (ein, zwei Sätze)", "Waarom past het bij KANSO? (één, twee zinnen)")}</label><textarea name="why" className="input" rows={3} defaultValue={idea?.why || ""} /></div>
      <div><label className="label">{tr("Verpackung / eigenes Label möglich?", "Verpakking / eigen label mogelijk?")}</label><input name="packaging" className="input" defaultValue={idea?.packaging || ""} /></div>
      <fieldset>
        <legend className="label">{tr("KANSO-Check – nur ankreuzen, was wirklich stimmt", "KANSO-check – alleen aanvinken wat echt klopt")}</legend>
        <div className="space-y-1">{IDEA_CHECKS.map((c) => <label key={c.key} className="flex items-start gap-2 text-sm"><input type="checkbox" name="checks" value={c.key} defaultChecked={idea?.checks?.includes(c.key)} className="mt-1" />{lang === "nl" ? c.nl : c.de}</label>)}</div>
      </fieldset>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="sample" defaultChecked={idea?.sample} /> {tr("Muster ist da – wir haben es in der Hand gehabt", "Sample is binnen – we hebben het in handen gehad")}</label>
      <div className="flex gap-2"><Submit>{tr("Speichern", "Opslaan")}</Submit><Link href={idea ? `/app/ideas/${idea.id}` : "/app/ideas"} className="btn-ghost">{tr("Abbrechen", "Annuleren")}</Link></div>
    </form>
  );
}
