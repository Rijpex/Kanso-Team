import Link from "next/link";
import { TASK_CATEGORY, TASK_STATUS, type Lang } from "@/lib/i18n";
import { shortDate, today } from "@/lib/dates";
import type { TaskRow } from "@/lib/server/queries";
import { Avatar, Badge } from "./ui";

export function TaskCard({ t, lang, showStatus = false }: { t: TaskRow; lang: Lang; showStatus?: boolean }) {
  const overdue = t.due && t.due < today() && t.status !== "done";
  return (
    <Link href={`/app/tasks/${t.id}`} className="block rounded-xl bg-white p-3 ring-1 ring-sand-200 transition hover:ring-brand">
      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
        <Badge l={TASK_CATEGORY[t.category]} lang={lang} />
        {showStatus && <Badge l={TASK_STATUS[t.status]} lang={lang} />}
        {t.home_ok && <span className="badge bg-sky-50 text-sky-700">{lang === "nl" ? "Thuiswerk" : "Homeoffice"}</span>}
      </div>
      <div className="text-sm font-medium leading-snug">{t.title}</div>
      <div className="mt-2 flex items-center gap-3 text-xs text-stone-500">
        {t.due && <span className={overdue ? "font-semibold text-red-600" : ""}>{shortDate(t.due, lang)}</span>}
        {t.check_total > 0 && <span>{t.check_done}/{t.check_total} ✓</span>}
        {t.comments > 0 && <span>{t.comments} {lang === "nl" ? "reacties" : "Kommentare"}</span>}
        {t.files > 0 && <span>{t.files} {lang === "nl" ? "bestanden" : "Dateien"}</span>}
        <span className="ml-auto flex -space-x-1.5">
          {t.assignees.map((a) => <Avatar key={a.id} name={a.name} color={a.color} size="h-6 w-6 text-[10px] ring-2 ring-white" />)}
        </span>
      </div>
    </Link>
  );
}
