import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { team } from "@/lib/server/queries";
import { SHIFT_KIND, T, lbl } from "@/lib/i18n";
import { OPENING_TEXT_DE, shiftForRole } from "@/lib/hours";
import { addDays, dayName, hm, isoWeek, longDate, monday, monthName, today, weekday } from "@/lib/dates";
import { Avatar, PageHeader } from "@/components/ui";
import { ConfirmSubmit, Submit } from "@/components/client";
import { addOpenSunday, generateRoster, removeOpenSunday, saveShift } from "../actions";

type Sh = { user_id: string; date: string; kind: string; start_time: string | null; end_time: string | null; break_start: string | null; break_end: string | null; break2_start: string | null; break2_end: string | null; note: string | null };
const WDN = { de: ["", "Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"], nl: ["", "ma", "di", "wo", "do", "vr", "za", "zo"] };
const mins = (t: string | null) => (t ? Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5)) : 0);
const span = (a: string | null, b: string | null) => (a && b ? Math.max(0, mins(b) - mins(a)) : 0);
const worked = (s: Sh) => (s.start_time && s.end_time ? Math.max(0, mins(s.end_time) - mins(s.start_time) - span(s.break_start, s.break_end) - span(s.break2_start, s.break2_end)) : 0);
const nextSunday = (d: string) => addDays(d, 7 - weekday(d) || 7);
const hours = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;

