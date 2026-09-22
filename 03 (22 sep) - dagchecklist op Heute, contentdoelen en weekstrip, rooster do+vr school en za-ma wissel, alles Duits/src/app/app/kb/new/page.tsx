import { requireAdmin } from "@/lib/server/auth";
import { BackLink } from "@/components/ui";
import { KbForm } from "@/components/KbForm";

export default async function NewKb() {
  const me = await requireAdmin();
  return (<div><BackLink href="/app/kb" label={me.lang === "nl" ? "Kennis" : "Wissen"} /><h1 className="mb-4">{me.lang === "nl" ? "Nieuwe pagina" : "Neue Seite"}</h1><KbForm lang={me.lang} /></div>);
}
