import { requireUser } from "@/lib/server/auth";
import { team } from "@/lib/server/queries";
import { T } from "@/lib/i18n";
import { BackLink } from "@/components/ui";
import { TaskForm } from "@/components/TaskForm";

export default async function NewTask() {
  const user = await requireUser();
  const tr = T(user.lang);
  return (
    <div>
      <BackLink href="/app/tasks" label={tr("Aufgaben", "Opdrachten")} />
      <h1 className="mb-4">{tr("Neue Aufgabe", "Nieuwe opdracht")}</h1>
      <TaskForm lang={user.lang} users={await team()} />
    </div>
  );
}
