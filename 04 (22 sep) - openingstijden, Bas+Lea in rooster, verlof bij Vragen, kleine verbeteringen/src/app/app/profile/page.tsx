import { requireUser } from "@/lib/server/auth";
import { T } from "@/lib/i18n";
import { Avatar, PageHeader } from "@/components/ui";
import { Submit } from "@/components/client";
import { signOut, updateProfile } from "../actions";

export default async function Profile({ searchParams }: { searchParams: { saved?: string; error?: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  return (
    <div className="max-w-md">
      <PageHeader title={tr("Mein Profil", "Mijn profiel")} />
      {searchParams.saved && <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{tr("Gespeichert.", "Opgeslagen.")}</p>}
      {searchParams.error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{tr("Das aktuelle Passwort stimmt nicht, oder das neue ist kürzer als 6 Zeichen.", "Het huidige wachtwoord klopt niet, of het nieuwe is korter dan 6 tekens.")}</p>}
      <form action={updateProfile} className="card space-y-4">
        <div className="flex items-center gap-3"><Avatar name={user.name} color={user.color} size="h-10 w-10 text-base" /><div><div className="font-semibold">{user.name}</div><div className="text-xs text-stone-500">Login: {user.username}</div></div></div>
        <div><label className="label">{tr("Sprache", "Taal")}</label><select name="lang" className="input" defaultValue={user.lang}><option value="de">Deutsch</option><option value="nl">Nederlands</option></select></div>
        <div><label className="label">{tr("Aktuelles Passwort", "Huidig wachtwoord")}</label><input type="password" name="current_password" className="input" autoComplete="current-password" /></div>
        <div><label className="label">{tr("Neues Passwort (mind. 6 Zeichen, leer = nicht ändern)", "Nieuw wachtwoord (min. 6 tekens, leeg = niet wijzigen)")}</label><input type="password" name="new_password" className="input" autoComplete="new-password" /></div>
        <Submit>{tr("Speichern", "Opslaan")}</Submit>
      </form>
      <form action={signOut} className="mt-4"><button className="btn-ghost">{tr("Abmelden", "Uitloggen")}</button></form>
    </div>
  );
}
