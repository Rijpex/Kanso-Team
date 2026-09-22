"use client";
import { useState } from "react";
import { calc, eur } from "@/lib/ideas";

const n = (v: string) => { const x = Number(String(v).replace(",", ".")); return isFinite(x) ? x : 0; };

/** Invoervelden met live berekening: inkoop + bijkomende kosten → marge, factor, investering, break-even. */
export function MarginFields({ lang, ek, vk, vat, extra, moq, online }: { lang: "de" | "nl"; ek?: number | null; vk?: number | null; vat?: number | null; extra?: number | null; moq?: number | null; online?: number | null }) {
  const init = (v?: number | null) => (v != null ? String(v) : "");
  const [e, setE] = useState(init(ek));
  const [x, setX] = useState(init(extra));
  const [v, setV] = useState(init(vk));
  const [t, setT] = useState(String(vat ?? 19));
  const [m, setM] = useState(init(moq));
  const [o, setO] = useState(init(online));
  const r = calc(n(e), n(v), n(t), n(x), n(m));
  const de = lang === "de";
  return (
    <div className="space-y-2 rounded-xl bg-sand-100 p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">{de ? "Kalkulation" : "Calculatie"}</div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="label">{de ? "Einkauf pro Stück (netto €)" : "Inkoop per stuk (netto €)"}</label><input name="ek" inputMode="decimal" className="input" value={e} onChange={(z) => setE(z.target.value)} /></div>
        <div><label className="label">{de ? "+ Versand, Zoll, Verpackung pro Stück" : "+ verzending, invoer, verpakking per stuk"}</label><input name="extra_cost" inputMode="decimal" className="input" value={x} onChange={(z) => setX(z.target.value)} /></div>
        <div><label className="label">{de ? "Verkaufspreis im Laden (brutto €)" : "Verkoopprijs winkel (bruto €)"}</label><input name="vk" inputMode="decimal" className="input" value={v} onChange={(z) => setV(z.target.value)} /></div>
        <div><label className="label">{de ? "MwSt" : "Btw"}</label><select name="vat" className="input" value={t} onChange={(z) => setT(z.target.value)}><option value="19">19 %</option><option value="7">{de ? "7 % (Lebensmittel)" : "7 % (levensmiddelen)"}</option></select></div>
        <div><label className="label">{de ? "Mindestbestellmenge (Stück)" : "Minimale afname (stuks)"}</label><input name="moq" inputMode="numeric" className="input" value={m} onChange={(z) => setM(z.target.value)} /></div>
        <div><label className="label">{de ? "Günstigster Preis online (€)" : "Laagste prijs online (€)"}</label><input name="online_price" inputMode="decimal" className="input" value={o} onChange={(z) => setO(z.target.value)} /></div>
      </div>
      <div className={`rounded-lg p-3 text-sm ${!r ? "bg-white text-stone-400" : r.margin > 0 ? "bg-white text-ink" : "bg-red-50 text-red-800"}`}>
        {!r ? (de ? "Einkauf und Verkaufspreis eintragen – der Rest rechnet sich von selbst." : "Vul inkoop en verkoopprijs in – de rest rekent zichzelf uit.") : (
          <ul className="space-y-0.5">
            <li>{de ? "Einstandspreis" : "Kostprijs"}: <b>{eur(r.landed)}</b> · {de ? "VK netto" : "VK netto"}: <b>{eur(r.net)}</b></li>
            <li>{de ? "Marge pro Stück" : "Marge per stuk"}: <b>{eur(r.margin)}</b> = <b>{r.pct.toFixed(0)} %</b> · {de ? "Faktor" : "factor"} <b>{r.factor.toFixed(1)}</b></li>
            {r.invest != null && <li>{de ? "Erste Bestellung kostet" : "Eerste bestelling kost"}: <b>{eur(r.invest)}</b> → {de ? "nach" : "na"} <b>{r.breakEven}</b> {de ? "verkauften Stück ist das Geld wieder drin" : "verkochte stuks is het geld terug"}</li>}
            {r.profitAll != null && <li>{de ? "Wenn alles verkauft ist, bleiben" : "Als alles verkocht is, blijft er"}: <b>{eur(r.profitAll)}</b></li>}
            {n(o) > 0 && n(v) > n(o) && <li className="text-amber-700">{de ? `Online gibt es das für ${eur(n(o))} – warum sollte jemand bei uns mehr bezahlen?` : `Online is het te koop voor ${eur(n(o))} – waarom zou iemand bij ons meer betalen?`}</li>}
          </ul>
        )}
      </div>
    </div>
  );
}
