import "server-only";
import { q1 } from "./db";
import { T } from "@/lib/i18n";
import type { NavItem } from "@/components/Nav";

export async function navItems(user: { id: string; role: string; lang: "de" | "nl" }): Promise<NavItem[]> {
  const tr = T(user.lang);
  const openQ = user.role === "admin" ? (await q1<{ n: number }>("select count(*)::int as n from questions where status = 'open'"))?.n ?? 0 : 0;
  const review = user.role === "admin" ? (await q1<{ n: number }>("select count(*)::int as n from tasks where status = 'review'"))?.n ?? 0 : 0;
  const items: NavItem[] = [
    { href: "/app", label: tr("Heute", "Vandaag"), icon: "home", main: true },
    { href: "/app/calendar", label: tr("Kalender", "Agenda"), icon: "calendar", main: true },
    { href: "/app/roster", label: tr("Dienstplan", "Rooster"), icon: "clock" },
    { href: "/app/tasks", label: tr("Aufgaben", "Opdrachten"), icon: "tasks", main: true, badge: review },
    { href: "/app/questions", label: tr("Fragen", "Vragen"), icon: "chat", main: true, badge: openQ },
    { href: "/app/cleaning", label: tr("Storepflege", "Winkelverzorging"), icon: "sparkle" },
    { href: "/app/content", label: tr("Content-Plan", "Contentplan"), icon: "video" },
    { href: "/app/ideas", label: tr("Produktideen", "Productideeën"), icon: "bulb" },
    { href: "/app/journal", label: tr("Markentagebuch", "Merkdagboek"), icon: "book" },
    { href: "/app/products", label: tr("Produkte", "Producten"), icon: "box" },
    { href: "/app/kb", label: tr("Wissen", "Kennis"), icon: "book" },
    { href: "/app/onboarding", label: tr("Einarbeitung", "Inwerken"), icon: "flag" },
  ];
  if (user.role === "admin") items.push({ href: "/app/team", label: tr("Team & Einstellungen", "Team & instellingen"), icon: "users" });
  return items;
}

