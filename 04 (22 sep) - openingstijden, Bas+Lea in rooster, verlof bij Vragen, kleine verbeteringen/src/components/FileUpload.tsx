"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const MAX_DB = 4 * 1024 * 1024;

export function FileUpload({ taskId, label, hint }: { taskId: string; label: string; hint: string }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    try {
      for (const file of Array.from(files)) {
        setBusy(file.name);
        const signRes = await fetch("/api/files/sign", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ taskId, name: file.name, size: file.size, type: file.type }) });
        const sign = await signRes.json();
        if (!signRes.ok) throw new Error(sign.error || "Upload fehlgeschlagen");
        if (sign.mode === "supabase") {
          const sb = createClient(sign.url, sign.anonKey, { auth: { persistSession: false } });
          const { error: upErr } = await sb.storage.from(sign.bucket).uploadToSignedUrl(sign.path, sign.token, file, { contentType: file.type || undefined });
          if (upErr) throw new Error(upErr.message);
          const done = await fetch("/api/files/complete", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ taskId, path: sign.path, name: file.name, size: file.size, type: file.type }) });
          if (!done.ok) throw new Error((await done.json()).error || "Upload fehlgeschlagen");
        } else {
          if (file.size > MAX_DB) throw new Error(`${file.name}: max. 4 MB`);
          const fd = new FormData();
          fd.set("taskId", taskId);
          fd.set("file", file);
          const res = await fetch("/api/files/upload", { method: "POST", body: fd });
          if (!res.ok) throw new Error((await res.json()).error || "Upload fehlgeschlagen");
        }
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy("");
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <input ref={input} type="file" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
      <button type="button" className="btn-ghost" disabled={!!busy} onClick={() => input.current?.click()}>{busy ? `↑ ${busy} …` : `+ ${label}`}</button>
      <p className="mt-1 text-xs text-stone-400">{hint}</p>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
