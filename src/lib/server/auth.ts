import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { q, q1 } from "./db";

export const COOKIE = "hub_session";
export type User = { id: string; username: string; name: string; role: "admin" | "intern"; lang: "de" | "nl"; color: string; active: boolean };

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}

export async function login(username: string, password: string): Promise<boolean> {
  const u = await q1<{ id: string; password_hash: string }>("select id, password_hash from users where lower(username) = lower($1) and active", [username.trim()]);
  if (!u || !(await bcrypt.compare(password, u.password_hash))) {
    await new Promise((r) => setTimeout(r, 1200)); // raden vertragen
    return false;
  }
  const token = randomBytes(32).toString("hex");
  await q("insert into sessions (token, user_id, expires_at) values ($1, $2, now() + interval '60 days')", [token, u.id]);
  await q("delete from sessions where expires_at < now()");
  cookies().set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 60 });
  return true;
}

export async function logout() {
  const token = cookies().get(COOKIE)?.value;
  if (token) await q("delete from sessions where token = $1", [token]).catch(() => undefined);
  cookies().delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    return await q1<User>(
      `select u.id, u.username, u.name, u.role, u.lang, u.color, u.active
         from sessions s join users u on u.id = s.user_id
        where s.token = $1 and s.expires_at > now() and u.active`,
      [token],
    );
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<User> {
  const u = await currentUser();
  if (!u) redirect("/login");
  return u;
}

export async function requireAdmin(): Promise<User> {
  const u = await requireUser();
  if (u.role !== "admin") redirect("/app");
  return u;
}
