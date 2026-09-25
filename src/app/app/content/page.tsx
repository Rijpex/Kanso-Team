import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { q, q1 } from "@/lib/server/db";
import { team } from "@/lib/server/queries";
import { BRANDS, CHANNEL, CONTENT_STATUS, PILLARS, T, lbl } from "@/lib/i18n";
import { addDays, dayName, monday, monthName, shortDate, today } from "@/lib/dates";
import { Avatar, Badge, Empty, PageHeader } from "@/components/ui";
import { AutoSubmitSelect, ConfirmSubmit, Submit } from "@/components/client";
import { GoalBar, Sparkline } from "@/components/Progress";
import { CONTENT_STARTERS, WEEK_FORMATS } from "@/lib/content-ideas";
import { deleteContent, saveContent, saveSocialGoals, saveSocialStats, setContentStatus } from "../actions";

type Row = { id: string; date: string | null; kind: string; title: string; idea: string | null; status: string; owner_id: string | null; link: string | null; pillar: string | null; brand: string | null; channel: string | null; name: string | null; color: string | null };
type Stat = { date: string; followers: number | null; reach: number | null; interactions: number | null; profile_visits: number | null; tt_followers: number | null; tt_reach: number | null; tt_interactions: number | null; note: string | null };
type Goal = { followers: number | null; reach: number | null; interactions: number | null; posts: number | null; stories: number | null; tt_followers: number | null; tt_reach: number | null; note: string | null };
const KINDS: Record<string, string> = { reel: "Reel", story: "Story", post: "Karussell / Foto" };

