import Link from "next/link";
import { T, type Lang } from "@/lib/i18n";
import { fmtHours } from "@/lib/hours";
import { shortDate } from "@/lib/dates";
import type { HoursRow } from "@/lib/server/queries";
import { Avatar } from "@/components/ui";

/** Balkje: donker = al gewerkt, licht = nog ingepland deze week. */
function Bar({ done, planned }: { done: number; planned: number }) {
  const pct = (n: number) => `${planned > 0 ? Math.min(100, (n / planned) * 100) : 0}%`;
  return (
    <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-sand-100">
      <div className="absolute inset-y-0 left-0 rounded-full bg-sand-300" style={{ width: pct(planned) }} />
      <div className="absolute inset-y-0 left-0 rounded-full bg-ink" style={{ width: pct(done) }} />
    </div>
  );
}

/**
 * Urenteller voor de stagiaires. Telt op uit het rooster (winkel + thuiswerk, pauzes eraf).
 * Stagiaire ziet haar eigen uren groot, Bas en Lea zien beide stagiaires naast elkaar.
 */
export function HoursCard({ rows, lang, me, isAdmin }: { rows: HoursRow[]; lang: Lang; me: { id: string }; isAdmin: boolean }) {
  const tr = T(lang);
  const mine = rows.find((r) => r.user_id === me.id);
  const list = isAdmin ? rows : mine ? [mine] : [];
  if (!list.length) return null;
  const note = tr(
    "Gerechnet aus dem Dienstplan, Pausen sind abgezogen. Wenn ein Tag anders gelaufen ist: sag es Lea oder Bas, dann passen wir den Dienstplan an.",
    "Berekend uit het rooster, pauzes eraf. Ging een dag anders: zeg het tegen Lea of Bas, dan passen we het rooster aan.",
  );

  if (!isAdmin && mine) {
    const left = Math.max(0, mine.weekPlanned - mine.weekDone);
    return (
      <section className="card">
        <div className="mb-1 flex items-baseline justify-between">
          <h2>{tr("Deine Stunden", "Jouw uren")}</h2>
          <Link href="/app/roster" className="text-sm text-brand hover:underline">{tr("Dienstplan", "Rooster")} →</Link>
        </div>
        <div className="text-3xl font-semibold tabular-nums">{fmtHours(mine.weekDone)} h<span className="text-base font-normal text-stone-400"> {tr("von", "van")} {fmtHours(mine.weekPlanned)} h {tr("diese Woche", "deze week")}</span></div>
        <Bar done={mine.weekDone} planned={mine.weekPlanned} />
        <div className="mt-1 text-xs text-stone-500">{left > 0 ? tr(`Noch ${fmtHours(left)} Stunden eingeplant.`, `Nog ${fmtHours(left)} uur ingepland.`) : tr("Diese Woche ist durch.", "Deze week zit erop.")}</div>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            { k: tr("Dieser Monat", "Deze maand"), v: `${fmtHours(mine.monthDone)} h` },
            { k: tr("Insgesamt", "Totaal"), v: `${fmtHours(mine.total)} h` },
            { k: tr("Arbeitstage", "Werkdagen"), v: String(mine.days) },
          ].map((x) => (
            <div key={x.k} className="rounded-xl bg-sand-100 p-2">
              <dt className="text-[11px] uppercase tracking-wide text-stone-500">{x.k}</dt>
              <dd className="text-lg font-semibold tabular-nums">{x.v}</dd>
            </div>
          ))}
        </dl>
        {mine.firstDate && <p className="mt-2 text-xs text-stone-400">{tr("Gezählt ab", "Geteld vanaf")} {shortDate(mine.firstDate, lang)} · {note}</p>}
      </section>
    );
  }

  return (
    <section className="card">
      <div className="mb-3 flex items-baseline justify-between">
        <h2>{tr("Stunden der Praktikantinnen", "Uren van de stagiaires")}</h2>
        <Link href="/app/roster" className="text-sm text-brand hover:underline">{tr("Dienstplan", "Rooster")} →</Link>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-stone-400">
            <th className="font-medium">{tr("Wer", "Wie")}</th>
            <th className="font-medium">{tr("Woche", "Week")}</th>
            <th className="font-medium">{tr("Monat", "Maand")}</th>
            <th className="font-medium">{tr("Insgesamt", "Totaal")}</th>
            <th className="font-medium">{tr("Tage", "Dagen")}</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r) => (
            <tr key={r.user_id} className="border-t border-sand-200">
              <td className="py-1.5"><span className="flex items-center gap-2"><Avatar name={r.name} color={r.color} size="h-6 w-6 text-[10px]" />{r.name}</span></td>
              <td className="tabular-nums">{fmtHours(r.weekDone)}<span className="text-stone-400"> / {fmtHours(r.weekPlanned)}</span></td>
              <td className="tabular-nums">{fmtHours(r.monthDone)}</td>
              <td className="font-semibold tabular-nums">{fmtHours(r.total)}</td>
              <td className="tabular-nums text-stone-500">{r.days}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-stone-400">{tr("Stunden in h, Pausen abgezogen. Woche: geleistet / geplant.", "Uren in h, pauzes eraf. Week: gewerkt / gepland.")}</p>
    </section>
  );
}
