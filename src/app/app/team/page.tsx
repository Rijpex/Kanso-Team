import Link from "next/link";
import { requireAdmin } from "@/lib/server/auth";
import { team } from "@/lib/server/queries";
import { supabaseConfigured } from "@/lib/server/storage";
import { Avatar, PageHeader } from "@/components/ui";
import { Submit } from "@/components/client";
import { saveUser, setUserActive, updateDatabase } from "../actions";

const COLORS = ["#1f1d1a", "#7a6a4f", "#b4533c", "#2f6f5e", "#8a5a83", "#3d6a99", "#c08a2b"];
const ERR: Record<string, [string, string]> = { name: ["Name eintragen und einen Benutzernamen ohne Leerzeichen (Kleinbuchstaben, Ziffern, Punkt oder Strich).", "Vul een naam in en een gebruikersnaam zonder spaties (kleine letters, cijfers, punt of streepje)."], exists: ["Dieser Benutzername existiert schon.", "Deze gebruikersnaam bestaat al."], pw: ["Passwort: mindestens 6 Zeichen.", "Wachtwoord: minimaal 6 tekens."] };

export default async function Team({ searchParams }: { searchParams: { edit?: string; error?: string; saved?: string; welcome?: string } }) {
  const me = await requireAdmin();
  const tr = (de: string, nl: string) => (me.lang === "nl" ? nl : de);
  const users = await team(false);
  const editing = users.find((u) => u.id === searchParams.edit);
  return (
    <div className="max-w-3xl">
      <PageHeader title={tr("Team & Einstellungen", "Team & instellingen")} sub={tr("Konten anlegen, Passwörter zurücksetzen, Rollen festlegen.", "Accounts aanmaken, wachtwoorden resetten, rollen instellen.")} />
      {searchParams.welcome && <p className="mb-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">{tr("Der Hub ist eingerichtet. Lege unten die Konten für Lea (Verwaltung) und die beiden Praktikantinnen an. Danach:", "De hub is geïnstalleerd. Maak hieronder de accounts voor Lea (beheerder) en de twee stagiairs aan. Daarna:")} <Link href="/app/roster" className="underline">{tr("Dienstplan füllen", "rooster vullen")}</Link>.</p>}
      {searchParams.saved && <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{tr("Gespeichert.", "Opgeslagen.")}</p>}
      {searchParams.error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{ERR[searchParams.error] ? tr(...ERR[searchParams.error]) : tr("Etwas ist schiefgelaufen.", "Er ging iets mis.")}</p>}
      <section className="card mb-5 !p-0">
        <ul className="divide-y divide-sand-200">
          {users.map((u) => (
            <li key={u.id} className={`flex items-center gap-3 p-3 text-sm ${u.active ? "" : "opacity-50"}`}>
              <Avatar name={u.name} color={u.color} />
              <span className="flex-1"><b>{u.name}</b> <span className="text-stone-500">· Login: {u.username} · {u.role === "admin" ? tr("Verwaltung", "beheerder") : tr("Praktikantin", "stagiair")} · {u.lang.toUpperCase()}</span></span>
              <Link href={`/app/team?edit=${u.id}`} className="text-brand hover:underline">{tr("Ändern", "Wijzig")}</Link>
              {u.id !== me.id && <form action={setUserActive}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="active" value={String(!u.active)} /><button className="text-stone-500 hover:underline">{u.active ? tr("Sperren", "Blokkeer") : tr("Aktivieren", "Activeer")}</button></form>}
            </li>
          ))}
        </ul>
      </section>
      <section className="card">
        <h2 className="mb-3">{editing ? `${editing.name} ${tr("ändern", "wijzigen")}` : tr("Neues Konto", "Nieuw account")}</h2>
        <form action={saveUser} className="grid gap-3 sm:grid-cols-2" key={editing?.id || `new${users.length}`}>
          <input type="hidden" name="id" value={editing?.id || ""} />
          <div><label className="label">{tr("Name (Vorname)", "Naam (voornaam)")}</label><input name="name" className="input" defaultValue={editing?.name} required /></div>
          <div><label className="label">{tr("Benutzername (zum Einloggen)", "Gebruikersnaam (om in te loggen)")}</label><input name="username" className="input" autoCapitalize="none" defaultValue={editing?.username} required /></div>
          <div><label className="label">{tr("Rolle", "Rol")}</label><select name="role" className="input" defaultValue={editing?.role || "intern"}><option value="intern">{tr("Praktikantin", "Stagiair")}</option><option value="admin">{tr("Verwaltung", "Beheerder")}</option></select></div>
          <div><label className="label">{tr("Sprache", "Taal")}</label><select name="lang" className="input" defaultValue={editing?.lang || "de"}><option value="de">Deutsch</option><option value="nl">Nederlands</option></select></div>
          <div><label className="label">{editing ? tr("Neues Passwort (leer = nicht ändern)", "Nieuw wachtwoord (leeg = niet wijzigen)") : tr("Startpasswort (mind. 6 Zeichen)", "Startwachtwoord (min. 6 tekens)")}</label><input name="password" className="input" autoComplete="new-password" required={!editing} minLength={6} /></div>
          <div><label className="label">{tr("Farbe in Agenda", "Kleur in rooster en agenda")}</label><div className="flex flex-wrap gap-2 pt-1">{COLORS.map((c, i) => <label key={c} className="cursor-pointer"><input type="radio" name="color" value={c} defaultChecked={editing ? editing.color === c : i === (users.length % COLORS.length)} className="peer sr-only" /><span className="block h-7 w-7 rounded-full ring-offset-2 peer-checked:ring-2 peer-checked:ring-ink" style={{ background: c }} /></label>)}</div></div>
          <div className="flex gap-2 sm:col-span-2"><Submit>{tr("Speichern", "Opslaan")}</Submit>{editing && <Link href="/app/team" className="btn-ghost">{tr("Abbrechen", "Annuleren")}</Link>}</div>
        </form>
        <p className="mt-3 text-xs text-stone-500">{tr("Gib das Startpasswort persönlich weiter. Jede kann es danach unter „Mein Profil“ selbst ändern.", "Geef het startwachtwoord persoonlijk door. Iedereen kan het daarna zelf wijzigen onder \"Mijn profiel\".")}</p>
      </section>
      <section className="card mt-5 text-sm">
        <h2 className="mb-2">System</h2>
        <p className="mb-1">{tr("Dateispeicher", "Bestandsopslag")}: {supabaseConfigured() ? <b className="text-emerald-700">{tr("Supabase Storage aktiv (große Dateien und Videos möglich)", "Supabase Storage actief (grote bestanden en video's mogelijk)")}</b> : <b className="text-amber-700">{tr("nicht verbunden – nur kleine Dateien bis 4 MB", "niet gekoppeld – alleen kleine bestanden tot 4 MB")}</b>}</p>
        <p className="muted mb-3">{tr("Die Datenbank wird nach einem Code-Update automatisch aktualisiert. Dieser Knopf ist nur für den Notfall.", "De database wordt na een code-update automatisch bijgewerkt. Deze knop is alleen voor noodgevallen.")}</p>
        <form action={updateDatabase}><Submit className="btn-ghost">{tr("Datenbank aktualisieren", "Database bijwerken")}</Submit></form>
      </section>
    </div>
  );
}
