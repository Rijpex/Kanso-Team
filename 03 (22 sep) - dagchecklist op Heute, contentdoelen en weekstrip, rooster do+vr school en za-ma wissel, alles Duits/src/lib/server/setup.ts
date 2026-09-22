import "server-only";
import { q, q1, databaseUrl, pool } from "./db";
import { SCHEMA_SQL, SCHEMA_VERSION } from "./schema";
import { runSeed } from "./seed";

export async function migrate() {
  // In één transactie met een slot, zodat twee gelijktijdige starts elkaar niet in de weg zitten
  const client = await pool().connect();
  try {
    await client.query("begin");
    await client.query("select pg_advisory_xact_lock(74210921)");
    await client.query(SCHEMA_SQL);
    await client.query("commit");
  } catch (e) {
    await client.query("rollback").catch(() => undefined);
    throw e;
  } finally {
    client.release();
  }
  await runSeed();
  await q("insert into settings (key, value) values ('schema_version', $1::jsonb) on conflict (key) do update set value = excluded.value", [JSON.stringify(SCHEMA_VERSION)]);
}

const g = globalThis as unknown as { __hubSchemaOk?: number; __hubSchemaRun?: Promise<void> | null };
/** Na een code-update werkt de app de database zelf bij (één keer per serverstart gecontroleerd). */
export async function ensureSchema() {
  if (g.__hubSchemaOk === SCHEMA_VERSION) return;
  if (!g.__hubSchemaRun) g.__hubSchemaRun = doEnsure().finally(() => { g.__hubSchemaRun = null; });
  await g.__hubSchemaRun;
}

async function doEnsure() {
  const row = await q1<{ value: number }>("select value from settings where key = 'schema_version'").catch(() => null);
  if (Number(row?.value ?? 1) < SCHEMA_VERSION) await migrate();
  g.__hubSchemaOk = SCHEMA_VERSION;
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
