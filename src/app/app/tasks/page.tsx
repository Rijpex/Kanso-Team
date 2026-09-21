import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { MINE, tasksQuery } from "@/lib/server/queries";
import { TASK_CATEGORY, TASK_STATUS, T, lbl } from "@/lib/i18n";
import { Empty, PageHeader } from "@/components/ui";
import { TaskCard } from "@/components/TaskCard";

export default async function Tasks({ searchParams }: { searchParams: { who?: string; cat?: string; home?: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const who = searchParams.who || (user.role === "admin" ? "all" : "mine");
  const cat = searchParams.cat && TASK_CATEGORY[searchParams.cat] ? searchParams.cat : "";
  const home = searchParams.home === "1";
  const where: string[] = ["(t.status <> 'done' or t.updated_at > now() - interval '21 days')"];
  const params: unknown[] = [];
  if (who === "mine") { params.push(user.id); where.push(MINE); }
  if (cat) { params.push(cat); where.push(`t.category = $${params.length}`); }
  if (home) where.push("t.home_ok");
  const tasks = await tasksQuery(where.join(" and "), params);
  const link = (o: Record<string, string>) => {
    const p = new URLSearchParams({ who, ...(cat ? { cat } : {}), ...(home ? { home: "1" } : {}), ...o });
    [...p.entries()].forEach(([k, v]) => !v && p.delete(k));
    return `/app/tasks?${p}`;
  };
  const chip = (active: boolean) => `badge cursor-pointer !px-2.5 !py-1 ${active ? "bg-ink text-white" : "bg-white text-stone-600 ring-1 ring-sand-300"}`;

  return (
    <div>
      <PageHeader title={tr("Aufgaben", "Opdrachten")} sub={tr("Öffne eine Aufgabe, um Fragen zu stellen, Dateien hochzuladen oder den Status zu ändern.", "Open een opdracht om vragen te stellen, bestanden te uploaden of de status te wijzigen.")}>
        <Link href="/app/tasks/new" className="btn-primary">+ {tr("Neue Aufgabe", "Nieuwe opdracht")}</Link>
      </PageHeader>
      <div className="mb-4 flex flex-wrap gap-1.5">
        <Link href={link({ who: "mine" })} className={chip(who === "mine")}>{tr("Meine", "Mijn")}</Link>
        <Link href={link({ who: "all" })} className={chip(who === "all")}>{tr("Alle", "Alle")}</Link>
        <span className="mx-1 w-px bg-sand-300" />
        <Link href={link({ home: home ? "" : "1" })} className={chip(home)}>{tr("Homeoffice", "Thuiswerk")}</Link>
        {Object.entries(TASK_CATEGORY).map(([k, l]) => <Link key={k} href={link({ cat: cat === k ? "" : k })} className={chip(cat === k)}>{lbl(user.lang, l)}</Link>)}
      </div>
      {!tasks.length && <Empty>{tr("Keine Aufgaben gefunden.", "Geen opdrachten gevonden.")}</Empty>}
      <div className="grid gap-4 lg:grid-cols-4">
        {Object.entries(TASK_STATUS).map(([k, l]) => {
          const col = tasks.filter((t) => t.status === k);
          if (!tasks.length) return null;
          return (
            <section key={k} className={`rounded-2xl bg-sand-100 p-2.5 ${col.length ? "" : "hidden lg:block"}`}>
              <div className="mb-2 flex items-center justify-between px-1 text-sm font-semibold"><span>{lbl(user.lang, l)}</span><span className="text-stone-400">{col.length}</span></div>
              <div className="space-y-2">{col.map((t) => <TaskCard key={t.id} t={t} lang={user.lang} />)}</div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
