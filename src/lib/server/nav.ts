import "server-only";
import { q1 } from "./db";
import { T } from "@/lib/i18n";
import type { NavItem } from "@/components/Nav";

export async function navItems(user: { id: string; role: string; lang: "de" | "nl" }): Promise<NavItem[]> {
  const tr = T(user.lang);
  const openQ = user.role === "admin" ? (await q1<{ n: number }>("select count(*)::int as n from questions where status = 'open'"))?.n ?? 0 : 0;
  const review = user.role === "admin" ? (await q1<{ n: number }>("select count(*)::int as n from tasks where status = 'review'"))?.n ?? 0 : 0;
  const pendingAbs = user.role === "admin" ? (await q1<{ n: number }>("select count(*)::int as n from absences where status = 'requested'"))?.n ?? 0 : 0;
  const G = { shop: tr("Laden", "Winkel"), proj: tr("Projekte", "Projecten"), me: user.role === "admin" ? tr("Praktikantinnen", "Stagiairs") : tr("Mein Praktikum", "Mijn stage"), admin: tr("Verwaltung", "Beheer") };
  const items: NavItem[] = [
    { href: "/app", label: tr("Heute", "Vandaag"), icon: "home", main: true },
    { href: "/app/calendar", label: tr("Agenda", "Agenda"), icon: "calendar", main: true },
    { href: "/app/tasks", label: tr("Aufgaben", "Opdrachten"), icon: "tasks", main: true, badge: review },
    { href: "/app/questions", label: tr("Fragen", "Vragen"), icon: "chat", main: true, badge: openQ },
    { href: "/app/cleaning", label: tr("Storepflege", "Winkelverzorging"), icon: "sparkle", group: G.shop },
    { href: "/app/products", label: tr("Produkte", "Producten"), icon: "box", group: G.shop },
    { href: "/app/kb", label: tr("Wissen", "Kennis"), icon: "book", group: G.shop },
    { href: "/app/content", label: tr("Content-Plan", "Contentplan"), icon: "video", group: G.proj },
    { href: "/app/ideas", label: tr("Produktideen", "Productideeën"), icon: "bulb", group: G.proj },
    { href: "/app/journal", label: tr("Kundenfragen", "Klantvragen"), icon: "chat", group: G.proj },
    { href: "/app/reflect", label: tr("Wochenrückblick", "Weekboek"), icon: "book", group: G.me },
    { href: "/app/skills", label: tr("Lernziele", "Leerdoelen"), icon: "flag", group: G.me },
    { href: "/app/absence", label: tr("Abwesenheit", "Afwezigheid"), icon: "clock", group: G.me, badge: pendingAbs },
    { href: "/app/onboarding", label: tr("Einarbeitung", "Inwerken"), icon: "flag", group: G.me },
  ];
  if (user.role === "admin") {
    items.push({ href: "/app/roster", label: tr("Dienstplan füllen", "Rooster vullen"), icon: "clock", group: G.admin });
    items.push({ href: "/app/team", label: tr("Team & Einstellungen", "Team & instellingen"), icon: "users", group: G.admin });
  }
  return items;
}

