"use client";
import { useEffect, useState } from "react";

/** Fotogalerie für Wissensseiten: Klick öffnet das Bild groß auf derselben Seite (kein neuer Tab). */
export function Gallery({ images }: { images: { alt: string; src: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const n = images.length;

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % n));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + n) % n));
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, n]);

  const cur = open === null ? null : images[open];
  return (
    <>
      <div className={`my-4 grid gap-3 ${n === 1 ? "grid-cols-1 sm:max-w-sm" : n === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"}`}>
        {images.map((im, i) => (
          <figure key={i} className="overflow-hidden rounded-xl bg-white ring-1 ring-sand-200">
            <button type="button" onClick={() => setOpen(i)} className="block aspect-square w-full cursor-zoom-in bg-white" aria-label={im.alt || "Bild vergrößern"}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.src} alt={im.alt} loading="lazy" className="h-full w-full object-contain p-1.5" />
            </button>
            {im.alt && <figcaption className="border-t border-sand-100 px-2.5 py-2 text-xs font-medium leading-snug text-stone-700">{im.alt}</figcaption>}
          </figure>
        ))}
      </div>

      {cur && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-sm" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <div className="flex items-center justify-between px-4 py-3 text-sm text-white/80">
            <span>{open! + 1} / {n}</span>
            <button type="button" onClick={() => setOpen(null)} className="rounded-full bg-white/10 px-3 py-1.5 text-white hover:bg-white/20" aria-label="Schließen">✕</button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cur.src} alt={cur.alt} className="max-h-full max-w-full rounded-lg bg-white object-contain" />
            {n > 1 && (
              <>
                <button type="button" onClick={() => setOpen((open! - 1 + n) % n)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-lg text-ink shadow hover:bg-white" aria-label="Vorheriges Bild">‹</button>
                <button type="button" onClick={() => setOpen((open! + 1) % n)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-lg text-ink shadow hover:bg-white" aria-label="Nächstes Bild">›</button>
              </>
            )}
          </div>
          {cur.alt && <p className="px-4 py-4 text-center text-sm text-white" onClick={(e) => e.stopPropagation()}>{cur.alt}</p>}
        </div>
      )}
    </>
  );
}
