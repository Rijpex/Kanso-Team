import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { q1 } from "@/lib/server/db";
import { apiUser, MAX_FILE, safeName } from "@/lib/server/files";
import { BUCKET, supabaseAdmin, supabaseConfigured } from "@/lib/server/storage";

export const runtime = "nodejs";

/** Stap 1: upload-URL aanvragen. Het bestand gaat daarna rechtstreeks naar de opslag (dus ook grote video's). */
export async function POST(req: Request) {
  const user = await apiUser();
  if (!user) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  const b = await req.json().catch(() => null);
  if (!(b?.taskId || b?.requestId) || !b?.name || typeof b.size !== "number") return NextResponse.json({ error: "Ungültig" }, { status: 400 });
  if (b.taskId && !(await q1("select 1 from tasks where id = $1", [b.taskId]))) return NextResponse.json({ error: "Aufgabe nicht gefunden" }, { status: 404 });
  if (b.requestId && !(await q1("select 1 from customer_requests where id = $1", [b.requestId]))) return NextResponse.json({ error: "Eintrag nicht gefunden" }, { status: 404 });
  if (!supabaseConfigured()) return NextResponse.json({ mode: "db" });
  if (b.size > MAX_FILE) return NextResponse.json({ error: `${b.name}: max. 500 MB` }, { status: 400 });
  const path = `${b.taskId ? `tasks/${b.taskId}` : `requests/${b.requestId}`}/${randomUUID()}-${safeName(String(b.name))}`;
  const { data, error } = await supabaseAdmin().storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) return NextResponse.json({ error: `Upload nicht möglich: ${error?.message || ""}` }, { status: 500 });
  return NextResponse.json({ mode: "supabase", url: process.env.NEXT_PUBLIC_SUPABASE_URL, anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, bucket: BUCKET, path, token: data.token });
}