export default async function Content({ searchParams }: { searchParams: { edit?: string; f?: string; use?: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const now = today();
  const mon = monday(now);
  const monthStart = `${now.slice(0, 7)}-01`;
  const [rows, users, stats, goal, usedTags] = await Promise.all([
    q<Row>("select c.*, u.name, u.color from content_items c left join users u on u.id = c.owner_id where c.status <> 'posted' or c.date >= $1 or c.date is null order by c.date nulls last, c.created_at", [addDays(mon, -14)]),
    team(),
    q<Stat>("select date, followers, reach, interactions, profile_visits, tt_followers, tt_reach, tt_interactions, note from social_stats order by date desc limit 12"),
    q1<Goal>("select * from social_goals where month = $1", [monthStart]),
    q<{ pillar: string | null; brand: string | null }>("select distinct pillar, brand from content_items"),
  ]);
  const postsGoal = goal?.posts ?? 3;
  const storiesGoal = goal?.stories ?? 4;
  const week = rows.filter((r) => r.date && r.date >= mon && r.date <= addDays(mon, 6));
  const isDone = (r: Row) => r.status === "posted";
  const posts = week.filter((r) => r.kind !== "story");
  const stories = week.filter((r) => r.kind === "story");
  const pillarsDone = new Set(week.filter(isDone).map((r) => r.pillar).filter(Boolean)).size;
  const pillarsPlanned = new Set(week.map((r) => r.pillar).filter(Boolean)).size;
  const latest = stats[0];
  const prev = stats[1];
  const monthStats = stats.filter((s) => s.date >= monthStart);
  const sum = (f: (s: Stat) => number | null) => monthStats.reduce((n, s) => n + (f(s) || 0), 0);
  const reachMonth = sum((s) => s.reach);
  const interMonth = sum((s) => s.interactions);
  const ttReachMonth = sum((s) => s.tt_reach);
  const ttInterMonth = sum((s) => s.tt_interactions);
  const delta = (a?: number | null, b?: number | null) => (a != null && b != null ? a - b : null);
  const dFollow = delta(latest?.followers, prev?.followers);
  const dTt = delta(latest?.tt_followers, prev?.tt_followers);
  const editing = rows.find((r) => r.id === searchParams.edit);
  const starter = !editing ? CONTENT_STARTERS.find((x) => x.id === searchParams.use) : undefined;
  const allowed = (r: Row) => Object.keys(CONTENT_STATUS).filter((k) => user.role === "admin" || (k !== "approved" && (k !== "posted" || r.status === "approved")) || k === r.status);
  const pillarOptions = [...new Set([...PILLARS, ...usedTags.map((u) => u.pillar).filter(Boolean) as string[]])];
  const brandOptions = [...new Set([...BRANDS, ...usedTags.map((u) => u.brand).filter(Boolean) as string[]])];
  const filter = searchParams.f || "";
  const shown = filter ? rows.filter((r) => r.brand === filter || r.pillar === filter) : rows;
  const activeTags = [...new Set(rows.flatMap((r) => [r.brand, r.pillar]).filter(Boolean) as string[])];
  const usedBrands = new Set(rows.map((r) => r.brand).filter(Boolean) as string[]);

  return (
    <div>
      <PageHeader title={tr("Content-Plan", "Contentplan")} sub={tr("Planen, drehen, freigeben lassen, posten – auf Instagram und TikTok. Veröffentlicht wird erst nach Freigabe durch Lea.", "Plannen, filmen, laten goedkeuren, posten – op Instagram en TikTok. Publiceren pas na goedkeuring door Lea.")} />

      <h2 className="mb-2">{tr("Wochenziele – das wollen wir jede Woche schaffen", "Weekdoelen – dit willen we elke week halen")}</h2>
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <GoalBar label={tr("Beiträge (Reel, Karussell, Foto)", "Posts (reel, carrousel, foto)")} done={posts.filter(isDone).length} planned={posts.filter((r) => !isDone(r)).length} goal={postsGoal} hint={tr("dunkel = gepostet, hell = geplant", "donker = gepost, licht = gepland")} />
        <GoalBar label={tr("Storys", "Stories")} done={stories.filter(isDone).length} planned={stories.filter((r) => !isDone(r)).length} goal={storiesGoal} hint={tr("vier pro Woche – nicht jeden Tag", "vier per week – niet elke dag")} />
        <GoalBar label={tr("Verschiedene Säulen", "Verschillende pijlers")} done={pillarsDone} planned={Math.max(0, pillarsPlanned - pillarsDone)} goal={3} hint={tr("mindestens drei pro Woche", "minstens drie per week")} />
      </div>
      <details className="card mb-6 !bg-sand-100">
        <summary className="cursor-pointer text-sm font-semibold">{tr("Was ist eine „Säule“?", "Wat is een \"pijler\"?")}</summary>
        <div className="mt-2 space-y-2 text-sm text-stone-700">
          <p>{tr(
            "Eine Säule ist ein festes Thema, über das wir immer wieder posten. Wir haben ein paar davon – und jeder Beitrag gehört zu einer. So sieht der Feed abwechslungsreich aus und wir zeigen nicht nur Produkte, sondern auch, wie man damit lebt.",
            "Een pijler is een vast thema waar we steeds over posten. We hebben er een paar – en elke post hoort bij één pijler. Zo blijft de feed afwisselend en laten we niet alleen producten zien, maar ook hoe je ermee leeft.",
          )}</p>
          <ul className="grid gap-1 sm:grid-cols-2">
            {PILLARS.map((p) => <li key={p} className="rounded-lg bg-white px-2 py-1 text-sm ring-1 ring-sand-200">{p}</li>)}
          </ul>
          <p className="text-stone-600">{tr(
            "Ziel: mindestens drei verschiedene Säulen pro Woche. Drei Beiträge über Produkte in Folge wären drei Mal dieselbe Säule – das wird langweilig. Eigene Säule erfinden? Einfach in das Feld tippen.",
            "Doel: minstens drie verschillende pijlers per week. Drie productposts achter elkaar zijn drie keer dezelfde pijler – dat wordt saai. Zelf een pijler bedenken? Typ die gewoon in het veld.",
          )}</p>
        </div>
      </details>

      <div className="card mb-6 !p-3">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-stone-500"><span>{tr("Diese Woche Tag für Tag", "Deze week dag voor dag")}</span><span className="font-normal normal-case tracking-normal">{tr("KW", "week")} {mon.slice(5)}</span></div>
        <div className="grid grid-cols-7 gap-1">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const d = addDays(mon, i);
            const items = rows.filter((r) => r.date === d);
            const st = items.filter((r) => r.kind === "story"); const po = items.filter((r) => r.kind !== "story");
            const cls = (list: Row[]) => (list.some(isDone) ? "bg-emerald-600 text-white" : list.some((r) => r.status === "approved") ? "bg-emerald-200 text-emerald-900" : list.length ? "bg-sand-300 text-ink" : "bg-sand-100 text-stone-300");
            const missed = d < now && items.length > 0 && !items.some(isDone);
            return (
              <div key={d} className={`rounded-lg p-1.5 text-center ${d === now ? "ring-2 ring-ink" : "ring-1 ring-sand-200"} ${missed ? "bg-red-50" : ""}`}>
                <div className="text-[11px] font-semibold capitalize">{dayName(d, user.lang)} {Number(d.slice(8))}</div>
                <div className={`mt-1 rounded px-1 text-[10px] ${cls(st)}`}>Story{st.length > 1 ? ` ×${st.length}` : ""}</div>
                <div className={`mt-0.5 rounded px-1 text-[10px] ${cls(po)}`}>{po.length ? `${po.length} ${tr("Beitr.", "post")}` : "–"}</div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-stone-500">{tr("grün = gepostet · hellgrün = freigegeben · beige = geplant · rot = geplant, aber nicht gepostet", "groen = gepost · lichtgroen = goedgekeurd · beige = gepland · rood = gepland, maar niet gepost")}</p>
      </div>

      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2>{tr("Zahlen", "Cijfers")} · <span className="capitalize">{monthName(monthStart, user.lang)}</span></h2>
        {latest && <span className="text-xs text-stone-500">{tr("Stand", "Stand")}: {shortDate(latest.date, user.lang)}</span>}
      </div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">Instagram</div>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <GoalBar label="Follower" done={latest?.followers ?? 0} goal={goal?.followers ?? 0} hint={dFollow != null ? `${dFollow >= 0 ? "+" : ""}${dFollow} ${tr("seit dem letzten Eintrag", "sinds de vorige meting")}` : latest ? tr("erster Eintrag – ab nächster Woche siehst du den Zuwachs", "eerste meting – vanaf volgende week zie je de groei") : tr("Noch keine Zahlen eingetragen", "Nog geen cijfers ingevuld")} />
        <GoalBar label={tr("Reichweite diesen Monat", "Bereik deze maand")} done={reachMonth} goal={goal?.reach ?? 0} hint={tr("Summe der Wocheneinträge", "som van de weekmetingen")} />
        <GoalBar label={tr("Interaktionen diesen Monat", "Interacties deze maand")} done={interMonth} goal={goal?.interactions ?? 0} hint={tr("Likes, Kommentare, Shares, Saves", "likes, reacties, shares, saves")} />
      </div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">TikTok</div>
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <GoalBar label="Follower" done={latest?.tt_followers ?? 0} goal={goal?.tt_followers ?? 0} hint={dTt != null ? `${dTt >= 0 ? "+" : ""}${dTt} ${tr("seit dem letzten Eintrag", "sinds de vorige meting")}` : tr("TikTok-Zahlen findest du unter Profil → Analytics", "TikTok-cijfers vind je onder Profiel → Analytics")} />
        <GoalBar label={tr("Aufrufe diesen Monat", "Weergaven deze maand")} done={ttReachMonth} goal={goal?.tt_reach ?? 0} hint={tr("Video Views der letzten 7 Tage, addiert", "video views van de laatste 7 dagen, opgeteld")} />
        <GoalBar label={tr("Interaktionen diesen Monat", "Interacties deze maand")} done={ttInterMonth} goal={0} hint={tr("Likes, Kommentare, Shares – noch ohne Ziel", "likes, reacties, shares – nog zonder doel")} />
      </div>
      {!goal && <p className="mb-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"><b>{tr("Für diesen Monat sind noch keine Ziele gesetzt.", "Voor deze maand zijn nog geen doelen gezet.")}</b> {tr("Überlegt zu zweit, was ihr bis Monatsende erreichen wollt, und tragt es unten rechts ein. Ziele, die man sich selbst setzt, erreicht man eher.", "Bedenk samen wat jullie tot het eind van de maand willen halen en vul het rechtsonder in. Doelen die je zelf stelt, haal je eerder.")}</p>}
      {goal?.note && <p className="mb-3 rounded-xl bg-brand-light p-3 text-sm"><b>{tr("Unser Monatsziel in einem Satz", "Ons maanddoel in één zin")}:</b> {goal.note}</p>}
      <div className="mb-7 grid gap-3 lg:grid-cols-2">
        <details className="card">
          <summary className="cursor-pointer text-sm font-semibold">{tr("Zahlen eintragen (einmal pro Woche, montags)", "Cijfers invullen (één keer per week, maandag)")}</summary>
          <p className="muted mt-2">{tr("Instagram → Professional Dashboard → Insights, Zeitraum „Letzte 7 Tage“. TikTok → Profil → Menü → Creator-Tools → Analytics, ebenfalls 7 Tage.", "Instagram → Professional dashboard → Insights, periode „Laatste 7 dagen“. TikTok → Profiel → Menu → Creator tools → Analytics, ook 7 dagen.")}</p>
          <form action={saveSocialStats} className="mt-2 grid grid-cols-2 gap-2" key={stats.length}>
            <div className="col-span-2"><label className="label">{tr("Datum", "Datum")}</label><input type="date" name="date" className="input" defaultValue={now} required /></div>
            <div className="col-span-2 text-xs font-semibold uppercase tracking-wide text-stone-400">Instagram</div>
            <div><label className="label">Follower ({tr("gesamt", "totaal")})</label><input name="followers" inputMode="numeric" className="input" defaultValue={latest?.date === now ? latest.followers ?? "" : ""} /></div>
            <div><label className="label">{tr("Reichweite (7 Tage)", "Bereik (7 dagen)")}</label><input name="reach" inputMode="numeric" className="input" /></div>
            <div><label className="label">{tr("Interaktionen (7 Tage)", "Interacties (7 dagen)")}</label><input name="interactions" inputMode="numeric" className="input" /></div>
            <div><label className="label">{tr("Profilaufrufe (7 Tage)", "Profielbezoeken (7 dagen)")}</label><input name="profile_visits" inputMode="numeric" className="input" /></div>
            <div className="col-span-2 text-xs font-semibold uppercase tracking-wide text-stone-400">TikTok</div>
            <div><label className="label">Follower ({tr("gesamt", "totaal")})</label><input name="tt_followers" inputMode="numeric" className="input" defaultValue={latest?.date === now ? latest.tt_followers ?? "" : ""} /></div>
            <div><label className="label">{tr("Aufrufe (7 Tage)", "Weergaven (7 dagen)")}</label><input name="tt_reach" inputMode="numeric" className="input" /></div>
            <div><label className="label">{tr("Interaktionen (7 Tage)", "Interacties (7 dagen)")}</label><input name="tt_interactions" inputMode="numeric" className="input" /></div>
            <div />
            <div className="col-span-2"><label className="label">{tr("Was ist aufgefallen? Welcher Beitrag lief am besten – und warum?", "Wat viel op? Welke post liep het best – en waarom?")}</label><input name="note" className="input" /></div>
            <div><Submit>{tr("Speichern", "Opslaan")}</Submit></div>
          </form>
          {stats.length > 0 && (
            <div className="mt-4">
              <div className="mb-1 flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold uppercase text-stone-400">Follower IG</span><Sparkline values={[...stats].reverse().map((s) => s.followers ?? 0)} />
                {stats.some((s) => s.tt_followers != null) && <><span className="text-xs font-semibold uppercase text-stone-400">TikTok</span><Sparkline values={[...stats].reverse().map((s) => s.tt_followers ?? 0)} color="#3f6f8f" /></>}
              </div>
              <table className="w-full text-xs"><thead><tr className="text-left text-stone-400"><th className="py-1 font-medium">{tr("Datum", "Datum")}</th><th className="font-medium">IG</th><th className="font-medium">{tr("Reichw.", "Bereik")}</th><th className="font-medium">{tr("Interakt.", "Interact.")}</th><th className="font-medium">TT</th><th className="font-medium">{tr("Aufrufe", "Weergav.")}</th></tr></thead>
                <tbody>{stats.map((s) => <tr key={s.date} className="border-t border-sand-200"><td className="py-1">{shortDate(s.date, user.lang)}</td><td className="tabular-nums">{s.followers ?? "–"}</td><td className="tabular-nums">{s.reach ?? "–"}</td><td className="tabular-nums">{s.interactions ?? "–"}</td><td className="tabular-nums">{s.tt_followers ?? "–"}</td><td className="tabular-nums">{s.tt_reach ?? "–"}</td></tr>)}</tbody></table>
            </div>
          )}
        </details>
        <details className="card" open={!goal}>
          <summary className="cursor-pointer text-sm font-semibold">{tr("Eure Ziele für diesen Monat", "Jullie doelen voor deze maand")}</summary>
          <p className="muted mt-2">{tr("Überlegt zu zweit, was realistisch ist – und besprecht es im Check-in. Ein gutes Ziel ist konkret und ein bisschen mutig.", "Bedenk samen wat realistisch is – en bespreek het in de check-in. Een goed doel is concreet en een beetje gedurfd.")}</p>
          <form action={saveSocialGoals} className="mt-2 grid grid-cols-2 gap-2">
            <input type="hidden" name="month" value={monthStart} />
            <div><label className="label">Follower IG ({tr("am Monatsende", "eind van de maand")})</label><input name="followers" inputMode="numeric" className="input" defaultValue={goal?.followers ?? ""} /></div>
            <div><label className="label">{tr("Reichweite IG im Monat", "Bereik IG in de maand")}</label><input name="reach" inputMode="numeric" className="input" defaultValue={goal?.reach ?? ""} /></div>
            <div><label className="label">{tr("Interaktionen IG im Monat", "Interacties IG in de maand")}</label><input name="interactions" inputMode="numeric" className="input" defaultValue={goal?.interactions ?? ""} /></div>
            <div />
            <div><label className="label">Follower TikTok</label><input name="tt_followers" inputMode="numeric" className="input" defaultValue={goal?.tt_followers ?? ""} /></div>
            <div><label className="label">{tr("Aufrufe TikTok im Monat", "Weergaven TikTok in de maand")}</label><input name="tt_reach" inputMode="numeric" className="input" defaultValue={goal?.tt_reach ?? ""} /></div>
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
          {!shown.length && <Empty>{tr("Noch nichts geplant. Trag rechts die erste Idee ein – oder nimm unten eine Startidee.", "Nog niets gepland. Zet rechts het eerste idee erin – of pak hieronder een startidee.")}</Empty>}
          {shown.map((r) => (
            <div key={r.id} className="rounded-xl bg-white p-3 ring-1 ring-sand-200">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="badge bg-ink text-white">{KINDS[r.kind]}</span>
                {r.channel && r.channel !== "both" && <Badge l={CHANNEL[r.channel]} lang={user.lang} />}
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
        <aside className="card h-fit" id="neu">
          <h3 className="mb-3 font-semibold">{editing ? tr("Bearbeiten", "Bewerken") : starter ? tr("Startidee übernehmen", "Startidee overnemen") : tr("Neue Idee", "Nieuw idee")}</h3>
          {starter && <p className="mb-3 rounded-xl bg-brand-light p-2 text-xs">{tr("Aus der Ideenliste geladen – ändere Titel, Hook und Datum so, wie es zu dir passt.", "Uit de ideeënlijst geladen – pas titel, hook en datum aan zoals het bij jou past.")}</p>}
          <form action={saveContent} className="space-y-3" key={editing?.id || starter?.id || `new${rows.length}`}>
            <input type="hidden" name="id" value={editing?.id || ""} />
            <div className="grid grid-cols-2 gap-2">
              <div><label className="label">Format</label><select name="kind" className="input" defaultValue={editing?.kind || starter?.kind || "reel"}>{Object.entries(KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              <div><label className="label">{tr("Geplant für", "Gepland voor")}</label><input type="date" name="date" className="input" defaultValue={editing?.date || ""} /></div>
            </div>
            <div><label className="label">{tr("Kanal", "Kanaal")}</label><select name="channel" className="input" defaultValue={editing?.channel || starter?.channel || "both"}>{Object.entries(CHANNEL).map(([k, l]) => <option key={k} value={k}>{lbl(user.lang, l)}</option>)}</select></div>
            <div><label className="label">{tr("Titel", "Titel")}</label><input name="title" className="input" placeholder={tr("z. B. „Tenderflame am Abend“", "bijv. \"Tenderflame in de avond\"")} defaultValue={editing?.title || starter?.title || ""} required /></div>
            <div><label className="label">{tr("Marke, Produkt oder Welt – wählen oder selbst tippen", "Merk, product of wereld – kiezen of zelf typen")}</label><input name="brand" list="brands" className="input" defaultValue={editing?.brand || starter?.brand || ""} autoComplete="off" /><datalist id="brands">{brandOptions.map((x) => <option key={x} value={x} />)}</datalist></div>
            <div><label className="label">{tr("Säule / Thema – wählen oder selbst tippen", "Pijler / thema – kiezen of zelf typen")}</label><input name="pillar" list="pillars" className="input" defaultValue={editing?.pillar || starter?.pillar || ""} autoComplete="off" /><datalist id="pillars">{pillarOptions.map((x) => <option key={x} value={x} />)}</datalist></div>
            <div><label className="label">{tr("Idee: Hook (erste 2 Sekunden), was sieht man, Text, Musik", "Idee: hook (eerste 2 seconden), wat zie je, tekst, muziek")}</label><textarea name="idea" className="input" rows={starter ? 8 : 5} defaultValue={editing?.idea || starter?.idea || ""} /></div>
            <div><label className="label">{tr("Link zum Entwurf / Video in Drive", "Link naar concept / video in Drive")}</label><input name="link" className="input" placeholder="https://…" defaultValue={editing?.link || ""} /></div>
            <div><label className="label">{tr("Wer", "Wie")}</label><select name="owner_id" className="input" defaultValue={editing?.owner_id || user.id}>{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
            <div className="flex gap-2"><Submit>{tr("Speichern", "Opslaan")}</Submit>{(editing || starter) && <Link href="/app/content" className="btn-ghost">{tr("Abbrechen", "Annuleren")}</Link>}</div>
          </form>
          {editing && <form action={deleteContent} className="mt-3"><input type="hidden" name="id" value={editing.id} /><ConfirmSubmit confirm={tr("Wirklich löschen?", "Echt verwijderen?")}>{tr("Löschen", "Verwijderen")}</ConfirmSubmit></form>}
        </aside>
      </div>

      {/* ── Startideeën: vaste weekindeling + ideeën per merk ── */}
      <h2 className="mt-8 mb-1">{tr("Ideen zum Starten", "Ideeën om te starten")}</h2>
      <p className="muted mb-3">{tr(
        "Wenn du nicht weißt, was du drehen sollst: nimm eine Idee von hier, klick „Übernehmen“ und mach sie zu deiner. Sie steht dann als Idee im Plan und Lea gibt sie frei.",
        "Weet je niet wat je moet filmen: pak hier een idee, klik \"Overnemen\" en maak het je eigen. Het staat dan als idee in het plan en Lea keurt het goed.",
      )}</p>
      <div className="card mb-4 !p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">{tr("Fester Wochenrhythmus – gleicher Tag, gleiches Format", "Vast weekritme – zelfde dag, zelfde format")}</div>
        <ul className="grid gap-2 sm:grid-cols-5">
          {WEEK_FORMATS.map((w) => (
            <li key={w.day} className="rounded-xl bg-sand-100 p-2">
              <div className="text-xs font-semibold text-stone-500">{w.day}</div>
              <div className="text-sm font-medium">{user.lang === "nl" ? w.nl : w.de}</div>
              <div className="mt-0.5 text-xs text-stone-500">{user.lang === "nl" ? w.hint.nl : w.hint.de}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CONTENT_STARTERS.map((x) => (
          <div key={x.id} className="flex flex-col rounded-xl bg-white p-3 ring-1 ring-sand-200">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <span className="badge bg-ink text-white">{KINDS[x.kind]}</span>
              <Badge l={CHANNEL[x.channel]} lang={user.lang} />
              {x.brand && <span className={`badge ${usedBrands.has(x.brand) ? "bg-sand-100 text-stone-500" : "bg-brand-light text-brand-dark"}`}>{x.brand}</span>}
            </div>
            <div className="text-sm font-medium leading-snug">{x.title}</div>
            <div className="mt-1 whitespace-pre-wrap text-xs text-stone-600">{x.idea}</div>
            <div className="mt-2 text-xs text-stone-500"><b>{tr("Warum", "Waarom")}:</b> {user.lang === "nl" ? x.why.nl : x.why.de}</div>
            <div className="mt-2 flex items-center gap-2 pt-1">
              <Link href={`/app/content?use=${x.id}#neu`} className="btn-ghost btn-sm">{tr("Übernehmen", "Overnemen")}</Link>
              <span className="badge bg-sand-100 text-stone-500">{x.pillar}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-stone-500">{tr(
        "Marken, über die wir noch nichts geplant haben, sind farbig markiert. Jede Marke im Laden verdient mindestens einen Beitrag – Lieferanten sehen das und teilen es oft mit.",
        "Merken waarover nog niets gepland staat, zijn gekleurd. Elk merk in de winkel verdient minstens één post – leveranciers zien dat en delen het vaak mee.",
      )}</p>
    </div>
  );
}
