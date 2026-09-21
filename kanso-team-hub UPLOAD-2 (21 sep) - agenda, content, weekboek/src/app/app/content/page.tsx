import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { q, q1 } from "@/lib/server/db";
import { team } from "@/lib/server/queries";
import { BRANDS, CONTENT_STATUS, PILLARS, T, lbl } from "@/lib/i18n";
import { addDays, monday, monthName, shortDate, today } from "@/lib/dates";
import { Avatar, Badge, Empty, PageHeader } from "@/components/ui";
import { AutoSubmitSelect, ConfirmSubmit, Submit } from "@/components/client";
import { GoalBar, Sparkline } from "@/components/Progress";
import { deleteContent, saveContent, saveSocialGoals, saveSocialStats, setContentStatus } from "../actions";

type Row = { id: string; date: string | null; kind: string; title: string; idea: string | null; status: string; owner_id: string | null; link: string | null; pillar: string | null; brand: string | null; name: string | null; color: string | null };
type Stat = { date: string; followers: number | null; reach: number | null; interactions: number | null; profile_visits: number | null; note: string | null };
type Goal = { followers: number | null; reach: number | null; interactions: number | null; posts: number | null; stories: number | null; note: string | null };
const KINDS: Record<string, string> = { reel: "Reel", story: "Story", post: "Karussell / Foto" };

