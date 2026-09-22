import { requireUser } from "@/lib/server/auth";
import { q } from "@/lib/server/db";
import { T } from "@/lib/i18n";
import { shortDate } from "@/lib/dates";
import { Empty, PageHeader } from "@/components/ui";
import { ConfirmSubmit } from "@/components/client";
import { deleteJournal } from "../actions";

export default async function Journal() {
  const user = await requireUser();
  const tr = T(user.lang);
  const [quotes, online] = await Promise.all([
    q<{ id: string; date: string; text: string; name: string | null }>("select j.id, j.date, j.text, u.name from journal j left join users u on u.id = j.user_id where j.kind = 'quote' order by j.created_at desc limit 200"),
    q<{ week: string; n: number }>("select date_trunc('week', date)::date::text as week, count(*)::int as n from journal where kind = 'online' group by 1 order by 1 desc limit 12"),
  ]);
  const max = Math.max(1, ...online.map((o) => o.n));
  return (
    <div className="max-w-3xl">
      <PageHeader title={tr("Kundenstimmen", "Klantstemmen")} sub={tr("Kundensätze und Online-Anfragen – sie entscheiden mit, wie KANSŌ sich positioniert und wie der Onlineshop aussieht.", "Klantzinnen en online-aanvragen – ze bepalen mee hoe KANSŌ zich positioneert en hoe de webshop eruitziet.")} />
      <section className="card mb-5">
        <h2 className="mb-3">{tr("Online-Anfragen pro Woche", "Online-aanvragen per week")}</h2>
        {!online.length && <p className="text-sm text-stone-500">{tr("Noch keine gezählt.", "Nog geen geteld.")}</p>}
        <ul className="space-y-1.5 text-sm">
          {online.map((o) => (
            <li key={o.week} className="flex items-center gap-3"><span className="w-28 shrink-0 text-stone-500">{tr("ab", "vanaf")} {shortDate(o.week, user.lang)}</span><span className="h-3 rounded-full bg-brand" style={{ width: `${(o.n / max) * 70}%` }} /><span className="tabular-nums">{o.n}</span></li>
          ))}
        </ul>
      </section>
      <h2 className="mb-2">{tr("Kundensätze", "Klantzinnen")}</h2>
      {!quotes.length && <Empty>{tr("Noch nichts gemerkt. Der erste Satz kommt bestimmt.", "Nog niets bewaard. De eerste zin komt vast.")}</Empty>}
      <ul className="space-y-2">
        {quotes.map((x) => (
          <li key={x.id} className="flex items-start gap-3 rounded-xl bg-white p-3 ring-1 ring-sand-200">
            <span className="flex-1 text-sm">„{x.text}“<span className="mt-0.5 block text-xs text-stone-400">{shortDate(x.date, user.lang)} · {x.name}</span></span>
            {user.role === "admin" && <form action={deleteJournal}><input type="hidden" name="id" value={x.id} /><ConfirmSubmit className="px-1 text-stone-300 hover:text-red-600" confirm="?">×</ConfirmSubmit></form>}
          </li>
        ))}
      </ul>
    </div>
  );
}
