import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { team } from "@/lib/server/queries";
import { CONTENT_STATUS, PILLARS, T, lbl } from "@/lib/i18n";
import { addDays, monday, shortDate, today } from "@/lib/dates";
import { Avatar, Badge, Empty, PageHeader } from "@/components/ui";
import { AutoSubmitSelect, ConfirmSubmit, Submit } from "@/components/client";
import { deleteContent, saveContent, setContentStatus } from "../actions";

type Row = { id: string; date: string | null; kind: string; title: string; idea: string | null; status: string; owner_id: string | null; link: string | null; pillar: string | null; name: string | null; color: string | null };
const KINDS: Record<string, string> = { reel: "Reel", story: "Story", post: "Karussell / Foto" };

export default async function Content({ searchParams }: { searchParams: { edit?: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const now = today();
  const mon = monday(now);
  const [rows, users] = await Promise.all([
    q<Row>("select c.*, u.name, u.color from content_items c left join users u on u.id = c.owner_id where c.status <> 'posted' or c.date >= $1 or c.date is null order by c.date nulls last, c.created_at", [addDays(mon, -14)]),
    team(),
  ]);
  const week = rows.filter((r) => r.date && r.date >= mon && r.date <= addDays(mon, 6));
  const reels = week.filter((r) => r.kind !== "story").length;
  const stories = week.filter((r) => r.kind === "story").length;
  const editing = rows.find((r) => r.id === searchParams.edit);
  const allowed = (r: Row) => Object.keys(CONTENT_STATUS).filter((k) => user.role === "admin" || (k !== "approved" && (k !== "posted" || r.status === "approved")) || k === r.status);

  return (
    <div>
      <PageHeader title={tr("Content-Plan", "Contentplan")} sub={tr("Jeden Tag eine Story, 2–3 Beiträge pro Woche, jede Woche mindestens drei verschiedene Säulen. Veröffentlicht wird erst nach Freigabe durch Lea.", "Elke dag een story, 2–3 posts per week, elke week minstens drie verschillende pijlers. Publiceren pas na goedkeuring door Lea.")} />
      <div className="mb-5 grid grid-cols-2 gap-3 sm:max-w-md">
        <div className="card"><div className="text-xs text-stone-500">{tr("Beiträge diese Woche", "Posts deze week")}</div><div className="text-2xl font-semibold">{reels}<span className="text-base font-normal text-stone-400"> / 3</span></div></div>
        <div className="card"><div className="text-xs text-stone-500">{tr("Storys diese Woche", "Stories deze week")}</div><div className="text-2xl font-semibold">{stories}<span className="text-base font-normal text-stone-400"> / 7</span></div></div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <section className="space-y-2">
          {!rows.length && <Empty>{tr("Noch nichts geplant. Trag rechts die erste Idee ein!", "Nog niets gepland. Zet rechts het eerste idee erin!")}</Empty>}
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl bg-white p-3 ring-1 ring-sand-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge bg-ink text-white">{KINDS[r.kind]}</span>
                <span className="text-xs text-stone-500">{r.date ? shortDate(r.date, user.lang) : tr("ohne Datum", "zonder datum")}</span>
                <Badge l={CONTENT_STATUS[r.status]} lang={user.lang} />
                {r.pillar && <span className="badge bg-sand-100 text-stone-600">{r.pillar}</span>}
                {r.name && <span className="ml-auto"><Avatar name={r.name} color={r.color} size="h-6 w-6 text-[10px]" /></span>}
              </div>
              <div className="mt-1.5 text-sm font-medium">{r.title}</div>
              {r.idea && <div className="mt-0.5 whitespace-pre-wrap text-sm text-stone-600">{r.idea}</div>}
              {r.link && /^https?:\/\//i.test(r.link) && <a href={r.link} target="_blank" rel="noreferrer" className="mt-1 block truncate text-sm text-brand underline">{r.link}</a>}
              <div className="mt-2 flex items-center gap-2">
                <form action={setContentStatus}><input type="hidden" name="id" value={r.id} />
                  <AutoSubmitSelect name="status" defaultValue={r.status} className="input !w-auto !py-1 text-xs" key={r.status}>
                    {allowed(r).map((k) => <option key={k} value={k}>{lbl(user.lang, CONTENT_STATUS[k])}</option>)}
                  </AutoSubmitSelect>
                </form>
                <Link href={`/app/content?edit=${r.id}`} className="text-xs text-brand hover:underline">{tr("Bearbeiten", "Bewerken")}</Link>
              </div>
            </div>
          ))}
        </section>
        <aside className="card h-fit">
          <h2 className="mb-3">{editing ? tr("Bearbeiten", "Bewerken") : tr("Neue Idee", "Nieuw idee")}</h2>
          <form action={saveContent} className="space-y-3" key={editing?.id || "new"}>
            <input type="hidden" name="id" value={editing?.id || ""} />
            <div className="grid grid-cols-2 gap-2">
              <select name="kind" className="input" defaultValue={editing?.kind || "reel"}>{Object.entries(KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
              <input type="date" name="date" className="input" defaultValue={editing?.date || ""} />
            </div>
            <select name="pillar" className="input" defaultValue={editing?.pillar || ""}><option value="">{tr("Säule wählen …", "Pijler kiezen …")}</option>{PILLARS.map((x) => <option key={x} value={x}>{x}</option>)}</select>
            <input name="title" className="input" placeholder={tr("Titel, z. B. „Tenderflame am Abend“", "Titel, bijv. \"Tenderflame in de avond\"")} defaultValue={editing?.title} required />
            <textarea name="idea" className="input" rows={4} placeholder={tr("Idee: Was sieht man? Text? Musik?", "Idee: wat zie je? Tekst? Muziek?")} defaultValue={editing?.idea || ""} />
            <input name="link" className="input" placeholder={tr("Link zum Video / Entwurf (optional)", "Link naar video / concept (optioneel)")} defaultValue={editing?.link || ""} />
            <select name="owner_id" className="input" defaultValue={editing?.owner_id || user.id}>{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
            <div className="flex gap-2"><Submit>{tr("Speichern", "Opslaan")}</Submit>{editing && <Link href="/app/content" className="btn-ghost">{tr("Abbrechen", "Annuleren")}</Link>}</div>
          </form>
          {editing && <form action={deleteContent} className="mt-3"><input type="hidden" name="id" value={editing.id} /><ConfirmSubmit confirm={tr("Wirklich löschen?", "Echt verwijderen?")}>{tr("Löschen", "Verwijderen")}</ConfirmSubmit></form>}
        </aside>
      </div>
    </div>
  );
}
