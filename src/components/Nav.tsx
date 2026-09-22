"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; icon: string; badge?: number; main?: boolean; group?: string };

const ICONS: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z",
  calendar: "M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1z",
  clock: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  tasks: "M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2",
  chat: "M4 5h16v11H9l-5 4z",
  sparkle: "M5 20l9-9M14 4l1.5 3L19 8.5 15.5 10 14 13l-1.5-3L9 8.5 12.5 7z",
  video: "M4 6h11v12H4zM15 10l5-3v10l-5-3z",
  bulb: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.3 1 2.1h5c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3z",
  box: "M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8",
  book: "M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h10",
  flag: "M5 21V4M5 4h12l-2 4 2 4H5",
  users: "M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 19v-1a4 4 0 0 0-3-3.9M16 3.2a3.5 3.5 0 0 1 0 6.6",
  more: "M5 12h.01M12 12h.01M19 12h.01",
};

export function Icon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={ICONS[name] || ICONS.more} />
    </svg>
  );
}

function isActive(path: string, href: string) {
  return href === "/app" ? path === "/app" : path.startsWith(href);
}

export function SideNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <nav className="space-y-0.5">
      {items.map((it, i) => (
        <div key={it.href}>
        {it.group && it.group !== items[i - 1]?.group && <div className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400">{it.group}</div>}
        <Link href={it.href} className={`flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition ${isActive(path, it.href) ? "bg-ink text-white" : "text-ink-soft hover:bg-sand-200"}`}>
          <Icon name={it.icon} />
          <span className="flex-1">{it.label}</span>
          {!!it.badge && <span className="rounded-full bg-amber-400 px-1.5 text-xs font-semibold text-ink">{it.badge}</span>}
        </Link>
        </div>
      ))}
    </nav>
  );
}

export function BottomNav({ items, moreLabel }: { items: NavItem[]; moreLabel: string }) {
  const path = usePathname();
  const main = items.filter((i) => i.main);
  const moreActive = !main.some((i) => isActive(path, i.href));
  const moreBadge = items.filter((i) => !i.main).reduce((n, i) => n + (i.badge || 0), 0);
  const cell = (href: string, icon: string, label: string, active: boolean, badge?: number) => (
    <Link key={href} href={href} className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${active ? "font-semibold text-ink" : "text-stone-500"}`}>
      <Icon name={icon} className="h-6 w-6" />
      {label}
      {!!badge && <span className="absolute right-[22%] top-1 rounded-full bg-amber-400 px-1.5 text-[10px] font-semibold text-ink">{badge}</span>}
    </Link>
  );
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-sand-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      {main.map((i) => cell(i.href, i.icon, i.label, isActive(path, i.href), i.badge))}
      {cell("/app/more", "more", moreLabel, moreActive, moreBadge)}
    </nav>
  );
}
