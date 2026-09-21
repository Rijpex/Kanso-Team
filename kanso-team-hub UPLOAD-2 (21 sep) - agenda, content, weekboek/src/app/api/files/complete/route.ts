import { NextResponse } from "next/server";
import { q } from "@/lib/server/db";
import { apiUser } from "@/lib/server/files";

export const runtime = "nodejs";

/** Stap 2: upload is klaar, bestand registreren bij de opdracht. */
export async function POST(req: Request) {
  const user = await apiUser();
  if (!user) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  const b = await req.json().catch(() => null);
  if (!b?.taskId || !b?.path || !String(b.path).startsWith(`tasks/${b.taskId}/`)) return NextResponse.json({ error: "Ungültig" }, { status: 400 });
  await q("insert into files (task_id, storage, storage_path, name, size, mime_type, uploaded_by) values ($1,'supabase',$2,$3,$4,$5,$6)", [b.taskId, b.path, String(b.name).slice(0, 200), Number(b.size) || 0, b.type || null, user.id]);
  await q("update tasks set updated_at = now() where id = $1", [b.taskId]);
  return NextResponse.json({ ok: true });
}
