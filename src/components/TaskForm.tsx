import Link from "next/link";
import { TASK_CATEGORY, T, lbl, type Lang } from "@/lib/i18n";
import type { TeamUser } from "@/lib/server/queries";
import { saveTask } from "@/app/app/actions";
import { Submit } from "./client";

type TaskIn = { id: string; title: string; description: string | null; category: string; due: string | null; home_ok: boolean; assignees: { id: string }[] };

export function TaskForm({ lang, users, task }: { lang: Lang; users: TeamUser[]; task?: TaskIn }) {
  const tr = T(lang);
  return (
    <form action={saveTask} className="card max-w-2xl space-y-4">
      <input type="hidden" name="id" value={task?.id || ""} />
      <div><label className="label">{tr("Titel", "Titel")}</label><input name="title" className="input" defaultValue={task?.title} required autoFocus={!task} /></div>
      <div>
        <label className="label">{tr("Beschreibung – was genau ist zu tun, was ist das Ergebnis?", "Omschrijving – wat moet er precies gebeuren, wat is het resultaat?")}</label>
        <textarea name="description" className="input" rows={7} defaultValue={task?.description || ""} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="label">{tr("Bereich", "Categorie")}</label>
          <select name="category" className="input" defaultValue={task?.category || "shop"}>{Object.entries(TASK_CATEGORY).map(([k, l]) => <option key={k} value={k}>{lbl(lang, l)}</option>)}</select>
        </div>
        <div><label className="label">{tr("Fällig am", "Deadline")}</label><input type="date" name="due" className="input" defaultValue={task?.due || ""} /></div>
      </div>
      <div>
        <label className="label">{tr("Für wen? (nichts ankreuzen = für beide Praktikantinnen)", "Voor wie? (niets aanvinken = voor beide stagiairs)")}</label>
        <div className="flex flex-wrap gap-3">
          {users.map((u) => (
            <label key={u.id} className="flex items-center gap-1.5 text-sm"><input type="checkbox" name="assignees" value={u.id} defaultChecked={task?.assignees.some((a) => a.id === u.id)} /> {u.name}</label>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="home_ok" defaultChecked={task?.home_ok} /> {tr("Geht auch im Homeoffice (Montag)", "Kan ook thuis (maandag)")}</label>
      <div className="flex gap-2"><Submit>{tr("Speichern", "Opslaan")}</Submit><Link href={task ? `/app/tasks/${task.id}` : "/app/tasks"} className="btn-ghost">{tr("Abbrechen", "Annuleren")}</Link></div>
    </form>
  );
}
