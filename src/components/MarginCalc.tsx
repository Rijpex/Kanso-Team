"use client";
import { useState } from "react";

const n = (v: string) => { const x = Number(String(v).replace(",", ".")); return isFinite(x) ? x : 0; };
const eur = (x: number) => x.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

export function margin(ek: number | null, vk: number | null, vat: number) {
  if (!ek || !vk) return null;
  const net = vk / (1 + vat / 100);
  const m = net - ek;
  return { net, m, pct: (m / net) * 100, factor: vk / ek };
}

/** Invoervelden met live marge-berekening. */
export function MarginFields({ lang, ek, vk, vat }: { lang: "de" | "nl"; ek?: number | null; vk?: number | null; vat?: number | null }) {
  const [e, setE] = useState(ek != null ? String(ek) : "");
  const [v, setV] = useState(vk != null ? String(vk) : "");
  const [t, setT] = useState(String(vat ?? 19));
  const r = margin(n(e), n(v), n(t));
  const L = lang === "nl"
    ? { ek: "Inkoop per stuk (netto €)", vk: "Verkoopprijs winkel (bruto €)", vat: "Btw", net: "VK netto", m: "Marge", f: "Factor", food: "7 % (levensmiddelen)" }
    : { ek: "Einkauf pro Stück (netto €)", vk: "Verkaufspreis Laden (brutto €)", vat: "MwSt", net: "VK netto", m: "Marge", f: "Faktor", food: "7 % (Lebensmittel)" };
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <div><label className="label">{L.ek}</label><input name="ek" inputMode="decimal" className="input" value={e} onChange={(x) => setE(x.target.value)} /></div>
        <div><label className="label">{L.vk}</label><input name="vk" inputMode="decimal" className="input" value={v} onChange={(x) => setV(x.target.value)} /></div>
        <div><label className="label">{L.vat}</label><select name="vat" className="input" value={t} onChange={(x) => setT(x.target.value)}><option value="19">19 %</option><option value="7">{L.food}</option></select></div>
      </div>
      <div className={`rounded-lg p-3 text-sm ${!r ? "bg-sand-100 text-stone-400" : r.m > 0 ? "bg-brand-light text-ink" : "bg-red-50 text-red-800"}`}>
        {r ? <>{L.net}: <b>{eur(r.net)}</b> · {L.m}: <b>{eur(r.m)}</b> = <b>{r.pct.toFixed(0)} %</b> · {L.f} <b>{r.factor.toFixed(1)}</b></> : "EK + VK → Marge"}
      </div>
    </div>
  );
}
