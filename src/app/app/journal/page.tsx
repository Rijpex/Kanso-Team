import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { IDEA_AREA, IDEA_STAGE, LEAD_INTEREST, LEAD_NEXT, LEAD_STAGE, REQUEST_KIND, T, lbl } from "@/lib/i18n";
import { shortDate, today } from "@/lib/dates";
import { Badge, Empty, PageHeader } from "@/components/ui";
import { AutoSubmitSelect, ConfirmSubmit, Submit } from "@/components/client";
import { FileUpload } from "@/components/FileUpload";
import { deleteCustomerRequest, deleteFile, saveCustomerRequest, setRequestStage, toggleCustomerRequest } from "../actions";

type R = {
  id: string; date: string; kind: string; text: string; product: string | null; answer: string | null; action_needed: boolean; action_note: string | null; status: string; name: string | null; user_id: string | null;
  contact_name: string | null; phone: string | null; email: string | null; interest: string | null; budget: string | null; timing: string | null; next_step: string | null;
  stage: string; stage_note: string | null; title: string | null; link: string | null;
};
type F = { id: string; request_id: string; name: string; mime_type: string | null; uploaded_by: string | null };
type Tab = "lead" | "question" | "idea";
const TABS: Tab[] = ["lead", "question", "idea"];
const tabOf = (kind: string): Tab => (kind === "lead" ? "lead" : kind === "idea" ? "idea" : "question");

