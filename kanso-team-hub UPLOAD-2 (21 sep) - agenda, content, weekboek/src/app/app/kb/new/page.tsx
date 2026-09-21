import { requireAdmin } from "@/lib/server/auth";
import { BackLink } from "@/components/ui";
import { KbForm } from "@/components/KbForm";

export default async function NewKb() {
  await requireAdmin();
  return (<div><BackLink href="/app/kb" label="Kennis" /><h1 className="mb-4">Nieuwe pagina</h1><KbForm /></div>);
}
