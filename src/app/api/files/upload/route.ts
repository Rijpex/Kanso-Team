import { NextResponse } from "next/server";
import { q, q1 } from "@/lib/server/db";
import { apiUser } from "@/lib/server/files";

export const runtime = "nodejs";

/** Terugvaloptie zonder Supabase-opslag: kleine bestanden (max. 4 MB) in de database. */
export async function POST(req: Request) {
  const user = await apiUser();
  if (!user) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  const fd = await req.formData();
  const file = fd.get("file");
  const taskId = String(fd.get("taskId") || "") || null;
  const requestId = String(fd.get("requestId") || "") || null;
  if (!(file instanceof File) || !(taskId || requestId)) return NextResponse.json({ error: "Ungültig" }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "max. 4 MB" }, { status: 400 });
  if (taskId && !(await q1("select 1 from tasks where id = $1", [taskId]))) return NextResponse.json({ error: "Aufgabe nicht gefunden" }, { status: 404 });
  if (requestId && !(await q1("select 1 from customer_requests where id = $1", [requestId]))) return NextResponse.json({ error: "Eintrag nicht gefunden" }, { status: 404 });
  await q("insert into files (task_id, request_id, storage, data, name, size, mime_type, uploaded_by) values ($1,$2,'db',$3,$4,$5,$6,$7)", [taskId, requestId, Buffer.from(await file.arrayBuffer()), file.name.slice(0, 200), file.size, file.type || null, user.id]);
  return NextResponse.json({ ok: true });
}
