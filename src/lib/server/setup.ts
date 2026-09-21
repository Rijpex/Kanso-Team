import "server-only";
import { q, q1, databaseUrl } from "./db";
import { SCHEMA_SQL } from "./schema";
import { runSeed } from "./seed";

export async function migrate() {
  await q(SCHEMA_SQL);
  await runSeed();
}

/** "nodb" = geen database gekoppeld, "empty" = nog niet ingericht, "ready" = er bestaat een beheerder */
export async function installState(): Promise<"nodb" | "empty" | "ready" | { error: string }> {
  if (!databaseUrl()) return "nodb";
  try {
    const t = await q1<{ exists: boolean }>("select to_regclass('public.users') is not null as exists");
    if (!t?.exists) return "empty";
    const u = await q1("select 1 from users limit 1");
    return u ? "ready" : "empty";
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}
