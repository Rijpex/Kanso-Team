import { requireUser } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { team } from "@/lib/server/queries";
import { T, pick } from "@/lib/i18n";
import { Avatar, PageHeader } from "@/components/ui";
import { ConfirmSubmit, Submit } from "@/components/client";
import { deleteSkill, saveSkill, setSkillLevel } from "../actions";

const LV = { de: ["noch nicht", "gesehen", "mit Hilfe", "selbstständig"], nl: ["nog niet", "gezien", "met hulp", "zelfstandig"] };

export default async function Skills() {
  const user = await requireUser();
  const tr = T(user.lang);
  const isAdmin = user.role === "admin";
  const [skills, levels, users] = await Promise.all([
    q<{ id: string; area: string; title_de: string; title_nl: string | null }>("select * from skills order by position"),
    q<{ skill_id: string; user_id: string; level: number; confirmed: number }>("select skill_id, user_id, level, confirmed from skill_levels"),
    team(),
  ]);
  const people = isAdmin ? users.filter((u) => u.role === "intern") : users.filter((u) => u.id === user.id);
  const lv = (sid: string, uid: string) => levels.find((l) => l.skill_id === sid && l.user_id === uid);
  const areas = [...new Set(skills.map((s) => s.area))];
  const labels = LV[user.lang];

  return (
    <div className="max-w-4xl">
      <PageHeader title={tr("Lernziele", "Leerdoelen")} sub={isAdmin ? tr("Was die Praktikantinnen am Ende des Jahres können sollen. Sie schätzen sich selbst ein, du bestätigst das Niveau, das du gesehen hast. Hilfreich fürs Schulgespräch und fürs Zeugnis.", "Wat de stagiairs aan het eind van het jaar moeten kunnen. Zij schatten zichzelf in; jij bevestigt het niveau dat je hebt gezien. Handig voor het stagegesprek met school en voor het getuigschrift.") : tr("Was du am Ende des Praktikums können sollst. Schätz dich selbst ein – Lea und Bas bestätigen, was sie gesehen haben. Das hilft dir beim Schulgespräch und im Zeugnis.", "Wat je aan het eind van de stage moet kunnen. Schat jezelf in – Lea en Bas bevestigen wat ze hebben gezien. Dat helpt bij het gesprek met school en in je getuigschrift.")} />
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        {people.map((p) => {
          const mine = levels.filter((l) => l.user_id === p.id);
          const own = mine.filter((l) => l.level >= 3).length;
          const conf = mine.filter((l) => l.confirmed >= 3).length;
          return (
            <div key={p.id} className="card"><div className="flex items-center gap-2 text-sm font-medium"><Avatar name={p.name} color={p.color} />{p.name}<span className="ml-auto text-stone-500">{conf} / {skills.length} {tr("bestätigt selbstständig", "bevestigd zelfstandig")}</span></div>
              <div className="relative mt-2 h-2.5 overflow-hidden rounded-full bg-sand-100"><div className="absolute inset-y-0 left-0 rounded-full bg-sand-300" style={{ width: `${skills.length ? (own / skills.length) * 100 : 0}%` }} /><div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${skills.length ? (conf / skills.length) * 100 : 0}%`, background: p.color }} /></div></div>
          );
        })}
      </div>
      {areas.map((a) => (
        <section key={a} className="card mb-4">
          <h2 className="mb-2">{a}</h2>
          <ul className="divide-y divide-sand-200">
            {skills.filter((s) => s.area === a).map((s) => (
              <li key={s.id} className="py-2.5">
                <div className="flex items-start justify-between gap-2 text-sm font-medium">{pick(user.lang, s.title_de, s.title_nl)}{isAdmin && <form action={deleteSkill}><input type="hidden" name="id" value={s.id} /><ConfirmSubmit className="px-1 text-stone-300 hover:text-red-600" confirm="?">×</ConfirmSubmit></form>}</div>
                {people.map((p) => {
                  const cur = lv(s.id, p.id);
                  const value = isAdmin ? cur?.confirmed ?? 0 : cur?.level ?? 0;
                  return (
                    <form key={p.id} action={setSkillLevel} className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <input type="hidden" name="skill_id" value={s.id} /><input type="hidden" name="user_id" value={p.id} />
                      {isAdmin && <span className="w-16 shrink-0 text-xs font-semibold" style={{ color: p.color }}>{p.name}</span>}
                      {labels.map((l, i) => <button key={i} name="level" value={i} className={`rounded-md px-2 py-1 text-xs ring-1 ${value === i ? "bg-ink text-white ring-ink" : "bg-white text-stone-600 ring-sand-300 hover:bg-sand-100"}`}>{l}</button>)}
                      {isAdmin ? <span className="text-xs text-stone-400">{tr("selbst", "zelf")}: {labels[cur?.level ?? 0]}</span> : (cur?.confirmed ?? 0) > 0 && <span className="badge bg-emerald-100 text-emerald-800">{tr("bestätigt", "bevestigd")}: {labels[cur!.confirmed]}</span>}
                    </form>
                  );
                })}
              </li>
            ))}
          </ul>
        </section>
      ))}
      {isAdmin && (
        <details className="card"><summary className="cursor-pointer font-semibold">{tr("Lernziel hinzufügen", "Leerdoel toevoegen")}</summary>
          <form action={saveSkill} className="mt-3 grid gap-2 sm:grid-cols-[12rem_1fr_auto]" key={skills.length}><input name="area" list="areas" className="input" placeholder={tr("Bereich", "Gebied")} required /><datalist id="areas">{areas.map((a) => <option key={a} value={a} />)}</datalist><input name="title_de" className="input" placeholder={tr("Lernziel", "Leerdoel (Duits)")} required /><Submit>{tr("Hinzufügen", "Toevoegen")}</Submit></form>
        </details>
      )}
    </div>
  );
}
