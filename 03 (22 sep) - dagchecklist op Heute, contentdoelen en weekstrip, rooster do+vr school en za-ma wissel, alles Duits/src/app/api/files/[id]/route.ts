import { NextResponse } from "next/server";
import { q1 } from "@/lib/server/db";
import { apiUser } from "@/lib/server/files";
import { BUCKET, supabaseAdmin } from "@/lib/server/storage";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await apiUser();
  if (!user) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  const f = await q1<{ storage: string; storage_path: string; data: Buffer | null; name: string; mime_type: string | null }>("select storage, storage_path, data, name, mime_type from files where id = $1", [params.id]).catch(() => null);
  if (!f) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  if (f.storage === "supabase") {
    const { data, error } = await supabaseAdmin().storage.from(BUCKET).createSignedUrl(f.storage_path, 300);
    if (error || !data) return NextResponse.json({ error: "Datei nicht verfügbar" }, { status: 500 });
    return NextResponse.redirect(data.signedUrl);
  }
  return new NextResponse(new Uint8Array(f.data || Buffer.alloc(0)), {
    headers: { "content-type": f.mime_type || "application/octet-stream", "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(f.name)}`, "cache-control": "private, max-age=300" },
  });
}
