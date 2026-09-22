import { redirect } from "next/navigation";
import { installState, migrate } from "@/lib/server/setup";
import { hashPassword, login } from "@/lib/server/auth";
import { q } from "@/lib/server/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function install(formData: FormData) {
  "use server";
  const state = await installState();
  if (state !== "empty") redirect("/setup");
  const name = String(formData.get("name") || "").trim();
  const username = String(formData.get("username") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!name || !/^[a-z0-9._-]{2,30}$/.test(username) || password.length < 8) redirect("/setup?error=1");
  await migrate();
  await q("insert into users (username, name, role, password_hash, lang, color) values ($1,$2,'admin',$3,'nl','#1f1d1a')", [username, name, await hashPassword(password)]);
  await login(username, password);
  redirect("/app/team?welcome=1");
}

export default async function SetupPage({ searchParams }: { searchParams: { error?: string } }) {
  const state = await installState();
  if (state === "ready") redirect("/login");
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-md space-y-4 !p-7">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-stone-500">Kansō Team Hub</div>
          <h1 className="mt-1">Installatie</h1>
        </div>
        {state === "nodb" && (
          <div className="space-y-2 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-medium">Er is nog geen database gekoppeld.</p>
            <p>Ga in Vercel naar je project → tabblad <b>Storage</b> → <b>Create Database</b> → <b>Supabase</b> → regio Frankfurt → Create en Connect. Klik daarna bij <b>Deployments</b> op ⋯ → <b>Redeploy</b> en open deze pagina opnieuw.</p>
          </div>
        )}
        {typeof state === "object" && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">Databasefout: {state.error}</p>}
        {state === "empty" && (
          <form action={install} className="space-y-4">
            <p className="muted">Maak het eerste beheerdersaccount aan. Daarna maak je in de hub de accounts voor Lea en de stagiairs.</p>
            {searchParams.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">Controleer de velden: gebruikersnaam zonder spaties, wachtwoord minimaal 8 tekens.</p>}
            <div><label className="label">Je naam</label><input name="name" className="input" defaultValue="Bas" required /></div>
            <div><label className="label">Gebruikersnaam (om in te loggen)</label><input name="username" className="input" defaultValue="bas" autoCapitalize="none" required /></div>
            <div><label className="label">Wachtwoord (minimaal 8 tekens)</label><input name="password" type="password" className="input" minLength={8} required /></div>
            <button className="btn-primary w-full">Installeren</button>
          </form>
        )}
      </div>
    </main>
  );
}
