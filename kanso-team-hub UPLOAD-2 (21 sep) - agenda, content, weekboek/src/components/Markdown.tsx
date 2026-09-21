import React from "react";

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

/** Eenvoudige opmaak: ### kopje, - lijst, 1. lijst, **vet**, [[nog invullen]], links. */
export function Markdown({ text }: { text: string }) {
  const lines = (text || "").split("\n");
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flush = () => {
    if (!list) return;
    const items = list.items.map((it, i) => <li key={i}>{inline(it, `li${blocks.length}-${i}`)}</li>);
    blocks.push(list.ordered ? <ol key={blocks.length}>{items}</ol> : <ul key={blocks.length}>{items}</ul>);
    list = null;
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    const ul = /^[-•]\s+(.*)$/.exec(line);
    const ol = /^\d+[.)]\s+(.*)$/.exec(line);
    if (ul || ol) {
      const ordered = !!ol;
      if (!list || list.ordered !== ordered) { flush(); list = { ordered, items: [] }; }
      list.items.push((ul || ol)![1]);
      continue;
    }
    flush();
    if (!line.trim()) continue;
    if (line.startsWith("### ")) blocks.push(<h3 key={blocks.length}>{line.slice(4)}</h3>);
    else blocks.push(<p key={blocks.length}>{inline(line, `p${blocks.length}`)}</p>);
  }
  flush();
  return <div className="prose-hub text-[15px]">{blocks}</div>;
}
