import { notFound } from "next/navigation";
import { requireUser } from "@/lib/server/auth";
import { tasksQuery, team } from "@/lib/server/queries";
import { T } from "@/lib/i18n";
import { BackLink } from "@/components/ui";
import { TaskForm } from "@/components/TaskForm";

export default async function EditTask({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const [task] = await tasksQuery("t.id = $1", [params.id]).catch(() => []);
  if (!task) notFound();
  return (
    <div>
      <BackLink href={`/app/tasks/${task.id}`} label={task.title} />
      <h1 className="mb-4">{tr("Aufgabe bearbeiten", "Opdracht bewerken")}</h1>
      <TaskForm lang={user.lang} users={await team()} task={task} />
    </div>
  );
}
