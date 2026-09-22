import { requireUser } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { team } from "@/lib/server/queries";
import { T, pick } from "@/lib/i18n";
import { DAY_TITLES } from "@/lib/server/seed-data/pages-lea";
import { Avatar, PageHeader } from "@/components/ui";
import { ConfirmSubmit, Submit } from "@/components/client";
import { deleteOnboardingItem, saveOnboardingItem, toggleOnboarding } from "../actions";

export default async function Onboarding() {
  const user = await requireUser();
  const tr = T(user.lang);
  const isAdmin = user.role === "admin";
  const [items, checks, users] = await Promise.all([
    q<{ id: string; day: number; title_de: string; title_nl: string | null; hint_de: string | null; hint_nl: string | null }>("select * from onboarding_items order by day, position"),
    q<{ item_id: string; user_id: string }>("select item_id, user_id from onboarding_checks"),
    team(),
  ]);
  const interns = users.filter((u) => u.role === "intern");
  const has = (item: string, uid: string) => checks.some((c) => c.item_id === item && c.user_id === uid);
  const days = [...new Set(items.map((i) => i.day))];
  const mineDone = items.filter((i) => has(i.id, user.id)).length;

  return (
    <div className="max-w-3xl">
      <PageHeader title={tr("Deine erste Woche", "Je eerste week")} sub={tr("Hak ab, was erledigt ist – Lea und Bas sehen denselben Stand. Was am Ende der Woche noch offen ist, holt ihr im ersten Check-in nach.", "Vink af wat klaar is – Lea en Bas zien dezelfde stand. Wat aan het eind van de week nog open staat, halen jullie in bij de eerste check-in.")} />
      {!isAdmin && (
        <div className="card mb-5 !bg-brand-light">
          <div className="flex justify-between text-sm font-medium"><span>{tr("Fortschritt", "Voortgang")}</span><span>{mineDone} / {items.length}</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-brand" style={{ width: `${items.length ? (mineDone / items.length) * 100 : 0}%` }} /></div>
        </div>
      )}
      {isAdmin && interns.length > 0 && (
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          {interns.map((u) => {
            const n = items.filter((i) => has(i.id, u.id)).length;
            return (
              <div key={u.id} className="card"><div className="flex items-center gap-2 text-sm font-medium"><Avatar name={u.name} color={u.color} />{u.name}<span className="ml-auto text-stone-500">{n} / {items.length}</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand-100"><div className="h-full rounded-full" style={{ width: `${items.length ? (n / items.length) * 100 : 0}%`, background: u.color }} /></div></div>
            );
          })}
        </div>
      )}
      <div className="space-y-5">
        {days.map((d) => (
          <section key={d} className="card">
            <h2>{pick(user.lang, DAY_TITLES[d]?.de, DAY_TITLES[d]?.nl) || `${tr("Tag", "Dag")} ${d}`}</h2>
            {DAY_TITLES[d]?.sub_de && <p className="muted mb-2">{DAY_TITLES[d].sub_de}</p>}
            <ul className="divide-y divide-sand-200">
              {items.filter((i) => i.day === d).map((i) => (
                <li key={i.id} className="flex items-start gap-2 py-2">
                  {isAdmin ? (
                    <div className="flex-1 text-sm"><div className="font-medium">{pick(user.lang, i.title_de, i.title_nl)}</div>{i.hint_de && <div className="text-stone-500">{pick(user.lang, i.hint_de, i.hint_nl)}</div>}</div>
                  ) : (
                    <form action={toggleOnboarding} className="flex-1"><input type="hidden" name="item_id" value={i.id} />
                      <button className="flex w-full items-start gap-3 text-left text-sm">
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${has(i.id, user.id) ? "border-emerald-600 bg-emerald-600 text-white" : "border-sand-400 bg-white"}`}>{has(i.id, user.id) ? "✓" : ""}</span>
                        <span><span className={`block font-medium ${has(i.id, user.id) ? "text-stone-400 line-through" : ""}`}>{pick(user.lang, i.title_de, i.title_nl)}</span>{i.hint_de && <span className="block text-stone-500">{pick(user.lang, i.hint_de, i.hint_nl)}</span>}</span>
                      </button>
                    </form>
                  )}
                  {isAdmin && <span className="flex shrink-0 items-center gap-1 pt-0.5">{interns.map((u) => <span key={u.id} className={has(i.id, u.id) ? "" : "opacity-20"}><Avatar name={u.name} color={u.color} size="h-5 w-5 text-[9px]" /></span>)}
                    <form action={deleteOnboardingItem}><input type="hidden" name="id" value={i.id} /><ConfirmSubmit className="px-1 text-stone-300 hover:text-red-600" confirm="?">×</ConfirmSubmit></form></span>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {isAdmin && (
        <details className="card mt-5"><summary className="cursor-pointer font-semibold">{tr("Punkt hinzufügen", "Punt toevoegen")}</summary>
          <form action={saveOnboardingItem} className="mt-3 grid gap-2 sm:grid-cols-[6rem_1fr]" key={items.length}>
            <select name="day" className="input">{[1, 2, 3, 4].map((d) => <option key={d} value={d}>{tr("Tag", "Dag")} {d}</option>)}</select>
            <input name="title_de" className="input" placeholder={tr("Punkt", "Punt (Duits)")} required />
            <span /><input name="hint_de" className="input" placeholder={tr("Erklärung (optional)", "Toelichting (Duits, optioneel)")} />
            <span /><Submit>{tr("Hinzufügen", "Toevoegen")}</Submit>
          </form>
        </details>
      )}
    </div>
  );
}
