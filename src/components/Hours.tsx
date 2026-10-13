import Link from "next/link";
import { T, type Lang } from "@/lib/i18n";
import { fmtHours } from "@/lib/hours";
import type { HoursRow } from "@/lib/server/queries";
import { Avatar } from "@/components/ui";

/** Balk naar het stagedoel: donker = gemaakt, licht = al ingepland in het rooster. */
export function GoalBarHours({ done, planned, target }: { done: number; planned: number; target: number }) {
  const pct = (n: number) => `${target > 0 ? Math.min(100, (n / target) * 100) : 0}%`;
  const reached = target > 0 && done >= target;
  return (
    <div className="relative mt-2 h-2.5 overflow-hidden rounded-full bg-sand-100">
      <div className="absolute inset-y-0 left-0 rounded-full bg-sand-300" style={{ width: pct(done + planned) }} />
      <div className={`absolute inset-y-0 left-0 rounded-full ${reached ? "bg-emerald-600" : "bg-ink"}`} style={{ width: pct(done) }} />
    </div>
  );
}

/**
 * Urenteller op Vandaag en onder het rooster.
 * Stagiaire ziet haar eigen stand naar de 900 uur, Bas en Lea zien beide stagiaires.
 * De details (per maand, per dag, correcties) staan op /app/hours.
 */
export function HoursCard({ rows, lang, me, isAdmin }: { rows: HoursRow[]; lang: Lang; me: { id: string }; isAdmin: boolean }) {
  const tr = T(lang);
  const mine = rows.find((r) => r.user_id === me.id);
  const list = isAdmin ? rows : mine ? [mine] : [];
  if (!list.length) return null;

  if (!isAdmin && mine) {
    const left = Math.max(0, mine.targetMinutes - mine.doneMinutes);
    const pct = mine.targetMinutes ? Math.round((mine.doneMinutes / mine.targetMinutes) * 100) : 0;
    return (
      <section className="card">
        <div className="mb-1 flex items-baseline justify-between">
          <h2>{tr("Deine Praktikumsstunden", "Jouw stage-uren")}</h2>
          <Link href="/app/hours" className="text-sm text-brand hover:underline">{tr("Details", "Details")} →</Link>
        </div>
        <div className="text-3xl font-semibold tabular-nums">
          {fmtHours(mine.doneMinutes)}<span className="text-base font-normal text-stone-400"> {tr("von", "van")} {fmtHours(mine.targetMinutes)} {tr("Stunden", "uur")} · {pct} %</span>
        </div>
        <GoalBarHours done={mine.doneMinutes} planned={mine.futureMinutes} target={mine.targetMinutes} />
        <div className="mt-1 text-xs text-stone-500">
          {left > 0
            ? tr(`Noch ${fmtHours(left)} Stunden. Hell im Balken: ${fmtHours(mine.futureMinutes)} sind schon eingeplant.`,
                 `Nog ${fmtHours(left)} uur. Licht in de balk: ${fmtHours(mine.futureMinutes)} staat al ingepland.`)
            : tr("Geschafft – die Stunden sind voll.", "Gehaald – de uren zijn vol.")}
        </div>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            { k: tr("Diese Woche", "Deze week"), v: `${fmtHours(mine.weekDone)} / ${fmtHours(mine.weekPlanned)} h` },
            { k: tr("Dieser Monat", "Deze maand"), v: `${fmtHours(mine.monthDone)} h` },
            { k: tr("Arbeitstage", "Werkdagen"), v: String(mine.days) },
          ].map((x) => (
            <div key={x.k} className="rounded-xl bg-sand-100 p-2">
              <dt className="text-[11px] uppercase tracking-wide text-stone-500">{x.k}</dt>
              <dd className="text-lg font-semibold tabular-nums">{x.v}</dd>
            </div>
          ))}
        </dl>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="mb-3 flex items-baseline justify-between">
        <h2>{tr("Praktikumsstunden", "Stage-uren")}</h2>
        <Link href="/app/hours" className="text-sm text-brand hover:underline">{tr("Details", "Details")} →</Link>
      </div>
      <ul className="space-y-3">
        {list.map((r) => {
          const pct = r.targetMinutes ? Math.round((r.doneMinutes / r.targetMinutes) * 100) : 0;
          return (
            <li key={r.user_id}>
              <div className="flex items-baseline gap-2 text-sm">
                <Avatar name={r.name} color={r.color} size="h-6 w-6 text-[10px]" />
                <span className="font-medium">{r.name}</span>
                <span className="ml-auto tabular-nums">
                  <b>{fmtHours(r.doneMinutes)}</b><span className="text-stone-400"> / {fmtHours(r.targetMinutes)} h · {pct} %</span>
                </span>
              </div>
              <GoalBarHours done={r.doneMinutes} planned={r.futureMinutes} target={r.targetMinutes} />
              <div className="mt-1 text-xs text-stone-500">
                {tr("diese Woche", "deze week")} {fmtHours(r.weekDone)} / {fmtHours(r.weekPlanned)} h · {tr("Monat", "maand")} {fmtHours(r.monthDone)} h · {r.days} {tr("Tage", "dagen")}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
