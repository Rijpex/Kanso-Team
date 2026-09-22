import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { navItems } from "@/lib/server/nav";
import { T } from "@/lib/i18n";
import { BottomNav, SideNav } from "@/components/Nav";
import { Avatar } from "@/components/ui";
import { signOut } from "./actions";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const tr = T(user.lang);
  q("update users set last_seen_at = now() where id = $1", [user.id]).catch(() => undefined);
  const items = await navItems(user);
  return (
    <div className="min-h-screen lg:flex">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sand-200 bg-sand-100 p-4 lg:flex">
        <Link href="/app" className="mb-6 block px-2">
          <div className="text-[10px] uppercase tracking-[0.3em] text-stone-500">Kanso Outdoor</div>
          <div className="text-lg font-semibold">Team Hub</div>
        </Link>
        <div className="flex-1 overflow-y-auto"><SideNav items={items} /></div>
        <div className="mt-4 flex items-center gap-2 border-t border-sand-200 pt-4">
          <Link href="/app/profile" className="flex flex-1 items-center gap-2 text-sm hover:underline">
            <Avatar name={user.name} color={user.color} /> {user.name}
          </Link>
          <form action={signOut}><button className="text-xs text-stone-500 hover:text-ink">{tr("Abmelden", "Uitloggen")}</button></form>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-sand-200 bg-sand-50/95 px-4 py-3 backdrop-blur lg:hidden">
          <Link href="/app" className="font-semibold">Kanso <span className="font-normal text-stone-500">Team Hub</span></Link>
          <Link href="/app/profile"><Avatar name={user.name} color={user.color} /></Link>
        </header>
        <main className="mx-auto max-w-5xl px-4 pb-28 pt-5 lg:px-8 lg:pb-12 lg:pt-8">{children}</main>
      </div>
      <BottomNav items={items} moreLabel={tr("Mehr", "Meer")} />
    </div>
  );
}
