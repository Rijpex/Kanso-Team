import { redirect } from "next/navigation";
import { installState } from "@/lib/server/setup";
import { currentUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const state = await installState();
  if (state !== "ready") redirect("/setup");
  redirect((await currentUser()) ? "/app" : "/login");
}