export default async function Content({ searchParams }: { searchParams: { edit?: string; f?: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const now = today();
  const mon = monday(now);
  const monthStart = `${now.slice(0, 7)}-01`;
  const [rows, users, stats, goal, usedTags] = await Promise.all([
    q<Row>("select c.*, u.name, u.color from content_items c left join users u on u.id = c.owner_id where c.status <> 'posted' or c.date >= $1 or c.date is null order by c.date nulls last, c.created_at", [addDays(mon, -14)]),
    team(),
    q<Stat>("select date, followers, reach, interactions, profile_visits, note from social_stats order by date desc limit 12"),
    q1<Goal>("select * from social_goals where month = $1", [monthStart]),
    q<{ pillar: string | null; brand: string | null }>("select distinct pillar, brand from content_items"),
  ]);
  const postsGoal = goal?.posts ?? 3;
  const storiesGoal = goal?.stories ?? 7;
  const week = rows.filter((r) => r.date && r.date >= mon && r.date <= addDays(mon, 6));
  const isDone = (r: Row) => r.status === "posted";
  const posts = week.filter((r) => r.kind !== "story");
  const stories = week.filter((r) => r.kind === "story");
  const pillarsDone = new Set(week.filter(isDone).map((r) => r.pillar).filter(Boolean)).size;
  const pillarsPlanned = new Set(week.map((r) => r.pillar).filter(Boolean)).size;
  const latest = stats[0];
  const prev = stats[1];
  const monthStats = stats.filter((s) => s.date >= monthStart);
  const reachMonth = monthStats.reduce((n, s) => n + (s.reach || 0), 0);
  const interMonth = monthStats.reduce((n, s) => n + (s.interactions || 0), 0);
  const delta = (a?: number | null, b?: number | null) => (a != null && b != null ? a - b : null);
  const dFollow = delta(latest?.followers, prev?.followers);
  const editing = rows.find((r) => r.id === searchParams.edit);
  const allowed = (r: Row) => Object.keys(CONTENT_STATUS).filter((k) => user.role === "admin" || (k !== "approved" && (k !== "posted" || r.status === "approved")) || k === r.status);
  const pillarOptions = [...new Set([...PILLARS, ...usedTags.map((u) => u.pillar).filter(Boolean) as string[]])];
  const brandOptions = [...new Set([...BRANDS, ...usedTags.map((u) => u.brand).filter(Boolean) as string[]])];
  const filter = searchParams.f || "";
  const shown = filter ? rows.filter((r) => r.brand === filter || r.pillar === filter) : rows;
  const activeTags = [...new Set(rows.flatMap((r) => [r.brand, r.pillar]).filter(Boolean) as string[])];

  return (
    <div>
      <PageHeader title={tr("Content-Plan", "Contentplan")} sub={tr("Planen, drehen, freigeben lassen, posten. Veröffentlicht wird erst nach Freigabe durch Lea.", "Plannen, filmen, laten goedkeuren, posten. Publiceren pas na goedkeuring door Lea.")} />

      <h2 className="mb-2">{tr("Unsere Ziele diese Woche", "Onze doelen deze week")}</h2>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <GoalBar label={tr("Beiträge (Reel, Karussell, Foto)", "Posts (reel, carrousel, foto)")} done={posts.filter(isDone).length} planned={posts.filter((r) => !isDone(r)).length} goal={postsGoal} hint={tr("dunkel = gepostet, hell = geplant", "donker = gepost, licht = gepland")} />
        <GoalBar label={tr("Storys", "Stories")} done={stories.filter(isDone).length} planned={stories.filter((r) => !isDone(r)).length} goal={storiesGoal} hint={tr("jeden Tag eine", "elke dag één")} />
        <GoalBar label={tr("Verschiedene Säulen", "Verschillende pijlers")} done={pillarsDone} planned={Math.max(0, pillarsPlanned - pillarsDone)} goal={3} hint={tr("mindestens drei pro Woche", "minstens drie per week")} />
      </div>

      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2>Instagram · <span className="capitalize">{monthName(monthStart, user.lang)}</span></h2>
        {latest && <span className="text-xs text-stone-500">{tr("Stand", "Stand")}: {shortDate(latest.date, user.lang)}</span>}
      </div>
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <GoalBar label="Follower" done={latest?.followers ?? 0} goal={goal?.followers ?? 0} hint={dFollow != null ? `${dFollow >= 0 ? "+" : ""}${dFollow} ${tr("seit dem letzten Eintrag", "sinds de vorige meting")}` : latest ? tr("erster Eintrag – ab nächster Woche siehst du den Zuwachs", "eerste meting – vanaf volgende week zie je de groei") : tr("Noch keine Zahlen eingetragen", "Nog geen cijfers ingevuld")} />
        <GoalBar label={tr("Reichweite diesen Monat", "Bereik deze maand")} done={reachMonth} goal={goal?.reach ?? 0} hint={tr("Summe der Wocheneinträge", "som van de weekmetingen")} />
        <GoalBar label={tr("Interaktionen diesen Monat", "Interacties deze maand")} done={interMonth} goal={goal?.interactions ?? 0} hint={tr("Likes, Kommentare, Shares, Saves", "likes, reacties, shares, saves")} />
      </div>
      {goal?.note && <p className="mb-3 rounded-xl bg-brand-light p-3 text-sm"><b>{tr("Unser Monatsziel in einem Satz", "Ons maanddoel in één zin")}:</b> {goal.note}</p>}
      <div className="mb-7 grid gap-3 lg:grid-cols-2">
        <details className="card">
          <summary className="cursor-pointer text-sm font-semibold">{tr("Zahlen eintragen (einmal pro Woche, montags)", "Cijfers invullen (één keer per week, maandag)")}</summary>
          <p className="muted mt-2">{tr("Instagram → Professional Dashboard → Insights, Zeitraum „Letzte 7 Tage“.", "Instagram → Professional dashboard → Insights, periode „Laatste 7 dagen“.")}</p>
          <form action={saveSocialStats} className="mt-2 grid grid-cols-2 gap-2" key={stats.length}>
            <div className="col-span-2"><label className="label">{tr("Datum", "Datum")}</label><input type="date" name="date" className="input" defaultValue={now} required /></div>
            <div><label className="label">Follower ({tr("gesamt", "totaal")})</label><input name="followers" inputMode="numeric" className="input" /></div>
            <div><label className="label">{tr("Reichweite (7 Tage)", "Bereik (7 dagen)")}</label><input name="reach" inputMode="numeric" className="input" /></div>
            <div><label className="label">{tr("Interaktionen (7 Tage)", "Interacties (7 dagen)")}</label><input name="interactions" inputMode="numeric" className="input" /></div>
            <div><label className="label">{tr("Profilaufrufe (7 Tage)", "Profielbezoeken (7 dagen)")}</label><input name="profile_visits" inputMode="numeric" className="input" /></div>
            <div className="col-span-2"><label className="label">{tr("Was ist aufgefallen? Welcher Beitrag lief am besten – und warum?", "Wat viel op? Welke post liep het best – en waarom?")}</label><input name="note" className="input" /></div>
            <div><Submit>{tr("Speichern", "Opslaan")}</Submit></div>
          </form>
          {stats.length > 0 && (
            <div className="mt-4">
              <div className="mb-1 flex items-center gap-3"><span className="text-xs font-semibold uppercase text-stone-400">Follower</span><Sparkline values={[...stats].reverse().map((s) => s.followers ?? 0)} /></div>
              <table className="w-full text-xs"><thead><tr className="text-left text-stone-400"><th className="py-1 font-medium">{tr("Datum", "Datum")}</th><th className="font-medium">Follower</th><th className="font-medium">{tr("Reichw.", "Bereik")}</th><th className="font-medium">{tr("Interakt.", "Interact.")}</th></tr></thead>
                <tbody>{stats.map((s) => <tr key={s.date} className="border-t border-sand-200"><td className="py-1">{shortDate(s.date, user.lang)}</td><td className="tabular-nums">{s.followers ?? "–"}</td><td className="tabular-nums">{s.reach ?? "–"}</td><td className="tabular-nums">{s.interactions ?? "–"}</td></tr>)}</tbody></table>
            </div>
          )}
        </details>
        <details className="card">
          <summary className="cursor-pointer text-sm font-semibold">{tr("Ziele für diesen Monat festlegen", "Doelen voor deze maand vastleggen")}</summary>
          <p className="muted mt-2">{tr("Überlegt zu zweit, was realistisch ist – und besprecht es im Check-in. Ein gutes Ziel ist konkret und ein bisschen mutig.", "Bedenk samen wat realistisch is – en bespreek het in de check-in. Een goed doel is concreet en een beetje gedurfd.")}</p>
          <form action={saveSocialGoals} className="mt-2 grid grid-cols-2 gap-2">
            <input type="hidden" name="month" value={monthStart} />
            <div><label className="label">Follower ({tr("am Monatsende", "eind van de maand")})</label><input name="followers" inputMode="numeric" className="input" defaultValue={goal?.followers ?? ""} /></div>
            <div><label className="label">{tr("Reichweite im Monat", "Bereik in de maand")}</label><input name="reach" inputMode="numeric" className="input" defaultValue={goal?.reach ?? ""} /></div>
            <div><label className="label">{tr("Interaktionen im Monat", "Interacties in de maand")}</label><input name="interactions" inputMode="numeric" className="input" defaultValue={goal?.interactions ?? ""} /></div>
            <div />
            <div><label className="label">{tr("Beiträge pro Woche", "Posts per week")}</label><input name="posts" inputMode="numeric" className="input" defaultValue={postsGoal} /></div>
            <div><label className="label">{tr("Storys pro Woche", "Stories per week")}</label><input name="stories" inputMode="numeric" className="input" defaultValue={storiesGoal} /></div>
            <div className="col-span-2"><label className="label">{tr("Unser Ziel in einem Satz", "Ons doel in één zin")}</label><input name="note" className="input" defaultValue={goal?.note ?? ""} /></div>
            <div><Submit>{tr("Ziele speichern", "Doelen opslaan")}</Submit></div>
          </form>
        </details>
      </div>

      <h2 className="mb-2">{tr("Ideen & Planung", "Ideeën & planning")}</h2>
      {activeTags.length > 0 && (
        <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
          <Link href="/app/content" className={`badge shrink-0 !px-2.5 !py-1 ${!filter ? "bg-ink text-white" : "bg-white ring-1 ring-sand-300"}`}>{tr("Alle", "Alle")}</Link>
          {activeTags.map((x) => <Link key={x} href={`/app/content?f=${encodeURIComponent(x)}`} className={`badge shrink-0 !px-2.5 !py-1 ${filter === x ? "bg-ink text-white" : "bg-white ring-1 ring-sand-300"}`}>{x}</Link>)}
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <section className="space-y-2">
          {!shown.length && <Empty>{tr("Noch nichts geplant. Trag rechts die erste Idee ein.", "Nog niets gepland. Zet rechts het eerste idee erin.")}</Empty>}
          {shown.map((r) => (
            <div key={r.id} className="rounded-xl bg-white p-3 ring-1 ring-sand-200">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="badge bg-ink text-white">{KINDS[r.kind]}</span>
                <span className="text-xs text-stone-500">{r.date ? shortDate(r.date, user.lang) : tr("ohne Datum", "zonder datum")}</span>
                <Badge l={CONTENT_STATUS[r.status]} lang={user.lang} />
                {r.brand && <span className="badge bg-brand-light text-brand-dark">{r.brand}</span>}
                {r.pillar && <span className="badge bg-sand-100 text-stone-600">{r.pillar}</span>}
                {r.name && <span className="ml-auto"><Avatar name={r.name} color={r.color} size="h-6 w-6 text-[10px]" /></span>}
              </div>
              <div className="mt-1.5 text-sm font-medium">{r.title}</div>
              {r.idea && <div className="mt-0.5 whitespace-pre-wrap text-sm text-stone-600">{r.idea}</div>}
              {r.link && /^https?:\/\//i.test(r.link) && <a href={r.link} target="_blank" rel="noreferrer" className="mt-1 block truncate text-sm text-brand underline">{r.link}</a>}
              <div className="mt-2 flex items-center gap-2">
                <form action={setContentStatus}><input type="hidden" name="id" value={r.id} />
                  <AutoSubmitSelect name="status" defaultValue={r.status} className="input !w-auto !py-1 text-xs" key={r.status}>{allowed(r).map((k) => <option key={k} value={k}>{lbl(user.lang, CONTENT_STATUS[k])}</option>)}</AutoSubmitSelect>
                </form>
                <Link href={`/app/content?edit=${r.id}`} className="text-xs text-brand hover:underline">{tr("Bearbeiten", "Bewerken")}</Link>
              </div>
            </div>
          ))}
        </section>
        <aside className="card h-fit">
          <h3 className="mb-3 font-semibold">{editing ? tr("Bearbeiten", "Bewerken") : tr("Neue Idee", "Nieuw idee")}</h3>
          <form action={saveContent} className="space-y-3" key={editing?.id || `new${rows.length}`}>
            <input type="hidden" name="id" value={editing?.id || ""} />
            <div className="grid grid-cols-2 gap-2">
              <div><label className="label">Format</label><select name="kind" className="input" defaultValue={editing?.kind || "reel"}>{Object.entries(KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              <div><label className="label">{tr("Geplant für", "Gepland voor")}</label><input type="date" name="date" className="input" defaultValue={editing?.date || ""} /></div>
            </div>
            <div><label className="label">{tr("Titel", "Titel")}</label><input name="title" className="input" placeholder={tr("z. B. „Tenderflame am Abend“", "bijv. \"Tenderflame in de avond\"")} defaultValue={editing?.title} required /></div>
            <div><label className="label">{tr("Marke, Produkt oder Welt – wählen oder selbst tippen", "Merk, product of wereld – kiezen of zelf typen")}</label><input name="brand" list="brands" className="input" defaultValue={editing?.brand || ""} autoComplete="off" /><datalist id="brands">{brandOptions.map((x) => <option key={x} value={x} />)}</datalist></div>
            <div><label className="label">{tr("Säule / Thema – wählen oder selbst tippen", "Pijler / thema – kiezen of zelf typen")}</label><input name="pillar" list="pillars" className="input" defaultValue={editing?.pillar || ""} autoComplete="off" /><datalist id="pillars">{pillarOptions.map((x) => <option key={x} value={x} />)}</datalist></div>
            <div><label className="label">{tr("Idee: Hook (erste 2 Sekunden), was sieht man, Text, Musik", "Idee: hook (eerste 2 seconden), wat zie je, tekst, muziek")}</label><textarea name="idea" className="input" rows={5} defaultValue={editing?.idea || ""} /></div>
            <div><label className="label">{tr("Link zum Entwurf / Video in Drive", "Link naar concept / video in Drive")}</label><input name="link" className="input" placeholder="https://…" defaultValue={editing?.link || ""} /></div>
            <div><label className="label">{tr("Wer", "Wie")}</label><select name="owner_id" className="input" defaultValue={editing?.owner_id || user.id}>{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
            <div className="flex gap-2"><Submit>{tr("Speichern", "Opslaan")}</Submit>{editing && <Link href="/app/content" className="btn-ghost">{tr("Abbrechen", "Annuleren")}</Link>}</div>
          </form>
          {editing && <form action={deleteContent} className="mt-3"><input type="hidden" name="id" value={editing.id} /><ConfirmSubmit confirm={tr("Wirklich löschen?", "Echt verwijderen?")}>{tr("Löschen", "Verwijderen")}</ConfirmSubmit></form>}
        </aside>
      </div>
    </div>
  );
}