export default async function Roster({ searchParams }: { searchParams: { w?: string; edit?: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const isAdmin = user.role === "admin";
  const now = today();
  const mon = monday(/^\d{4}-\d{2}-\d{2}$/.test(searchParams.w || "") ? searchParams.w! : now);
  const sun = addDays(mon, 6);
  const monthStart = `${addDays(mon, 5).slice(0, 7)}-01`;
  const [users, shifts, sats] = await Promise.all([
    team(),
    q<Sh>("select * from shifts where date between $1 and $2", [mon, sun]),
    q<{ user_id: string; n: number }>(
      "select user_id, count(*)::int as n from shifts where kind = 'shop' and extract(isodow from date) = 6 and date >= $1::date and date < ($1::date + interval '1 month') group by user_id", [monthStart]),
  ]);
  const get = (uid: string, d: string) => shifts.find((s) => s.user_id === uid && s.date === d);
  // Zondag alleen tonen als er die dag iets staat (verkaufsoffener Sonntag)
  const openSunday = shifts.some((s) => s.date === sun && s.kind === "shop");
  const days = [0, 1, 2, 3, 4, 5, ...(openSunday ? [6] : [])].map((i) => addDays(mon, i));
  const [editUser, editDate] = (searchParams.edit || "").split("_");
  const editing = isAdmin && editUser && days.includes(editDate) ? { user: users.find((u) => u.id === editUser), date: editDate, shift: get(editUser, editDate) } : null;
  const interns = users.filter((u) => u.role === "intern");
  const base = `/app/roster?w=${mon}`;

  return (
    <div>
      <PageHeader title={tr("Dienstplan", "Rooster")} sub={`${tr("KW", "Week")} ${isoWeek(mon)} · ${longDate(mon, user.lang)} – ${longDate(days[days.length - 1], user.lang)}`}>
        <Link className="btn-ghost btn-sm" href={`/app/roster?w=${addDays(mon, -7)}`}>←</Link>
        <Link className="btn-ghost btn-sm" href="/app/roster">{tr("Diese Woche", "Deze week")}</Link>
        <Link className="btn-ghost btn-sm" href={`/app/roster?w=${addDays(mon, 7)}`}>→</Link>
      </PageHeader>

      <div className="card overflow-x-auto !p-0">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-sand-200 text-left text-xs uppercase text-stone-400">
              <th className="p-3"></th>
              {days.map((d) => <th key={d} className={`p-2 font-medium ${d === now ? "text-ink" : ""}`}>{dayName(d, user.lang)} {Number(d.slice(8))}.</th>)}
              <th className="p-2 text-right font-medium">{tr("Std.", "Uren")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const total = days.reduce((n, d) => n + (get(u.id, d) ? worked(get(u.id, d)!) : 0), 0);
              const workDays = days.filter((d) => ["shop", "home", "school"].includes(get(u.id, d)?.kind || "")).length;
              const tooMuch = u.role === "intern" && (total > 2400 || workDays > 5);
              return (
                <tr key={u.id} className="border-b border-sand-100 last:border-0">
                  <td className="whitespace-nowrap p-3"><span className="flex items-center gap-2 font-medium"><Avatar name={u.name} color={u.color} />{u.name}</span></td>
                  {days.map((d) => {
                    const s = get(u.id, d);
                    const long = s && u.role === "intern" && worked(s) > 480;
                    const inner = s ? (
                      <div className={`rounded-lg p-1.5 text-xs leading-tight ${SHIFT_KIND[s.kind]?.color} ${long ? "ring-2 ring-red-400" : ""}`}>
                        <div className="font-semibold">{lbl(user.lang, SHIFT_KIND[s.kind])}</div>
                        {s.start_time && <div>{hm(s.start_time)}–{hm(s.end_time)}</div>}
                        {s.break_start && <div className="opacity-70">{tr("Pause", "Pauze")} {hm(s.break_start)}–{hm(s.break_end)}{s.break2_start && <> · {hm(s.break2_start)}–{hm(s.break2_end)}</>}</div>}
                        {s.note && <div className="opacity-70">{s.note}</div>}
                      </div>
                    ) : <div className="rounded-lg border border-dashed border-sand-200 p-1.5 text-center text-xs text-stone-300">{isAdmin ? "+" : "–"}</div>;
                    return <td key={d} className="p-1 align-top">{isAdmin ? <Link href={`${base}&edit=${u.id}_${d}`} className="block hover:opacity-70">{inner}</Link> : inner}</td>;
                  })}
                  <td className={`whitespace-nowrap p-2 text-right tabular-nums ${tooMuch ? "font-semibold text-red-600" : "text-stone-500"}`}>{total ? hours(total) : ""}{u.role === "intern" && workDays > 5 && <div className="text-[11px]">{workDays} {tr("Tage", "dagen")}</div>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {interns.length > 0 && (
        <p className="mt-3 text-sm text-stone-600">
          {tr("Samstage im", "Zaterdagen in")} <span className="capitalize">{monthName(monthStart, user.lang)}</span>:{" "}
          {interns.map((u, i) => {
            const n = sats.find((x) => x.user_id === u.id)?.n || 0;
            return <span key={u.id} className={n > 2 ? "font-semibold text-red-600" : ""}>{i > 0 && " · "}{u.name} {n}/2</span>;
          })}
          <span className="text-stone-400"> — {tr("die Schule erlaubt max. 2 pro Monat", "school staat max. 2 per maand toe")}</span>
        </p>
      )}

      {editing?.user && (
        <section className="card mt-5 max-w-xl">
          <h2 className="mb-3">{editing.user.name} · <span className="capitalize">{longDate(editing.date, user.lang)}</span></h2>
          <form action={saveShift} className="space-y-3" key={searchParams.edit}>
            <input type="hidden" name="user_id" value={editing.user.id} /><input type="hidden" name="date" value={editing.date} /><input type="hidden" name="back" value={base} />
            <div><label className="label">{tr("Art", "Soort")}</label>
              <select name="kind" className="input" defaultValue={editing.shift?.kind || "shop"}>
                {Object.entries(SHIFT_KIND).map(([k, l]) => <option key={k} value={k}>{lbl(user.lang, l)}</option>)}
                <option value="none">{tr("– Eintrag entfernen –", "– Invoer verwijderen –")}</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div><label className="label">{tr("von", "van")}</label><input type="time" name="start_time" className="input" defaultValue={hm(editing.shift?.start_time) || shiftForRole(weekday(editing.date), editing.user?.role)?.start || "10:00"} /></div>
              <div><label className="label">{tr("bis", "tot")}</label><input type="time" name="end_time" className="input" defaultValue={hm(editing.shift?.end_time) || shiftForRole(weekday(editing.date), editing.user?.role)?.end || "18:30"} /></div>
              <div><label className="label">{tr("Pause von", "Pauze van")}</label><input type="time" name="break_start" className="input" defaultValue={hm(editing.shift?.break_start)} /></div>
              <div><label className="label">{tr("Pause bis", "Pauze tot")}</label><input type="time" name="break_end" className="input" defaultValue={hm(editing.shift?.break_end)} /></div>
              <div><label className="label">{tr("2. Pause von", "2e pauze van")}</label><input type="time" name="break2_start" className="input" defaultValue={hm(editing.shift?.break2_start)} /></div>
              <div><label className="label">{tr("2. Pause bis", "2e pauze tot")}</label><input type="time" name="break2_end" className="input" defaultValue={hm(editing.shift?.break2_end)} /></div>
            </div>
            <div><label className="label">{tr("Notiz", "Notitie")}</label><input name="note" className="input" defaultValue={editing.shift?.note || ""} /></div>
            <div className="flex gap-2"><Submit>{tr("Speichern", "Opslaan")}</Submit><Link href={base} className="btn-ghost">{tr("Abbrechen", "Annuleren")}</Link></div>
          </form>
        </section>
      )}

      {isAdmin && (
        <details className="card mt-5" open={openSunday}>
          <summary className="cursor-pointer font-semibold">{tr("Verkaufsoffener Sonntag", "Open zondag")}</summary>
          <p className="muted mt-2">{tr("Ein paar Mal im Jahr ist in Lüneburg sonntags geöffnet. Bas und Lea werden eingetragen und es kommt ein Eintrag in die Agenda. Ob eine Praktikantin mit dabei ist, besprecht ihr im Laden – dann einfach im Plan auf das Feld klicken.", "Een paar keer per jaar is Lüneburg op zondag open. Bas en Lea worden ingepland en het komt in de agenda. Of een stagiair meedoet, bespreken jullie in de winkel – dan gewoon in het rooster op het vakje klikken.")}</p>
          {openSunday && (
            <form action={removeOpenSunday} className="mt-3 flex items-center gap-3 text-sm"><input type="hidden" name="date" value={sun} />
              <span>{tr("Diese Woche", "Deze week")}: <span className="capitalize">{longDate(sun, user.lang)}</span></span>
              <ConfirmSubmit className="btn-ghost btn-sm" confirm={tr("Sonntag wieder entfernen?", "Zondag weer verwijderen?")}>{tr("Entfernen", "Verwijderen")}</ConfirmSubmit>
            </form>
          )}
          <form action={addOpenSunday} className="mt-3 grid gap-3 text-sm sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
            <div><label className="label">{tr("Sonntag", "Zondag")}</label><input type="date" name="date" className="input" defaultValue={nextSunday(now)} required /></div>
            <div><label className="label">{tr("von", "van")}</label><input type="time" name="start_time" className="input" defaultValue="13:00" /></div>
            <div><label className="label">{tr("bis", "tot")}</label><input type="time" name="end_time" className="input" defaultValue="18:00" /></div>
            <Submit>{tr("Eintragen", "Toevoegen")}</Submit>
          </form>
        </details>
      )}

      {isAdmin && interns.length > 0 && (
        <details className="card mt-5">
          <summary className="cursor-pointer font-semibold">{tr("Dienstplan automatisch füllen", "Rooster automatisch vullen")}</summary>
          <form action={generateRoster} className="mt-4 space-y-4 text-sm">
            <p className="muted">{tr("Füllt den Dienstplan der Praktikantinnen. Woche A: eine arbeitet Samstag, die andere hat Montag Homeoffice – in der Woche danach andersherum. Maximal 2 Samstage pro Person und Kalendermonat. Bestehende Einträge bleiben, außer du hakst „überschreiben“ an.", "Vult het rooster voor de stagiairs. Week A: de ene werkt zaterdag, de andere heeft maandag thuiswerk – de week erna andersom. Maximaal 2 zaterdagen per persoon per kalendermaand. Bestaande invoer blijft staan, tenzij je \"overschrijven\" aanvinkt.")}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div><label className="label">{tr("Ab", "Vanaf")}</label><input type="date" name="from" className="input" defaultValue={now} required /></div>
              <div><label className="label">{tr("Anzahl Wochen", "Aantal weken")}</label><input type="number" name="weeks" className="input" defaultValue={8} min={1} max={26} /></div>
              <div><label className="label">{tr("Wer arbeitet den ersten Samstag?", "Wie werkt de eerste zaterdag?")}</label><select name="first_saturday" className="input">{interns.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
            </div>
            <div className="overflow-x-auto">
              <table className="text-sm">
                <thead><tr className="text-xs text-stone-500"><th></th>{[2, 3, 4, 5].map((wd) => <th key={wd} className="px-1 pb-1 font-medium">{WDN[user.lang][wd]}</th>)}</tr></thead>
                <tbody>
                  {interns.map((u) => (
                    <tr key={u.id}><td className="pr-3 font-medium">{u.name}</td>
                      {[2, 3, 4, 5].map((wd) => (
                        <td key={wd} className="p-1"><select name={`d_${u.id}_${wd}`} className="input !w-32" defaultValue={wd >= 4 ? "school" : "shop"}><option value="shop">{tr("Laden", "Winkel")}</option><option value="school">{tr("Schule", "School")}</option><option value="off">{tr("Frei", "Vrij")}</option><option value="skip">{tr("Nicht füllen", "Niet vullen")}</option></select></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="rounded-lg bg-sand-100 p-3 text-xs text-stone-600">{tr("Arbeitszeiten Praktikantinnen = Öffnung bis Ladenschluss (Bas und Lea 30 Minuten früher)", "Werktijden stagiaires = opening tot sluiting (Bas en Lea 30 minuten eerder)")}: {OPENING_TEXT_DE}</p>
            <p className="text-xs text-stone-500">{tr("Pausen: zwei Mal 30 Minuten. Eine gemeinsame Pause (beide zusammen) und eine, die wechselt – wer diese Woche früh Pause hat, hat nächste Woche spät.", "Pauzes: twee keer 30 minuten. Eén gezamenlijke pauze (samen) en één die wisselt – wie deze week vroeg pauze heeft, heeft volgende week laat.")}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div><label className="label">{tr("Gemeinsame Pause", "Gezamenlijke pauze")}</label><div className="flex gap-1"><input type="time" name="break_shared_start" className="input" defaultValue="13:00" /><input type="time" name="break_shared_end" className="input" defaultValue="13:30" /></div></div>
              <div><label className="label">{tr("Wechselpause früh", "Wisselpauze vroeg")}</label><div className="flex gap-1"><input type="time" name="break_early_start" className="input" defaultValue="11:00" /><input type="time" name="break_early_end" className="input" defaultValue="11:30" /></div></div>
              <div><label className="label">{tr("Wechselpause spät", "Wisselpauze laat")}</label><div className="flex gap-1"><input type="time" name="break_late_start" className="input" defaultValue="15:30" /><input type="time" name="break_late_end" className="input" defaultValue="16:00" /></div></div>
              <div><label className="label">{tr("Homeoffice Mo von", "Thuiswerk ma van")}</label><input type="time" name="home_start" className="input" defaultValue="10:00" /></div>
              <div><label className="label">{tr("Homeoffice Mo bis", "Thuiswerk ma tot")}</label><input type="time" name="home_end" className="input" defaultValue="14:30" /></div>
            </div>
            <label className="flex items-center gap-2"><input type="checkbox" name="monday_home" defaultChecked /> {tr("Wer nicht Samstag arbeitet, hat Montag Homeoffice", "Wie zaterdag niet werkt, heeft maandag thuiswerk")}</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="admins" defaultChecked /> {tr("Bas und Lea an jedem Ladentag eintragen (frei nehmen geht danach über Agenda oder Abwesenheit)", "Bas en Lea elke winkeldag inplannen (vrij nemen kan daarna via agenda of afwezigheid)")}</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="overwrite" /> {tr("Bestehende Einträge überschreiben", "Bestaande invoer overschrijven")}</label>
            <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">{tr("Jugendarbeitsschutz (unter 18): max. 8 Stunden am Tag, 40 pro Woche, 5 Tage pro Woche; bei mehr als 6 Stunden 60 Minuten Pause. Schultage zählen als Arbeitstage. Der Plan färbt sich rot, wenn ein Tag oder eine Woche darüber liegt.", "Jugendarbeitsschutzgesetz (onder 18): max. 8 uur per dag, 40 per week, 5 dagen per week; bij meer dan 6 uur werk 60 minuten pauze. Schooldagen tellen als werkdag. Het rooster kleurt rood als een dag of week daarboven komt.")}</p>
            <Submit>{tr("Dienstplan füllen", "Rooster vullen")}</Submit>
          </form>
        </details>
      )}
    </div>
  );
}
