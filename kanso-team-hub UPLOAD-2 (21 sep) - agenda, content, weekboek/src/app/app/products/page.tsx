import { requireUser } from "@/lib/server/auth";
import { T } from "@/lib/i18n";
import { Empty, PageHeader } from "@/components/ui";

type Product = { id: number; name: string; permalink: string; short_description: string; is_in_stock: boolean; on_sale: boolean; prices: { price: string; regular_price: string; currency_minor_unit: number }; images: { thumbnail?: string; src: string }[]; categories: { id: number; name: string }[] };
type Cat = { id: number; name: string; count: number; parent: number };

const SHOP = (process.env.SHOP_URL || "https://kanso-outdoor.com").replace(/\/$/, "");
const strip = (h: string) => h.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#8211;/g, "–").replace(/&#038;/g, "&").replace(/\s+/g, " ").trim();
const price = (p: Product["prices"]) => (Number(p.price) / 10 ** (p.currency_minor_unit ?? 2)).toLocaleString("de-DE", { style: "currency", currency: "EUR" });

async function api<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${SHOP}/wp-json/wc/store/v1/${path}`, { next: { revalidate: 900 }, headers: { accept: "application/json", "user-agent": "KansoTeamHub/1.0" } });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

export default async function Products({ searchParams }: { searchParams: { q?: string; cat?: string; page?: string } }) {
  const user = await requireUser();
  const tr = T(user.lang);
  const page = Math.max(1, Number(searchParams.page) || 1);
  const params = new URLSearchParams({ per_page: "48", page: String(page), orderby: "title", order: "asc" });
  if (searchParams.q) params.set("search", searchParams.q);
  if (searchParams.cat) params.set("category", searchParams.cat);
  const [products, cats] = await Promise.all([api<Product[]>(`products?${params}`), api<Cat[]>("products/categories?per_page=100")]);
  const link = (o: Record<string, string>) => {
    const p = new URLSearchParams({ ...(searchParams.q ? { q: searchParams.q } : {}), ...(searchParams.cat ? { cat: searchParams.cat } : {}), ...o });
    [...p.entries()].forEach(([k, v]) => !v && p.delete(k));
    return `/app/products?${p}`;
  };
  return (
    <div>
      <PageHeader title={tr("Produkte", "Producten")} sub={tr("Live aus dem Webshop: Namen, Preise, Verfügbarkeit. Zum Nachschauen, wenn eine Kundin fragt.", "Live uit de webshop: namen, prijzen, beschikbaarheid. Om op te zoeken als een klant iets vraagt.")} />
      <form className="mb-3 flex gap-2" action="/app/products">
        {searchParams.cat && <input type="hidden" name="cat" value={searchParams.cat} />}
        <input name="q" className="input" placeholder={tr("Produkt suchen …", "Product zoeken …")} defaultValue={searchParams.q || ""} />
        <button className="btn-primary">{tr("Suchen", "Zoeken")}</button>
      </form>
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        <a href={link({ cat: "", page: "" })} className={`badge shrink-0 !px-2.5 !py-1 ${!searchParams.cat ? "bg-ink text-white" : "bg-white ring-1 ring-sand-300"}`}>{tr("Alle", "Alle")}</a>
        {(cats || []).filter((c) => c.count > 0 && c.name !== "Uncategorized").map((c) => (
          <a key={c.id} href={link({ cat: String(c.id), page: "" })} className={`badge shrink-0 !px-2.5 !py-1 ${searchParams.cat === String(c.id) ? "bg-ink text-white" : "bg-white ring-1 ring-sand-300"}`}>{strip(c.name)} · {c.count}</a>
        ))}
      </div>
      {products === null && <Empty>{tr("Der Webshop ist gerade nicht erreichbar. Versuch es gleich noch einmal.", "De webshop is nu niet bereikbaar. Probeer het zo nog eens.")}</Empty>}
      {products && !products.length && <Empty>{tr("Nichts gefunden.", "Niets gevonden.")}</Empty>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {(products || []).map((p) => (
          <a key={p.id} href={p.permalink} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl bg-white ring-1 ring-sand-200 hover:ring-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {p.images[0] ? <img src={p.images[0].thumbnail || p.images[0].src} alt="" loading="lazy" className="aspect-square w-full object-cover" /> : <div className="aspect-square bg-sand-100" />}
            <div className="p-2.5">
              <div className="line-clamp-2 text-sm font-medium leading-snug">{strip(p.name)}</div>
              <div className="mt-1 flex items-center justify-between text-sm"><span className="font-semibold">{price(p.prices)}</span>{!p.is_in_stock && <span className="badge bg-red-100 text-red-700">{tr("ausverkauft", "uitverkocht")}</span>}</div>
              {p.short_description && <div className="mt-1 line-clamp-3 text-xs text-stone-500">{strip(p.short_description)}</div>}
            </div>
          </a>
        ))}
      </div>
      <div className="mt-5 flex justify-center gap-2">
        {page > 1 && <a className="btn-ghost" href={link({ page: String(page - 1) })}>←</a>}
        {products && products.length === 48 && <a className="btn-ghost" href={link({ page: String(page + 1) })}>{tr("Weitere", "Meer")} →</a>}
      </div>
    </div>
  );
}
