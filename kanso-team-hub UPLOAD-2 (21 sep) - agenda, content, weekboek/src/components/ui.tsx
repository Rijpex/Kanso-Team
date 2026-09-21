import Link from "next/link";
import type { Lang } from "@/lib/i18n";

export function Avatar({ name, color, size = "h-7 w-7 text-xs" }: { name: string; color?: string | null; size?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${size}`} style={{ background: color || "#7a6a4f" }} title={name}>
      {(name || "?").slice(0, 1).toUpperCase()}
    </span>
  );
}

export function Badge({ l, lang }: { l?: { de: string; nl: string; color?: string }; lang: Lang }) {
  if (!l) return null;
  return <span className={`badge ${l.color || "bg-stone-100 text-stone-700"}`}>{lang === "nl" ? l.nl : l.de}</span>;
}

export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1>{title}</h1>
        {sub && <p className="muted mt-0.5">{sub}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mb-3 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-ink">
      ← {label}
    </Link>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-sand-300 p-8 text-center text-sm text-stone-500">{children}</div>;
}
