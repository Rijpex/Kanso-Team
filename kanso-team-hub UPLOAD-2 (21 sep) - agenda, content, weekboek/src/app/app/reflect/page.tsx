import { requireUser } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { T } from "@/lib/i18n";
import { addDays, dateTime, isoWeek, monday, shortDate, today } from "@/lib/dates";
import { Avatar, Empty, PageHeader } from "@/components/ui";
import { Submit } from "@/components/client";
import { saveReflection, saveReflectionFeedback } from "../actions";

type R = { id: string; user_id: string; week: string; learned: string | null; liked: string | null; hard: string | null; next: string | null; mood: number | null; feedback: string | null; feedback_at: string | null; name: string; color: string; fb_name: string | null };
const MOOD = ["", "schwierig", "eher mühsam", "okay", "gut", "richtig gut"];
const MOOD_NL = ["", "zwaar", "best lastig", "oké", "goed", "heel goed"];

export default async function Reflect({ searchParams }: { searchParams: { saved?: string; w?: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const isAdmin = user.role === "admin";
  const thisWeek = monday(today());
  const week = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.w || "") ? monday(searchParams.w!) : thisWeek;
  const rows = await q<R>(
    `select r.*, u.name, u.color, f.name as fb_name from reflections r join users u on u.id = r.user_id left join users f on f.id = r.feedback_by
      where ${isAdmin ? "true" : "r.user_id = $1"} order by r.week desc, u.name limit 120`, isAdmin ? [] : [user.id]);
  const mine = rows.find((r) => r.user_id === user.id && r.week === week);
  const moodLabel = (n: number | null) => (n ? (user.lang === "nl" ? MOOD_NL : MOOD)[n] : "");
  const Block = ({ k, v }: { k: string; v: string | null }) => (v ? <div><div className="label">{k}</div><p className="whitespace-pre-wrap text-sm">{v}</p></div> : null);
  const L = {
    learned: tr("Was habe ich diese Woche gelernt?", "Wat heb ik deze week geleerd?"),
    liked: tr("Was hat mir Spaß gemacht? Worauf bin ich stolz?", "Wat vond ik leuk? Waar ben ik trots op?"),
    hard: tr("Was war schwierig, langweilig oder unklar?", "Wat was lastig, saai of onduidelijk?"),
    next: tr("Was möchte ich als Nächstes lernen oder ausprobieren?", "Wat wil ik hierna leren of uitproberen?"),
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title={tr("Wochenrückblick", "Weekboek")} sub={isAdmin ? "Wat de stagiairs elke week opschrijven. Alleen jij, Lea en de schrijfster zelf zien dit – de andere stagiair niet. Reageer kort: dat is het waardevolste wat je in vijf minuten kunt doen." : tr("Fünf Minuten am Ende der Woche. Nur du, Lea und Bas sehen das. Ehrlich ist besser als schön – und du kannst es später für deinen Praktikumsbericht nutzen.", "Vijf minuten aan het eind van de week. Alleen jij, Lea en Bas zien dit. Eerlijk is beter dan mooi – en je kunt het later gebruiken voor je stageverslag.")} />
      {searchParams.saved && <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{tr("Gespeichert. Danke!", "Opgeslagen. Dank je!")}</p>}
      {!isAdmin && (
        <form action={saveReflection} className="card mb-6 space-y-3" key={week}>
          <input type="hidden" name="week" value={week} />
          <h2>{tr("KW", "Week")} {isoWeek(week)} · {shortDate(week, user.lang)} – {shortDate(addDays(week, 5), user.lang)}</h2>
          {(["learned", "liked", "hard", "next"] as const).map((k) => <div key={k}><label className="label">{L[k]}</label><textarea name={k} className="input" rows={2} defaultValue={mine?.[k] || ""} /></div>)}
          <div>
            <label className="label">{tr("Wie war die Woche insgesamt?", "Hoe was de week in het geheel?")}</label>
            <div className="flex flex-wrap gap-1.5">{[1, 2, 3, 4, 5].map((n) => <label key={n} className="cursor-pointer"><input type="radio" name="mood" value={n} defaultChecked={mine?.mood === n} className="peer sr-only" /><span className="block rounded-lg bg-white px-3 py-1.5 text-sm ring-1 ring-sand-300 peer-checked:bg-ink peer-checked:text-white">{moodLabel(n)}</span></label>)}</div>
          </div>
          <Submit>{tr("Speichern", "Opslaan")}</Submit>
        </form>
      )}
      {!rows.length && <Empty>{isAdmin ? "Nog geen weekboeken." : tr("Noch kein Rückblick. Fang diese Woche an.", "Nog geen terugblik. Begin deze week.")}</Empty>}
      <div className="space-y-3">
        {rows.filter((r) => isAdmin || r.week !== week).map((r) => (
          <section key={r.id} className="card space-y-2">
            <div className="flex items-center gap-2 text-sm"><Avatar name={r.name} color={r.color} size="h-6 w-6 text-[10px]" /><b>{r.name}</b><span className="text-stone-500">· {tr("KW", "week")} {isoWeek(r.week)} · {shortDate(r.week, user.lang)}</span>{r.mood && <span className="badge ml-auto bg-sand-100 text-stone-700">{moodLabel(r.mood)}</span>}</div>
            <Block k={L.learned} v={r.learned} /><Block k={L.liked} v={r.liked} /><Block k={L.hard} v={r.hard} /><Block k={L.next} v={r.next} />
            {r.feedback && <div className="rounded-xl bg-brand-light p-3 text-sm"><div className="mb-0.5 text-xs text-stone-500">{r.fb_name}{r.feedback_at ? ` · ${dateTime(r.feedback_at, user.lang)}` : ""}</div><span className="whitespace-pre-wrap">{r.feedback}</span></div>}
            {isAdmin && <form action={saveReflectionFeedback} className="flex gap-2"><input type="hidden" name="id" value={r.id} /><input name="feedback" className="input" placeholder="Reactie (in het Duits) …" defaultValue={r.feedback || ""} /><Submit className="btn-ghost">Stuur</Submit></form>}
          </section>
        ))}
      </div>
    </div>
  );
}
