import { T, type Lang } from "@/lib/i18n";
import { dateTime } from "@/lib/dates";
import { addComment, deleteComment } from "@/app/app/actions";
import { Avatar } from "./ui";
import { ConfirmSubmit, Submit } from "./client";

export type CommentRow = { id: string; body: string; created_at: string; user_id: string | null; name: string | null; color: string | null; role: string | null };

export function Comments({ rows, lang, me, target, placeholder }: { rows: CommentRow[]; lang: Lang; me: { id: string; role: string }; target: { task_id?: string; question_id?: string }; placeholder?: string }) {
  const tr = T(lang);
  return (
    <div>
      <ul className="space-y-4">
        {rows.map((c) => (
          <li key={c.id} className="flex gap-3">
            <Avatar name={c.name || "?"} color={c.color} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span className="font-semibold text-ink">{c.name || "–"}</span>
                {c.role === "admin" && <span className="badge bg-ink text-white">Team</span>}
                <span>{dateTime(c.created_at, lang)}</span>
                {(me.role === "admin" || c.user_id === me.id) && (
                  <form action={deleteComment} className="ml-auto"><input type="hidden" name="id" value={c.id} /><ConfirmSubmit className="text-xs text-stone-400 hover:text-red-600" confirm={tr("Sicher?", "Zeker?")}>×</ConfirmSubmit></form>
                )}
              </div>
              <div className={`mt-1 whitespace-pre-wrap break-words rounded-xl p-3 text-sm ${c.role === "admin" ? "bg-brand-light" : "bg-sand-100"}`}>{c.body}</div>
            </div>
          </li>
        ))}
      </ul>
      <form action={addComment} className="mt-4 space-y-2">
        {target.task_id && <input type="hidden" name="task_id" value={target.task_id} />}
        {target.question_id && <input type="hidden" name="question_id" value={target.question_id} />}
        <textarea name="body" className="input" rows={3} required placeholder={placeholder || tr("Frage, Anmerkung oder Update schreiben …", "Schrijf een vraag, opmerking of update …")} key={rows.length} />
        <Submit>{tr("Senden", "Versturen")}</Submit>
      </form>
    </div>
  );
}
