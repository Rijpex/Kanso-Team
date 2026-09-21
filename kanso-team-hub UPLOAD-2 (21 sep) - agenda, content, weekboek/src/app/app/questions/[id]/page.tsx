import { notFound } from "next/navigation";
import { requireUser } from "@/lib/server/auth";
import { q, q1 } from "@/lib/server/db";
import { T } from "@/lib/i18n";
import { dateTime } from "@/lib/dates";
import { BackLink } from "@/components/ui";
import { Comments, type CommentRow } from "@/components/Comments";
import { ConfirmSubmit } from "@/components/client";
import { deleteQuestion, setQuestionStatus } from "../../actions";

export default async function QuestionPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const qu = await q1<{ id: string; title: string; body: string | null; status: string; created_at: string; name: string | null }>(
    "select qu.*, u.name from questions qu left join users u on u.id = qu.user_id where qu.id = $1", [params.id]).catch(() => null);
  if (!qu) notFound();
  const comments = await q<CommentRow>("select c.id, c.body, c.created_at, c.user_id, u.name, u.color, u.role from comments c left join users u on u.id = c.user_id where c.question_id = $1 order by c.created_at", [qu.id]);
  return (
    <div className="max-w-3xl">
      <BackLink href="/app/questions" label={tr("Fragen", "Vragen")} />
      <h1>{qu.title}</h1>
      <p className="muted mt-1">{qu.name} · {dateTime(qu.created_at, user.lang)}</p>
      {qu.body && <p className="card mt-4 whitespace-pre-wrap text-sm">{qu.body}</p>}
      <section className="card mt-5">
        <Comments rows={comments} lang={user.lang} me={user} target={{ question_id: qu.id }} placeholder={tr("Antwort schreiben …", "Antwoord schrijven …")} />
      </section>
      <div className="mt-4 flex gap-2">
        <form action={setQuestionStatus}><input type="hidden" name="id" value={qu.id} /><input type="hidden" name="status" value={qu.status === "open" ? "answered" : "open"} />
          <button className="btn-ghost btn-sm">{qu.status === "open" ? tr("Als beantwortet markieren", "Markeer als beantwoord") : tr("Wieder öffnen", "Weer openen")}</button></form>
        {user.role === "admin" && <form action={deleteQuestion}><input type="hidden" name="id" value={qu.id} /><ConfirmSubmit confirm={tr("Wirklich löschen?", "Echt verwijderen?")}>{tr("Löschen", "Verwijderen")}</ConfirmSubmit></form>}
      </div>
    </div>
  );
}
