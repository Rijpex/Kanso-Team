import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/server/auth";
import { q, q1 } from "@/lib/server/db";
import { IDEA_AREA, LEAD_INTEREST, LEAD_NEXT, REQUEST_KIND, T, lbl } from "@/lib/i18n";
import { dateTime, shortDate } from "@/lib/dates";
import { CLOSED_STAGES, requestTitle, stageOptions, tabOf } from "@/lib/requests";
import { Avatar, Badge, BackLink } from "@/components/ui";
import { ConfirmSubmit, Submit } from "@/components/client";
import { Comments, type CommentRow } from "@/components/Comments";
import { FileUpload } from "@/components/FileUpload";
import { deleteCustomerRequest, deleteFile, setRequestStage, toggleCustomerRequest } from "../../actions";

type R = {
  id: string; date: string; kind: string; text: string; product: string | null; answer: string | null; action_needed: boolean; action_note: string | null; status: string; user_id: string | null; created_at: string;
  contact_name: string | null; phone: string | null; email: string | null; interest: string | null; budget: string | null; timing: string | null; next_step: string | null;
  stage: string; stage_note: string | null; stage_at: string | null; title: string | null; link: string | null; name: string | null; color: string | null; stage_by_name: string | null;
};

export default async function RequestDetail({ params, searchParams }: { params: { id: string }; searchParams: { saved?: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const isAdmin = user.role === "admin";
  const r = await q1<R>(`select r.*, r.created_at::text as created_at, r.stage_at::text as stage_at, u.name, u.color, sb.name as stage_by_name
    from customer_requests r left join users u on u.id = r.user_id left join users sb on sb.id = r.stage_by where r.id = $1`, [params.id]).catch(() => null);
  if (!r) notFound();
  const [comments, files] = await Promise.all([
    q<CommentRow>("select c.id, c.body, c.created_at::text as created_at, c.user_id, u.name, u.color, u.role from comments c left join users u on u.id = c.user_id where c.request_id = $1 order by c.created_at", [r.id]),
    q<{ id: string; name: string; mime_type: string | null; uploaded_by: string | null }>("select id, name, mime_type, uploaded_by from files where request_id = $1 order by created_at", [r.id]),
  ]);
  const tab = tabOf(r.kind);
  const canEdit = isAdmin || r.user_id === user.id;
  const stages = tab !== "question" ? stageOptions(r.kind) : null;
  const stageKeys = stages ? Object.keys(stages) : [];
  const title = requestTitle(r);
  const showText = r.text && r.text !== r.contact_name && r.text !== r.title;
  const kindName = tab === "lead" ? tr("Lead", "Lead") : tab === "idea" ? tr("Idee", "Idee") : lbl(user.lang, REQUEST_KIND[r.kind]);

  return (
    <div className="max-w-3xl">
      <BackLink href={`/app/journal?tab=${tab}`} label={tr("Alle", "Alle") + " " + (tab === "lead" ? "Leads" : tab === "idea" ? tr("Ideen", "ideeën") : tr("Kundenfragen", "klantvragen"))} />

      {searchParams.saved === "1" && (
        <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 ring-1 ring-emerald-200">
          <b>{tr("Gespeichert.", "Opgeslagen.")}</b>{" "}
          {isAdmin ? tr("Der Eintrag steht jetzt in der Liste.", "De invoer staat nu in de lijst.") : tr("Bas und Lea sehen das sofort auf ihrer Heute-Seite. Antworten und der Status erscheinen hier – und auf deiner Heute-Seite unter „Neu für dich“.", "Bas en Lea zien dit meteen op hun Vandaag-pagina. Antwoorden en de status verschijnen hier – en op je Vandaag-pagina onder \"Nieuw voor jou\".")}
          {tab === "idea" && !files.length && <> {tr("Magst du noch ein Foto oder eine Skizze anhängen? Unten bei „Fotos & Dateien“.", "Wil je nog een foto of schets toevoegen? Hieronder bij \"Foto's & bestanden\".")}</>}
        </div>
      )}

      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-stone-500">
              <Badge l={REQUEST_KIND[r.kind]} lang={user.lang} />
              {tab === "lead" && r.interest && LEAD_INTEREST[r.interest] && <Badge l={{ ...LEAD_INTEREST[r.interest], color: "bg-sand-100 text-stone-700" }} lang={user.lang} />}
              {tab === "idea" && r.product && <span className="badge bg-sand-100 text-stone-700">{IDEA_AREA[r.product] ? lbl(user.lang, IDEA_AREA[r.product]) : r.product}</span>}
              {tab === "question" && r.product && <span className="font-medium text-ink">{r.product}</span>}
              <span>{shortDate(r.date, user.lang)}{r.name ? ` · ${tr("von", "door")} ${r.name}` : ""}</span>
            </div>
            <h1 className="break-words">{title}</h1>
          </div>
          <div className="flex shrink-0 gap-1">
            {canEdit && <Link href={`/app/journal?edit=${r.id}`} className="btn-ghost btn-sm">{tr("Ändern", "Wijzig")}</Link>}
            {isAdmin && <form action={deleteCustomerRequest}><input type="hidden" name="id" value={r.id} /><ConfirmSubmit className="btn-ghost btn-sm text-stone-400 hover:text-red-600" confirm={tr("Eintrag wirklich löschen?", "Invoer echt verwijderen?")}>×</ConfirmSubmit></form>}
          </div>
        </div>

        {tab === "lead" && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-sand-50 p-3 ring-1 ring-sand-200">
              <div className="text-xs font-semibold uppercase tracking-wide text-stone-400">{tr("Kontakt", "Contact")}</div>
              {r.phone ? <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} className="mt-1 flex items-center gap-2 text-lg font-semibold text-brand hover:underline">☎ {r.phone}</a> : <p className="mt-1 text-sm text-amber-800">{tr("Keine Telefonnummer", "Geen telefoonnummer")}</p>}
              {r.email ? <a href={`mailto:${r.email}`} className="mt-0.5 block break-all text-sm text-brand hover:underline">{r.email}</a> : !r.phone && <p className="text-sm text-amber-800">{tr("Keine E-Mail – bitte nachtragen (Ändern).", "Geen e-mail – graag aanvullen (Wijzig).")}</p>}
            </div>
            <div className="rounded-xl bg-sand-50 p-3 ring-1 ring-sand-200 text-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-stone-400">{tr("Vereinbart", "Afgesproken")}</div>
              <p className="mt-1 font-medium">{r.next_step && LEAD_NEXT[r.next_step] ? lbl(user.lang, LEAD_NEXT[r.next_step]) : "–"}</p>
              {(r.budget || r.timing) && <p className="mt-1 text-stone-600">{r.budget && <>{tr("Budget", "Budget")}: {r.budget}</>}{r.budget && r.timing && " · "}{r.timing && <>{tr("Wann", "Wanneer")}: {r.timing}</>}</p>}
            </div>
          </div>
        )}

        {showText && <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed">{r.kind === "quote" ? `„${r.text}“` : r.text}</p>}
        {r.link && <p className="mt-2 text-sm"><a href={/^https?:/.test(r.link) ? r.link : `https://${r.link}`} target="_blank" rel="noreferrer" className="break-all text-brand underline">{r.link}</a></p>}
        {r.answer && <p className="mt-3 text-sm text-stone-600"><span className="text-xs uppercase tracking-wide text-stone-400">{tr("Geantwortet", "Geantwoord")}: </span>{r.answer}</p>}
        {tab === "question" && r.action_needed && <p className="mt-3 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-900">→ {r.action_note || tr("Daraus sollten wir etwas machen.", "Hier moeten we iets mee doen.")}</p>}

        {/* Status */}
        {stages && (
          <div className="mt-5 border-t border-sand-200 pt-4">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">{tr("Status", "Status")}:</span>
              <Badge l={stages[r.stage] || stages.new} lang={user.lang} />
              {r.stage_at && r.stage_by_name && <span className="text-xs text-stone-400">{tr("gesetzt von", "gezet door")} {r.stage_by_name}, {dateTime(r.stage_at, user.lang)}</span>}
            </div>
            {isAdmin ? (
              <form action={setRequestStage} className="space-y-2">
                <input type="hidden" name="id" value={r.id} />
                <div className="flex flex-wrap gap-1.5">
                  {stageKeys.map((k) => (
                    <button key={k} name="stage" value={k} className={`rounded-full px-3 py-1.5 text-sm ring-1 transition ${r.stage === k ? "bg-ink text-white ring-ink" : "bg-white text-stone-700 ring-sand-300 hover:bg-sand-100"}`}>{lbl(user.lang, stages[k])}</button>
                  ))}
                </div>
                <input name="stage_note" className="input" defaultValue={r.stage_note || ""} placeholder={tab === "lead" ? tr("Kurznotiz zum Stand, z. B. „Termin Di 14 Uhr im Showroom“ (wird mit dem Status gespeichert)", "Korte notitie, bijv. \"afspraak di 14 uur in de showroom\" (wordt met de status opgeslagen)") : tr("Kurze Rückmeldung an die Idee, z. B. „Gute Idee – nach Weihnachten“", "Korte reactie op het idee, bijv. \"goed idee – na kerst\"")} />
                <p className="text-xs text-stone-400">{tr("Status anklicken speichert sofort. Für Rückfragen oder Lob: unten antworten.", "Status aanklikken slaat direct op. Voor vragen of complimenten: hieronder antwoorden.")}</p>
              </form>
            ) : (
              <>
                {r.stage_note && <p className="rounded-md bg-brand-light px-3 py-2 text-sm">{r.stage_note}</p>}
                {tab === "lead" && r.stage === "new" && r.user_id === user.id && (
                  <form action={setRequestStage} className="mt-2"><input type="hidden" name="id" value={r.id} /><input type="hidden" name="stage" value="contacted" /><button className="btn-ghost btn-sm">{tr("Ich habe selbst schon Kontakt aufgenommen", "Ik heb zelf al contact gehad")}</button></form>
                )}
                {!CLOSED_STAGES.includes(r.stage) && r.stage === "new" && <p className="mt-1 text-xs text-stone-400">{tab === "lead" ? tr("Bas oder Lea setzen den Status, sobald sie nachgefasst haben.", "Bas of Lea zetten de status zodra ze hebben opgevolgd.") : tr("Bas und Lea schauen sich die Idee an und geben hier Rückmeldung.", "Bas en Lea bekijken het idee en reageren hier.")}</p>}
              </>
            )}
          </div>
        )}
        {tab === "question" && (
          <div className="mt-5 flex items-center gap-3 border-t border-sand-200 pt-4 text-sm">
            <form action={toggleCustomerRequest}><input type="hidden" name="id" value={r.id} /><button className={`btn-sm rounded-lg ring-1 ${r.status === "done" ? "bg-brand text-white ring-brand" : "bg-white ring-sand-300 hover:bg-sand-100"}`}>{r.status === "done" ? "✓ " + tr("Erledigt", "Afgehandeld") : tr("Als erledigt markieren", "Markeer als afgehandeld")}</button></form>
          </div>
        )}
      </div>

      {/* Fotos & Dateien */}
      <section className="card mt-4">
        <h2 className="mb-2">{tr("Fotos & Dateien", "Foto's & bestanden")} {files.length > 0 && <span className="text-sm font-normal text-stone-400">{files.length}</span>}</h2>
        {files.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {files.map((f) => (
              <div key={f.id} className="relative">
                <a href={`/api/files/${f.id}`} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg bg-sand-100 ring-1 ring-sand-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {f.mime_type?.startsWith("image/") ? <img src={`/api/files/${f.id}`} alt={f.name} className="h-28 w-28 object-cover sm:h-36 sm:w-36" /> : <span className="flex h-28 w-28 items-center justify-center px-2 text-center text-xs text-stone-600 sm:h-36 sm:w-36">{f.name}</span>}
                </a>
                {(isAdmin || f.uploaded_by === user.id) && <form action={deleteFile} className="absolute -right-1 -top-1"><input type="hidden" name="id" value={f.id} /><ConfirmSubmit className="h-6 w-6 rounded-full bg-white text-xs text-stone-500 shadow ring-1 ring-sand-300 hover:text-red-600" confirm="?">×</ConfirmSubmit></form>}
              </div>
            ))}
          </div>
        )}
        {canEdit && <FileUpload requestId={r.id} accept="image/*,.pdf" label={tr("Foto, Skizze oder PDF anhängen", "Foto, schets of pdf toevoegen")} hint={tab === "lead" ? tr("Z. B. Foto vom Grundriss oder von der Terrasse des Kunden.", "Bijv. foto van de plattegrond of het terras van de klant.") : tr("Handyfoto reicht – direkt aus der Kamera.", "Een foto met je telefoon is genoeg.")} />}
      </section>

      {/* Antworten */}
      <section className="card mt-4">
        <h2 className="mb-1">{tr("Antworten & Rückfragen", "Antwoorden & vragen")} {comments.length > 0 && <span className="text-sm font-normal text-stone-400">{comments.length}</span>}</h2>
        <p className="mb-3 text-xs text-stone-500">{isAdmin
          ? tr(`Was du hier schreibst, sieht ${r.name || "die Person"} auf der Heute-Seite unter „Neu für dich“.`, `Wat je hier schrijft ziet ${r.name || "de persoon"} op de Vandaag-pagina onder "Nieuw voor jou".`)
          : tr("Rückfrage, Ergänzung oder Update? Hier schreiben – Bas und Lea antworten an dieser Stelle.", "Vraag, aanvulling of update? Hier schrijven – Bas en Lea antwoorden op deze plek.")}</p>
        <Comments rows={comments} lang={user.lang} me={user} target={{ request_id: r.id }} placeholder={isAdmin ? tr(`Antwort an ${r.name || "…"} …`, `Antwoord aan ${r.name || "…"} …`) : tr("Nachricht an Bas und Lea …", "Bericht aan Bas en Lea …")} />
      </section>

      <p className="mt-4 text-xs text-stone-400">{kindName} · {tr("angelegt", "aangemaakt")} {dateTime(r.created_at, user.lang)}{r.name && <> · <Avatar name={r.name} color={r.color} size="h-4 w-4 text-[9px]" /> {r.name}</>}</p>
    </div>
  );
}
