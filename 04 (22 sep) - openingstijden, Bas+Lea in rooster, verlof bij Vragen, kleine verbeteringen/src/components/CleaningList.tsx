import { pick, type Lang } from "@/lib/i18n";
import type { CleaningRow } from "@/lib/server/queries";
import { toggleCleaning } from "@/app/app/actions";

const MOMENT: Record<string, { de: string; nl: string }> = {
  open: { de: "Vor dem Öffnen", nl: "Voor opening" },
  day: { de: "Tagsüber", nl: "Overdag" },
  close: { de: "Zum Feierabend", nl: "Bij sluiten" },
};

type Owner = { id: string; name: string; color: string };
export function CleaningList({ rows, date, lang, zones }: { rows: CleaningRow[]; date: string; lang: Lang; zones?: { a?: Owner; b?: Owner } }) {
  const groups = ["open", "day", "close"].map((m) => ({ m, rows: rows.filter((r) => r.moment === m) })).filter((g) => g.rows.length);
  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g.m}>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">{pick(lang, MOMENT[g.m].de, MOMENT[g.m].nl)}</div>
          <ul className="divide-y divide-sand-200">
            {g.rows.map((r) => (
              <li key={r.id}>
                <form action={toggleCleaning}>
                  <input type="hidden" name="task_id" value={r.id} />
                  <input type="hidden" name="date" value={date} />
                  <button className="flex w-full items-center gap-3 py-2 text-left text-sm">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${r.done_by ? "border-emerald-600 bg-emerald-600 text-white" : "border-sand-400 bg-white"}`}>{r.done_by ? "✓" : ""}</span>
                    <span className={`flex-1 ${r.done_by ? "text-stone-400 line-through" : ""}`}>{pick(lang, r.title_de, r.title_nl)}</span>
                    {r.zone && zones?.[r.zone as "a" | "b"] && !r.done_by && <span className="badge text-white" style={{ background: zones[r.zone as "a" | "b"]!.color }}>{zones[r.zone as "a" | "b"]!.name}</span>}
                    {r.freq === "weekly" && <span className="badge bg-sand-100 text-stone-500">{lang === "nl" ? "wekelijks" : "wöchentlich"}</span>}
                    {r.done_by && <span className="text-xs text-stone-400">{r.done_by}</span>}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