export default async function CustomerRequests({ searchParams }: { searchParams: { edit?: string; all?: string; tab?: string; new?: string; saved?: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const isAdmin = user.role === "admin";
  const showAll = searchParams.all === "1";
  const [rows, files, online] = await Promise.all([
    q<R>(`select r.*, u.name from customer_requests r left join users u on u.id = r.user_id order by (r.status = 'open') desc, r.date desc, r.created_at desc limit ${showAll ? 1000 : 150}`),
    q<F>("select id, request_id, name, mime_type, uploaded_by from files where request_id is not null order by created_at"),
    q<{ week: string; n: number }>("select date_trunc('week', date)::date::text as week, count(*)::int as n from journal where kind = 'online' group by 1 order by 1 desc limit 8"),
  ]);
  const editing = searchParams.edit ? rows.find((r) => r.id === searchParams.edit) : undefined;
  const tab: Tab = editing ? tabOf(editing.kind) : TABS.includes(searchParams.tab as Tab) ? (searchParams.tab as Tab) : "lead";
  const showForm = !!editing || searchParams.new === "1";
  const inTab = rows.filter((r) => tabOf(r.kind) === tab);
  const open = inTab.filter((r) => r.status === "open");
  const done = inTab.filter((r) => r.status !== "open");
  const counts = Object.fromEntries(TABS.map((t) => [t, rows.filter((r) => tabOf(r.kind) === t && r.status === "open").length]));
  const max = Math.max(1, ...online.map((o) => o.n));
  const href = (t: Tab, extra = "") => `/app/journal?tab=${t}${extra}`;
  const tabLabel: Record<Tab, string> = { lead: tr("Leads", "Leads"), question: tr("Kundenfragen", "Klantvragen"), idea: tr("Ideen", "Ideeën") };
  const newLabel: Record<Tab, string> = { lead: tr("Neuer Lead", "Nieuwe lead"), question: tr("Neue Kundenfrage", "Nieuwe klantvraag"), idea: tr("Neue Idee", "Nieuw idee") };
  const intro: Record<Tab, string> = {
    lead: tr("Jemand mit Interesse an Küche, Pergola, Kamado oder Einrichtung. Name und Telefonnummer sind das Wichtigste – damit Bas oder Lea nachfassen können. Zählt für die Projektprovision.", "Iemand met interesse in keuken, pergola, kamado of inrichting. Naam en telefoonnummer zijn het belangrijkst – zodat Bas of Lea kunnen opvolgen. Telt voor de projectprovisie."),
    question: tr("Was Kundinnen und Kunden fragen, suchen oder sagen – auch, was wir nicht beantworten konnten. Daraus wird Wissen, Sortiment oder FAQ.", "Wat klanten vragen, zoeken of zeggen – ook wat we niet konden beantwoorden. Daar maken we kennis, assortiment of FAQ van."),
    idea: tr("Deine Ideen für Präsentation, Schaufenster, Sortiment oder Verkauf. Kurz beschreiben, gern mit Foto, Skizze oder Link. Wir besprechen sie zusammen – bitte erst besprechen, dann umsetzen.", "Jouw ideeën voor presentatie, etalage, assortiment of verkoop. Kort beschrijven, graag met foto, schets of link. We bespreken ze samen – eerst bespreken, dan uitvoeren."),
  };
  const chip = (on: boolean) => `inline-flex cursor-pointer items-center rounded-full px-3 py-1.5 text-sm ring-1 transition ${on ? "bg-ink text-white ring-ink" : "bg-white text-stone-700 ring-sand-300 hover:bg-sand-100"}`;
  const Radios = ({ name, options, value, required }: { name: string; options: Record<string, { de: string; nl: string }>; value?: string | null; required?: boolean }) => (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(options).map(([k, l], i) => (
        <label key={k} className="relative">
          <input type="radio" name={name} value={k} defaultChecked={value === k} required={required && i === 0} className="peer sr-only" />
          <span className="inline-flex cursor-pointer items-center rounded-full bg-white px-3 py-1.5 text-sm text-stone-700 ring-1 ring-sand-300 transition hover:bg-sand-100 peer-checked:bg-ink peer-checked:text-white peer-checked:ring-ink peer-focus-visible:ring-2 peer-focus-visible:ring-brand">{lbl(user.lang, l)}</span>
        </label>
      ))}
    </div>
  );

  const StageSelect = ({ r }: { r: R }) => {
    const opts = r.kind === "lead" ? LEAD_STAGE : IDEA_STAGE;
    if (!isAdmin) return r.kind === "lead" && r.stage === "new" && r.user_id === user.id
      ? <form action={setRequestStage} className="inline"><input type="hidden" name="id" value={r.id} /><input type="hidden" name="stage" value="contacted" /><button className="btn-ghost btn-sm">{tr("Hab ich kontaktiert", "Ik heb contact gehad")}</button></form>
      : null;
    return (
      <form action={setRequestStage} className="flex flex-wrap items-center gap-1.5">
        <input type="hidden" name="id" value={r.id} />
        <AutoSubmitSelect name="stage" defaultValue={r.stage || "new"} className="input !w-auto !py-1 text-xs">{Object.entries(opts).map(([k, l]) => <option key={k} value={k}>{lbl(user.lang, l)}</option>)}</AutoSubmitSelect>
      </form>
    );
  };

  const Files = ({ r, edit }: { r: R; edit?: boolean }) => {
    const mine = files.filter((f) => f.request_id === r.id);
    if (!mine.length && !edit) return null;
    return (
      <div className="mt-2">
        {mine.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {mine.map((f) => (
              <div key={f.id} className="group relative">
                <a href={`/api/files/${f.id}`} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg bg-sand-100 ring-1 ring-sand-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {f.mime_type?.startsWith("image/") ? <img src={`/api/files/${f.id}`} alt={f.name} className="h-24 w-24 object-cover sm:h-28 sm:w-28" /> : <span className="flex h-24 w-24 items-center justify-center px-2 text-center text-xs text-stone-600 sm:h-28 sm:w-28">{f.name}</span>}
                </a>
                {(isAdmin || f.uploaded_by === user.id) && edit && <form action={deleteFile} className="absolute -right-1 -top-1"><input type="hidden" name="id" value={f.id} /><ConfirmSubmit className="h-5 w-5 rounded-full bg-white text-xs text-stone-500 shadow ring-1 ring-sand-300 hover:text-red-600" confirm="?">×</ConfirmSubmit></form>}
              </div>
            ))}
          </div>
        )}
        {edit && <div className="mt-2"><FileUpload requestId={r.id} accept="image/*,.pdf" label={tr("Foto, Skizze oder PDF anhängen", "Foto, schets of pdf toevoegen")} hint={tr("Handyfoto reicht – direkt aus der Kamera.", "Een foto met je telefoon is genoeg.")} /></div>}
      </div>
    );
  };

  const Item = ({ r }: { r: R }) => {
    const kindTab = tabOf(r.kind);
    const stageL = kindTab === "lead" ? LEAD_STAGE[r.stage] : kindTab === "idea" ? IDEA_STAGE[r.stage] : undefined;
    return (
      <li className={`rounded-xl bg-white p-3 ring-1 ring-sand-200 sm:p-4 ${r.status === "done" ? "opacity-75" : ""}`}>
        <div className="flex items-start gap-3">
          {kindTab === "question" && (
            <form action={toggleCustomerRequest} className="pt-0.5"><input type="hidden" name="id" value={r.id} />
              <button className={`h-5 w-5 rounded-md border text-xs ${r.status === "done" ? "border-brand bg-brand text-white" : "border-sand-300 bg-white hover:border-brand"}`} title={tr(r.status === "done" ? "Wieder öffnen" : "Erledigt", r.status === "done" ? "Weer openen" : "Afgehandeld")}>{r.status === "done" ? "✓" : ""}</button>
            </form>
          )}
          <div className="min-w-0 flex-1 text-sm">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {kindTab === "lead" && <span className="text-base font-semibold">{r.contact_name || r.text}</span>}
              {kindTab === "idea" && <span className="text-base font-semibold">{r.title || r.text}</span>}
              {kindTab === "question" && <Badge l={REQUEST_KIND[r.kind]} lang={user.lang} />}
              {kindTab === "lead" && r.interest && <Badge l={{ ...LEAD_INTEREST[r.interest], color: "bg-sand-100 text-stone-700" }} lang={user.lang} />}
              {kindTab === "idea" && r.product && <span className="badge bg-sand-100 text-stone-700">{IDEA_AREA[r.product] ? lbl(user.lang, IDEA_AREA[r.product]) : r.product}</span>}
              {kindTab === "question" && r.product && <span className="font-medium">{r.product}</span>}
              {stageL && <Badge l={stageL} lang={user.lang} />}
              <span className="text-xs text-stone-400">{shortDate(r.date, user.lang)}{r.name ? ` · ${r.name}` : ""}</span>
            </div>
            {kindTab === "lead" && (r.phone || r.email) && (
              <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                {r.phone && <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} className="font-medium text-brand underline">☎ {r.phone}</a>}
                {r.email && <a href={`mailto:${r.email}`} className="text-brand underline">{r.email}</a>}
              </p>
            )}
            {kindTab === "lead" && !r.phone && !r.email && <p className="mt-1 text-xs text-amber-800">{tr("Keine Kontaktdaten – bitte nachtragen, sonst können wir nicht nachfassen.", "Geen contactgegevens – graag aanvullen, anders kunnen we niet opvolgen.")}</p>}
            {(kindTab !== "lead" || r.text !== r.contact_name) && (kindTab !== "idea" || r.text !== r.title) && <p className={`mt-1 whitespace-pre-line ${r.kind === "quote" ? "italic" : ""}`}>{r.kind === "quote" ? `„${r.text}“` : r.text}</p>}
            {kindTab === "lead" && (r.budget || r.timing || r.next_step) && (
              <p className="mt-1 text-stone-600">
                {r.budget && <span>{tr("Budget", "Budget")}: {r.budget}</span>}{r.budget && (r.timing || r.next_step) && " · "}
                {r.timing && <span>{tr("Wann", "Wanneer")}: {r.timing}</span>}{r.timing && r.next_step && " · "}
                {r.next_step && LEAD_NEXT[r.next_step] && <span className="font-medium">→ {lbl(user.lang, LEAD_NEXT[r.next_step])}</span>}
              </p>
            )}
            {r.link && <p className="mt-1 truncate"><a href={/^https?:/.test(r.link) ? r.link : `https://${r.link}`} target="_blank" rel="noreferrer" className="text-brand underline">{r.link}</a></p>}
            {r.answer && <p className="mt-1 text-stone-600"><span className="text-xs uppercase tracking-wide text-stone-400">{tr("Geantwortet", "Geantwoord")}: </span>{r.answer}</p>}
            {r.action_needed && kindTab === "question" && <p className="mt-1 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-900">→ {r.action_note || tr("Daraus sollten wir etwas machen.", "Hier moeten we iets mee doen.")}</p>}
            {r.stage_note && <p className="mt-1 text-xs text-stone-500">{r.stage_note}</p>}
            <Files r={r} />
            {kindTab !== "question" && <div className="mt-2"><StageSelect r={r} /></div>}
          </div>
          <div className="flex shrink-0 gap-1 text-xs">
            {(isAdmin || r.user_id === user.id) && <Link href={`/app/journal?edit=${r.id}`} className="btn-ghost btn-sm">{tr("Ändern", "Wijzig")}</Link>}
            {isAdmin && <form action={deleteCustomerRequest}><input type="hidden" name="id" value={r.id} /><ConfirmSubmit className="px-2 text-stone-300 hover:text-red-600" confirm="?">×</ConfirmSubmit></form>}
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title={tr("Leads, Kundenfragen & Ideen", "Leads, klantvragen & ideeën")} sub={tr("Alles aus dem Laden an einem Ort – damit nichts verloren geht und wir nachfassen können.", "Alles uit de winkel op één plek – zodat niets verloren gaat en we kunnen opvolgen.")} />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <Link key={t} href={href(t)} className={chip(tab === t && !editing) + " shrink-0"}>
            {tabLabel[t]}{counts[t] > 0 && <span className={`ml-1.5 rounded-full px-1.5 text-xs ${tab === t ? "bg-white/20" : "bg-sand-100 text-stone-500"}`}>{counts[t]}</span>}
          </Link>
        ))}
      </div>

      {!showForm && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="muted max-w-xl">{intro[tab]}</p>
          <Link href={href(tab, "&new=1")} className="btn-primary">+ {newLabel[tab]}</Link>
        </div>
      )}

      {showForm && (
        <section className="card mb-5" id="form">
          <h2 className="mb-1">{editing ? tr("Eintrag ändern", "Invoer wijzigen") : newLabel[tab]}</h2>
          {searchParams.saved === "1" && editing?.kind === "idea" && <p className="mb-2 rounded-md bg-emerald-50 px-2 py-1 text-sm text-emerald-900">{tr("Gespeichert. Magst du noch ein Foto oder eine Skizze anhängen?", "Opgeslagen. Wil je nog een foto of schets toevoegen?")}</p>}
          {!editing && <p className="mb-3 text-xs text-stone-500">{intro[tab]}</p>}
          <form action={saveCustomerRequest} className="space-y-3 text-sm" key={editing?.id || `new-${tab}-${rows.length}`}>
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <input type="hidden" name="back" value={href(tab)} />
            {tab === "lead" && <input type="hidden" name="kind" value="lead" />}
            {tab === "idea" && <input type="hidden" name="kind" value="idea" />}
            {isAdmin ? <div className="sm:w-48"><label className="label">{tr("Datum", "Datum")}</label><input type="date" name="date" className="input" defaultValue={editing?.date || today()} required /></div> : <input type="hidden" name="date" value={editing?.date || today()} />}

            {tab === "lead" && (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div><label className="label">{tr("Name *", "Naam *")}</label><input name="contact_name" className="input" required defaultValue={editing?.contact_name || ""} placeholder={tr("Vor- und Nachname", "Voor- en achternaam")} autoFocus /></div>
                  <div><label className="label">{tr("Telefon (am liebsten)", "Telefoon (liefst)")}</label><input name="phone" type="tel" inputMode="tel" className="input" defaultValue={editing?.phone || ""} placeholder="0151 …" /></div>
                  <div><label className="label">{tr("E-Mail", "E-mail")}</label><input name="email" type="email" className="input" defaultValue={editing?.email || ""} /></div>
                </div>
                <div><label className="label">{tr("Interesse *", "Interesse *")}</label><Radios name="interest" options={LEAD_INTEREST} value={editing?.interest || "kueche"} required /></div>
                <div><label className="label">{tr("Was genau?", "Wat precies?")}</label><textarea name="text" className="input" rows={3} defaultValue={editing && editing.text !== editing.contact_name ? editing.text : ""} placeholder={tr("Größe, Ort (Terrasse, Garten), Vorstellungen, was schon da ist, worauf es ankommt …", "Grootte, plek (terras, tuin), wensen, wat er al staat, waar het op aankomt …")} /></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><label className="label">{tr("Budget (ungefähr)", "Budget (ongeveer)")}</label><input name="budget" className="input" defaultValue={editing?.budget || ""} placeholder={tr("z. B. 8.000–10.000 €, oder „offen“", "bijv. 8.000–10.000 €, of \"open\"")} /></div>
                  <div><label className="label">{tr("Wann soll es losgehen?", "Wanneer moet het gebeuren?")}</label><input name="timing" className="input" defaultValue={editing?.timing || ""} placeholder={tr("z. B. Frühjahr 2027, so bald wie möglich", "bijv. voorjaar 2027, zo snel mogelijk")} /></div>
                </div>
                <div><label className="label">{tr("Was ist vereinbart? *", "Wat is afgesproken? *")}</label><Radios name="next_step" options={LEAD_NEXT} value={editing?.next_step || "call"} required /></div>
              </>
            )}

            {tab === "question" && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><label className="label">{tr("Art", "Soort")}</label>
                    <select name="kind" className="input" defaultValue={editing?.kind || "question"}>{Object.entries(REQUEST_KIND).filter(([k]) => k !== "lead" && k !== "idea").map(([k, l]) => <option key={k} value={k}>{lbl(user.lang, l)}</option>)}</select></div>
                  <div><label className="label">{tr("Produkt / Thema", "Product / onderwerp")}</label><input name="product" className="input" defaultValue={editing?.product || ""} placeholder={tr("z. B. Tenderflame, Pergola, Gewürze", "bv. Tenderflame, pergola, spices")} /></div>
                </div>
                <div><label className="label">{tr("Was hat die Kundin / der Kunde gefragt oder gesagt? *", "Wat vroeg of zei de klant? *")}</label><textarea name="text" className="input" rows={2} required defaultValue={editing?.text || ""} placeholder={tr("„Habt ihr das auch in Grün?“ · „Kann man die Tischfeuer draußen stehen lassen?“", "\"Hebben jullie dit ook in groen?\" · \"Kan het tafelvuur buiten blijven staan?\"")} /></div>
                <div><label className="label">{tr("Was haben wir geantwortet? (optional)", "Wat hebben we geantwoord? (optioneel)")}</label><input name="answer" className="input" defaultValue={editing?.answer || ""} /></div>
                <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
                  <label className="flex items-center gap-2"><input type="checkbox" name="action_needed" defaultChecked={editing?.action_needed ?? true} /> {tr("Daraus sollten wir etwas machen", "Hier moeten we iets mee")}</label>
                  <input name="action_note" className="input" defaultValue={editing?.action_note || ""} placeholder={tr("z. B. Lieferant fragen, ins Sortiment prüfen, FAQ auf der Website", "bv. leverancier vragen, in assortiment bekijken, FAQ op de website")} />
                </div>
              </>
            )}

            {tab === "idea" && (
              <>
                <div><label className="label">{tr("Idee in einem Satz *", "Idee in één zin *")}</label><input name="title" className="input" required defaultValue={editing?.title || ""} placeholder={tr("z. B. Tenderflame-Tisch ans Fenster, brennend, mit Preisschild", "bijv. Tenderflame-tafel bij het raam, brandend, met prijskaartje")} autoFocus /></div>
                <div><label className="label">{tr("Worum geht es?", "Waar gaat het over?")}</label><Radios name="product" options={IDEA_AREA} value={editing?.product || "praesentation"} /></div>
                <div><label className="label">{tr("Beschreibung", "Beschrijving")}</label><textarea name="text" className="input" rows={4} defaultValue={editing && editing.text !== editing.title ? editing.text : ""} placeholder={tr("Was genau, warum (was bringt es Kunden oder Umsatz), was braucht es dafür (Material, Zeit, Kosten)?", "Wat precies, waarom (wat levert het klanten of omzet op), wat is ervoor nodig (materiaal, tijd, kosten)?")} /></div>
                <div><label className="label">{tr("Link (optional)", "Link (optioneel)")}</label><input name="link" className="input" defaultValue={editing?.link || ""} placeholder="https://…" /></div>
                {editing ? <Files r={editing} edit /> : <p className="text-xs text-stone-500">{tr("Nach dem Speichern kannst du Fotos oder eine Skizze anhängen.", "Na het opslaan kun je foto's of een schets toevoegen.")}</p>}
              </>
            )}

            <div className="flex gap-2 pt-1"><Submit>{editing ? tr("Speichern", "Opslaan") : tr("Speichern", "Opslaan")}</Submit><Link href={href(tab)} className="btn-ghost">{editing ? tr("Fertig", "Klaar") : tr("Abbrechen", "Annuleren")}</Link></div>
          </form>
        </section>
      )}

      <h2 className="mb-2">{tab === "lead" ? tr("Offene Leads", "Open leads") : tab === "idea" ? tr("Neue und offene Ideen", "Nieuwe en open ideeën") : tr("Offen – daraus etwas machen", "Open – hier iets mee doen")} <span className="text-sm font-normal text-stone-400">{open.length}</span></h2>
      {!open.length && <Empty>{tab === "lead" ? tr("Noch kein offener Lead. Sobald jemand Interesse an einem Projekt zeigt: Name und Telefonnummer notieren.", "Nog geen open lead. Zodra iemand interesse toont in een project: naam en telefoonnummer noteren.") : tab === "idea" ? tr("Noch keine Idee. Alles, was dir im Laden auffällt, ist willkommen.", "Nog geen idee. Alles wat je in de winkel opvalt is welkom.") : tr("Nichts offen. Sobald eine Frage aufkommt, die wir nicht sofort beantworten können: hier eintragen.", "Niets open. Zodra een vraag opkomt die we niet direct kunnen beantwoorden: hier invoeren.")}</Empty>}
      <ul className="space-y-2">{open.map((r) => <Item key={r.id} r={r} />)}</ul>

      <h2 className="mb-2 mt-6">{tab === "lead" ? tr("Abgeschlossen", "Afgerond") : tab === "idea" ? tr("Entschieden", "Besloten") : tr("Erledigt / nur notiert", "Afgehandeld / alleen genoteerd")} <span className="text-sm font-normal text-stone-400">{done.length}</span></h2>
      {!done.length && <p className="text-sm text-stone-500">{tr("Noch nichts.", "Nog niets.")}</p>}
      <ul className="space-y-2">{done.map((r) => <Item key={r.id} r={r} />)}</ul>
      {!showAll && rows.length >= 150 && <p className="mt-2 text-sm"><Link href={href(tab, "&all=1")} className="text-brand hover:underline">{tr("Alle anzeigen", "Alles tonen")}</Link></p>}

      {tab === "question" && online.length > 0 && (
        <section className="card mt-6">
          <h2 className="mb-1">{tr("Online-Anfragen pro Woche", "Online-aanvragen per week")}</h2>
          <p className="mb-3 text-xs text-stone-500">{tr("„Kann ich das online bestellen?“ – auf der Heute-Seite mit +1 gezählt.", "\"Kan ik dat online bestellen?\" – op Vandaag met +1 geteld.")}</p>
          <ul className="space-y-1.5 text-sm">
            {online.map((o) => (
              <li key={o.week} className="flex items-center gap-3"><span className="w-28 shrink-0 text-stone-500">{tr("ab", "vanaf")} {shortDate(o.week, user.lang)}</span><span className="h-3 rounded-full bg-brand" style={{ width: `${(o.n / max) * 70}%` }} /><span className="tabular-nums">{o.n}</span></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
