import { redirect } from "next/navigation";
import { currentUser, login } from "@/lib/server/auth";
import { installState } from "@/lib/server/setup";

export const dynamic = "force-dynamic";

async function doLogin(formData: FormData) {
  "use server";
  const ok = await login(String(formData.get("username") || ""), String(formData.get("password") || ""));
  redirect(ok ? "/app" : "/login?error=1");
}

export default async function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  if ((await installState()) !== "ready") redirect("/setup");
  if (await currentUser()) redirect("/app");
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form action={doLogin} className="card w-full max-w-sm space-y-4 !p-7">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-stone-500">Kansō Outdoor</div>
          <h1 className="mt-1">Team Hub</h1>
        </div>
        {searchParams.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">Name oder Passwort stimmt nicht. / Naam of wachtwoord klopt niet.</p>}
        <div>
          <label className="label" htmlFor="username">Benutzername / Gebruikersnaam</label>
          <input id="username" name="username" className="input" autoComplete="username" autoCapitalize="none" required />
        </div>
        <div>
          <label className="label" htmlFor="password">Passwort / Wachtwoord</label>
          <input id="password" name="password" type="password" className="input" autoComplete="current-password" required />
        </div>
        <button className="btn-primary w-full">Einloggen</button>
        <p className="text-center text-xs text-stone-500">Passwort vergessen? Frag Bas oder Lea.</p>
      </form>
    </main>
  );
}
