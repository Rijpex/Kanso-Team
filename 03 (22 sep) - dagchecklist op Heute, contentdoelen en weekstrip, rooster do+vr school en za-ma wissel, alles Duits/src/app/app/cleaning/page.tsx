import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { cleaningFor, zoneOwners } from "@/lib/server/queries";
import { Avatar } from "@/components/ui";
import { T, pick } from "@/lib/i18n";
import { addDays, dayName, longDate, monday, today, weekday } from "@/lib/dates";
import { PageHeader } from "@/components/ui";
import { CleaningList } from "@/components/CleaningList";
import { ConfirmSubmit, Submit } from "@/components/client";
import { deleteCleaningTask, saveCleaningTask } from "../actions";

const WD = { de: ["", "Mo", "Di", "Mi", "Do", "Fr", "Sa"], nl: ["", "ma", "di", "wo", "do", "vr", "za"] };

export default async function Cleaning({ searchParams }: { searchParams: { d?: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const now = today();
  const sel = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.d || "") ? searchParams.d! : now;
  const mon = monday(sel);
  const days = [1, 2, 3, 4, 5].map((i) => addDays(mon, i));
  const [rows, zones, all, progress] = await Promise.all([
    cleaningFor(sel),
    zoneOwners(sel),
    user.role === "admin" ? q<{ id: string; title_de: string; title_nl: string | null; freq: string; weekday: number | null; moment: string }>("select * from cleaning_tasks where active order by position") : [],
    Promise.all(days.map(async (d) => { const r = await cleaningFor(d); return { d, done: r.filter((x) => x.done_by).length, total: r.length }; })),
  ]);
  return (
    <div className="max-w-3xl">
      <PageHeader title={tr("Storepflege", "Winkelverzorging")} sub={tr("Ein sauberer, ordentlicher Laden ist die Bühne, auf der die Ware wirkt. Kundinnen gehen vor – die Runde wartet, der Mensch nicht.", "Een schone, nette winkel is het podium voor de producten. Klanten gaan voor – de ronde wacht, de mens niet.")} />
      <div className="mb-4 flex gap-1.5 overflow-x-auto">
        <Link href={`/app/cleaning?d=${addDays(mon, -7)}`} className="btn-ghost btn-sm">←</Link>
        {progress.map((p) => (
          <Link key={p.d} href={`/app/cleaning?d=${p.d}`} className={`flex min-w-[3.6rem] flex-col items-center rounded-lg px-2 py-1 text-xs ring-1 ${p.d === sel ? "bg-ink text-white ring-ink" : "bg-white ring-sand-300"}`}>
            <span className="font-semibold">{dayName(p.d, user.lang)} {Number(p.d.slice(8))}.</span>
            <span className={p.d === sel ? "opacity-80" : p.total && p.done === p.total ? "text-emerald-600" : "text-stone-400"}>{p.done}/{p.total}</span>
          </Link>
        ))}
        <Link href={`/app/cleaning?d=${addDays(mon, 7)}`} className="btn-ghost btn-sm">→</Link>
      </div>
      {zones.a && zones.b && zones.a.id !== zones.b.id && (
        <div className="mb-4 grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-xl bg-white p-3 ring-1 ring-sand-200"><Avatar name={zones.a.name} color={zones.a.color} /><span><b>{zones.a.name}</b> · {tr("Eingang, Schaufenster, Böden", "ingang, etalage, vloeren")}</span></div>
          <div className="flex items-center gap-2 rounded-xl bg-white p-3 ring-1 ring-sand-200"><Avatar name={zones.b.name} color={zones.b.color} /><span><b>{zones.b.name}</b> · {tr("Küchen, Oberflächen, Regale", "keukens, oppervlakken, schappen")}</span></div>
          <p className="text-xs text-stone-500 sm:col-span-2">{tr("Die Aufteilung wechselt jede Woche.", "De verdeling wisselt elke week.")}</p>
        </div>
      )}
      <section className="card">
        <h2 className="mb-3 capitalize">{longDate(sel, user.lang)}{sel === now ? ` · ${tr("heute", "vandaag")}` : ""}</h2>
        {rows.length ? <CleaningList rows={rows} date={sel} lang={user.lang} zones={zones} /> : <p className="text-sm text-stone-500">{weekday(sel) === 1 || weekday(sel) === 7 ? tr("Laden geschlossen.", "Winkel gesloten.") : tr("Keine Aufgaben.", "Geen taken.")}</p>}
      </section>

      {user.role === "admin" && (
        <details className="card mt-5">
          <summary className="cursor-pointer font-semibold">{tr("Aufgaben verwalten", "Taken beheren")}</summary>
          <ul className="mt-3 divide-y divide-sand-200 text-sm">
            {all.map((t) => (
              <li key={t.id} className="flex items-center gap-2 py-1.5">
                <span className="flex-1">{pick(user.lang, t.title_de, t.title_nl)}</span>
                <span className="text-xs text-stone-400">{t.freq === "daily" ? tr("täglich", "dagelijks") : `${tr("wöchentlich", "wekelijks")} ${WD[user.lang][t.weekday || 0]}`}</span>
                <form action={deleteCleaningTask}><input type="hidden" name="id" value={t.id} /><ConfirmSubmit className="px-1 text-stone-300 hover:text-red-600" confirm="?">×</ConfirmSubmit></form>
              </li>
            ))}
          </ul>
          <form action={saveCleaningTask} className="mt-4 grid gap-2 sm:grid-cols-2" key={all.length}>
            <input name="title_de" className="input" placeholder={tr("Aufgabe (Deutsch)", "Taak (Duits)")} required />
            <input name="title_nl" className="input" placeholder={tr("Aufgabe (Niederländisch, optional)", "Taak (Nederlands, optioneel)")} />
            <select name="freq" className="input"><option value="daily">{tr("Täglich", "Dagelijks")}</option><option value="weekly">{tr("Wöchentlich", "Wekelijks")}</option></select>
            <select name="weekday" className="input">{[2, 3, 4, 5, 6].map((d) => <option key={d} value={d}>{tr("Wöchentlich am", "Wekelijks op")}: {WD[user.lang][d]}</option>)}</select>
            <select name="zone" className="input"><option value="">{tr("Für beide", "Voor allebei")}</option><option value="a">{tr("Bereich A · Eingang, Schaufenster, Böden", "Zone A · ingang, etalage, vloeren")}</option><option value="b">{tr("Bereich B · Küchen, Oberflächen, Regale", "Zone B · keukens, oppervlakken, schappen")}</option></select>
            <select name="moment" className="input"><option value="open">{tr("Vor dem Öffnen", "Voor opening")}</option><option value="day">{tr("Tagsüber", "Overdag")}</option><option value="close">{tr("Zum Feierabend", "Bij sluiten")}</option></select>
            <Submit>{tr("Hinzufügen", "Toevoegen")}</Submit>
          </form>
        </details>
      )}
    </div>
  );
}
