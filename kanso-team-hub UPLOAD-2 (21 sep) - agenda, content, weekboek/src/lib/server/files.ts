import "server-only";
import { cookies } from "next/headers";
import { q1 } from "./db";
import { COOKIE } from "./auth";

/** Sessiecontrole voor API-routes (geeft null terug i.p.v. een redirect). */
export async function apiUser() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  return q1<{ id: string; role: string }>("select u.id, u.role from sessions s join users u on u.id = s.user_id where s.token = $1 and s.expires_at > now() and u.active", [token]);
}
export const MAX_FILE = 500 * 1024 * 1024;
export const safeName = (n: string) => n.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.\-]+/g, "_").slice(-120);
