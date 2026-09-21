import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { tasksQuery } from "@/lib/server/queries";
import { TASK_CATEGORY, TASK_STATUS, T, lbl } from "@/lib/i18n";
import { dateTime, longDate, today } from "@/lib/dates";
import { Avatar, BackLink, Badge } from "@/components/ui";
import { Markdown } from "@/components/Markdown";
import { Comments, type CommentRow } from "@/components/Comments";
import { FileUpload } from "@/components/FileUpload";
import { ConfirmSubmit } from "@/components/client";
import { addChecklistItem, deleteChecklistItem, deleteFile, deleteTask, setTaskStatus, toggleChecklistItem } from "../../actions";

const size = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default async function TaskPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const [task] = await tasksQuery("t.id = $1", [params.id]).catch(() => []);
  if (!task) notFound();
  const [checklist, files, comments] = await Promise.all([
    q<{ id: string; text: string; done: boolean }>("select id, text, done from task_checklist where task_id = $1 order by position", [task.id]),
    q<{ id: string; name: string; size: number; mime_type: string | null; created_at: string; uploaded_by: string | null; uploader: string | null }>(
      "select f.id, f.name, f.size, f.mime_type, f.created_at, f.uploaded_by, u.name as uploader from files f left join users u on u.id = f.uploaded_by where f.task_id = $1 order by f.created_at", [task.id]),
    q<CommentRow>("select c.id, c.body, c.created_at, c.user_id, u.name, u.color, u.role from comments c left join users u on u.id = c.user_id where c.task_id = $1 order by c.created_at", [task.id]),
  ]);
  const overdue = task.due && task.due < today() && task.status !== "done";

  return (
    <div className="max-w-3xl">
      <BackLink href="/app/tasks" label={tr("Aufgaben", "Opdrachten")} />
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Badge l={TASK_CATEGORY[task.category]} lang={user.lang} />
        {task.home_ok && <span className="badge bg-sky-50 text-sky-700">{tr("Homeoffice", "Thuiswerk")}</span>}
        {task.due && <span className={`badge ${overdue ? "bg-red-100 text-red-700" : "bg-sand-100 text-stone-600"}`}>{tr("Fällig", "Deadline")}: {longDate(task.due, user.lang)}</span>}
      </div>
      <div className="flex items-start justify-between gap-3">
        <h1>{task.title}</h1>
        <Link href={`/app/tasks/${task.id}/edit`} className="btn-ghost btn-sm shrink-0">{tr("Bearbeiten", "Bewerken")}</Link>
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm text-stone-500">
        {task.assignees.length ? task.assignees.map((a) => <span key={a.id} className="flex items-center gap-1"><Avatar name={a.name} color={a.color} size="h-6 w-6 text-[10px]" />{a.name}</span>) : <span>{tr("Für beide", "Voor allebei")}</span>}
      </div>

      <form action={setTaskStatus} className="mt-4 flex flex-wrap gap-1.5">
        <input type="hidden" name="id" value={task.id} />
        {Object.entries(TASK_STATUS).map(([k, l]) => (
          <button key={k} name="status" value={k} className={`btn btn-sm ${task.status === k ? "bg-ink text-white" : "bg-white text-stone-600 ring-1 ring-sand-300 hover:bg-sand-100"}`}>{lbl(user.lang, l)}</button>
        ))}
      </form>

      {task.description && <section className="card mt-5"><Markdown text={task.description} /></section>}

      <section className="card mt-5">
        <h2 className="mb-2">{tr("Checkliste", "Checklist")}</h2>
        <ul className="divide-y divide-sand-200">
          {checklist.map((c) => (
            <li key={c.id} className="flex items-center gap-2 py-1.5">
              <form action={toggleChecklistItem} className="flex-1"><input type="hidden" name="id" value={c.id} />
                <button className="flex w-full items-center gap-3 text-left text-sm">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${c.done ? "border-emerald-600 bg-emerald-600 text-white" : "border-sand-400 bg-white"}`}>{c.done ? "✓" : ""}</span>
                  <span className={c.done ? "text-stone-400 line-through" : ""}>{c.text}</span>
                </button>
              </form>
              <form action={deleteChecklistItem}><input type="hidden" name="id" value={c.id} /><button className="px-1 text-stone-300 hover:text-red-600" aria-label="löschen">×</button></form>
            </li>
          ))}
        </ul>
        <form action={addChecklistItem} className="mt-2 flex gap-2" key={checklist.length}>
          <input type="hidden" name="task_id" value={task.id} />
          <input name="text" className="input" placeholder={tr("Schritt hinzufügen …", "Stap toevoegen …")} required />
          <button className="btn-ghost">+</button>
        </form>
      </section>

      <section className="card mt-5">
        <h2 className="mb-2">{tr("Dateien", "Bestanden")}</h2>
        <ul className="mb-3 space-y-1.5">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-2 text-sm">
              <a href={`/api/files/${f.id}`} target="_blank" className="min-w-0 flex-1 truncate text-brand underline">{f.name}</a>
              <span className="shrink-0 text-xs text-stone-400">{size(f.size)} · {f.uploader} · {dateTime(f.created_at, user.lang)}</span>
              {(user.role === "admin" || f.uploaded_by === user.id) && <form action={deleteFile}><input type="hidden" name="id" value={f.id} /><ConfirmSubmit className="px-1 text-stone-300 hover:text-red-600" confirm="?">×</ConfirmSubmit></form>}
            </li>
          ))}
          {!files.length && <li className="text-sm text-stone-500">{tr("Noch keine Dateien.", "Nog geen bestanden.")}</li>}
        </ul>
        <FileUpload taskId={task.id} label={tr("Datei hochladen", "Bestand uploaden")} hint={tr("Fotos, Videos, PDFs, Dokumente", "Foto's, video's, pdf's, documenten")} />
      </section>

      <section className="card mt-5">
        <h2 className="mb-3">{tr("Fragen & Kommentare", "Vragen & reacties")}</h2>
        <Comments rows={comments} lang={user.lang} me={user} target={{ task_id: task.id }} />
      </section>

      {user.role === "admin" && (
        <form action={deleteTask} className="mt-6"><input type="hidden" name="id" value={task.id} /><ConfirmSubmit confirm={tr("Wirklich löschen?", "Echt verwijderen?")}>{tr("Aufgabe löschen", "Opdracht verwijderen")}</ConfirmSubmit></form>
      )}
    </div>
  );
}
