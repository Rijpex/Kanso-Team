import React from "react";
import { slugify } from "@/lib/kb";

function inline(text: string, key: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\[\[[^\]]+\]\]|https?:\/\/[^\s)]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) out.push(<strong key={`${key}-${i++}`}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("[[")) out.push(<span key={`${key}-${i++}`} className="todo">{tok.slice(2, -2)}</span>);
    else out.push(<a key={`${key}-${i++}`} href={tok} target="_blank" rel="noreferrer">{tok}</a>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Eenvoudige opmaak: #/##/### kopje, - lijst, 1. lijst, | tabel |, ![bild](url), **vet**, [[nog invullen]], links. */
export function Markdown({ text }: { text: string }) {
  const lines = (text || "").split("\n");
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let table: string[][] | null = null;
  let gallery: { alt: string; src: string }[] | null = null;
  const seen = new Map<string, number>();
  const flushGallery = () => {
    if (!gallery) return;
    const g = gallery;
    blocks.push(
      <div key={blocks.length} className={`not-prose my-4 grid gap-3 ${g.length === 1 ? "grid-cols-1 sm:max-w-sm" : g.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"}`}>
        {g.map((im, i) => (
          <figure key={i} className="overflow-hidden rounded-xl bg-white ring-1 ring-sand-200">
            <a href={im.src} target="_blank" rel="noreferrer" className="block aspect-square bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.src} alt={im.alt} loading="lazy" className="h-full w-full object-contain p-1.5" />
            </a>
            {im.alt && <figcaption className="border-t border-sand-100 px-2.5 py-2 text-xs font-medium leading-snug text-stone-700">{im.alt}</figcaption>}
          </figure>
        ))}
      </div>,
    );
    gallery = null;
  };
  const flushTable = () => {
    if (!table) return;
    const [head, ...rows] = table;
    blocks.push(
      <div key={blocks.length} className="my-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr>{head.map((c, i) => <th key={i} className="border-b border-sand-300 px-2 py-1 text-left font-semibold">{inline(c, `th${blocks.length}-${i}`)}</th>)}</tr></thead>
          <tbody>{rows.map((r, ri) => <tr key={ri} className="border-b border-sand-200 last:border-0">{r.map((c, i) => <td key={i} className="px-2 py-1 align-top">{inline(c, `td${blocks.length}-${ri}-${i}`)}</td>)}</tr>)}</tbody>
        </table>
      </div>,
    );
    table = null;
  };
  const flush = () => {
    flushTable();
    flushGallery();
    if (!list) return;
    const items = list.items.map((it, i) => <li key={i}>{inline(it, `li${blocks.length}-${i}`)}</li>);
    blocks.push(list.ordered ? <ol key={blocks.length}>{items}</ol> : <ul key={blocks.length}>{items}</ul>);
    list = null;
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    const ul = /^[-•]\s+(.*)$/.exec(line);
    const ol = /^\d+[.)]\s+(.*)$/.exec(line);
    // Bild: ![Beschriftung](https://…) – mehrere Zeilen hintereinander werden eine Galerie
    const img = /^!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)$/.exec(line.trim());
    if (img) {
      if (list || table) flush();
      if (!gallery) gallery = [];
      gallery.push({ alt: img[1], src: img[2] });
      continue;
    }
    if (!line.trim() && gallery) continue;
    if (gallery) flushGallery();
    // Tabel: | a | b | – de Trennzeile |---|---| wird übersprungen
    if (/^\|.*\|$/.test(line.trim())) {
      if (list) flush();
      const cells = line.trim().slice(1, -1).split("|").map((c) => c.trim());
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
      if (!table) table = [];
      table.push(cells);
      continue;
    }
    if (ul || ol) {
      const ordered = !!ol;
      if (!list || list.ordered !== ordered) { flush(); list = { ordered, items: [] }; }
      list.items.push((ul || ol)![1]);
      continue;
    }
    flush();
    if (!line.trim()) continue;
    if (line.startsWith("### ")) blocks.push(<h3 key={blocks.length}>{inline(line.slice(4), `h3${blocks.length}`)}</h3>);
    else if (/^#{1,2}\s/.test(line)) {
      const title = line.replace(/^#{1,2}\s+/, "");
      let id = slugify(title.replace(/\*\*/g, "").trim());
      const n = seen.get(id) || 0; seen.set(id, n + 1); if (n) id = `${id}-${n + 1}`;
      blocks.push(<h2 key={blocks.length} id={id} className="scroll-mt-24">{inline(title, `h2${blocks.length}`)}</h2>);
    }
    else blocks.push(<p key={blocks.length}>{inline(line, `p${blocks.length}`)}</p>);
  }
  flush();
  return <div className="prose-hub text-[15px]">{blocks}</div>;
}
