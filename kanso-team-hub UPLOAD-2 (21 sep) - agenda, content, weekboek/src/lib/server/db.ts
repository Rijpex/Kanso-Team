import "server-only";
import { Pool, types, type QueryResultRow } from "pg";

// Datums en tijden als tekst teruggeven ("2026-09-22", "10:30:00"), zonder tijdzone-gedoe.
types.setTypeParser(1082, (v) => v);
types.setTypeParser(1083, (v) => v);
types.setTypeParser(1700, (v) => Number(v));
types.setTypeParser(20, (v) => Number(v));

export function databaseUrl(): string | null {
  return process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || null;
}

function cleanUrl(url: string) {
  // sslmode in de URL overschrijft anders onze ssl-instelling
  try {
    const u = new URL(url);
    u.searchParams.delete("sslmode");
    u.searchParams.delete("supa");
    return u.toString();
  } catch {
    return url;
  }
}

const g = globalThis as unknown as { __hubPool?: Pool };

export function pool(): Pool {
  if (!g.__hubPool) {
    const url = databaseUrl();
    if (!url) throw new Error("NO_DATABASE");
    const local = /localhost|127\.0\.0\.1/.test(url);
    g.__hubPool = new Pool({
      connectionString: cleanUrl(url),
      ssl: local ? undefined : { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 10000,
    });
  }
  return g.__hubPool;
}

export async function q<T extends QueryResultRow = any>(sql: string, params: unknown[] = []): Promise<T[]> {
  const res = await pool().query<T>(sql, params as any[]);
  return res.rows;
}

export async function q1<T extends QueryResultRow = any>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await q<T>(sql, params);
  return rows[0] ?? null;
}
