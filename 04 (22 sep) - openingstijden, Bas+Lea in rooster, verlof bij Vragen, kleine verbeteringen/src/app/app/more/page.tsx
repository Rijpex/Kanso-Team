import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { T } from "@/lib/i18n";
import { Icon } from "@/components/Nav";
import { navItems } from "@/lib/server/nav";
import { signOut } from "../actions";

export default async function More() {
  const user = await requireUser();
  const tr = T(user.lang);
  const items = (await navItems(user)).filter((i) => !i.main);
  return (
    <div>
      <h1 className="mb-4">{tr("Mehr", "Meer")}</h1>
      {[...new Set(items.map((i) => i.group || ""))].map((g) => (
      <div key={g} className="mb-5">
      {g && <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">{g}</div>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.filter((i) => (i.group || "") === g).map((i) => (
          <Link key={i.href} href={i.href} className="card flex flex-col items-start gap-2 hover:bg-sand-100">
            <Icon name={i.icon} className="h-6 w-6 text-brand" />
            <span className="text-sm font-medium">{i.label}</span>
            {!!i.badge && <span className="badge bg-amber-100 text-amber-800">{i.badge}</span>}
          </Link>
        ))}
      </div>
      </div>
      ))}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Link href="/app/profile" className="card flex flex-col items-start gap-2 hover:bg-sand-100">
          <Icon name="users" className="h-6 w-6 text-brand" />
          <span className="text-sm font-medium">{tr("Mein Profil", "Mijn profiel")}</span>
        </Link>
      </div>
      <form action={signOut} className="mt-6"><button className="btn-ghost">{tr("Abmelden", "Uitloggen")}</button></form>
    </div>
  );
}
