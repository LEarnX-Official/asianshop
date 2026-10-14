"use client";

import { useState } from "react";
import { money } from "@/lib/format";
import { search, type IndexedProduct } from "@/lib/search";
import { useBasket } from "@/lib/basket";
import { useMarket, useT } from "../global/market-context";
import { PackImage } from "../product/pack-image";

type Row = { query: string; qty: number; product: IndexedProduct | null };

const EU_VAT = /^(AT|BE|BG|CY|CZ|DE|DK|EE|EL|ES|FI|FR|HR|HU|IE|IT|LT|LU|LV|MT|NL|PL|PT|RO|SE|SI|SK)[0-9A-Z]{8,12}$/;
const EXAMPLE = "TRS turmeric 1 kg x 10\nIndia Gate basmati 5 kg x 4\nghee 1 kg x 6\nMDH garam masala x 12";

/** H2 TradeQuickOrder + H3 net prices: one product per line, matched with the same home-word search. */
export function QuickOrder() {
  const m = useMarket();
  const t = useT();
  const add = useBasket((s) => s.add);
  const pushToast = useBasket((s) => s.pushToast);
  const [text, setText] = useState(EXAMPLE);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [vat, setVat] = useState("");
  const [vatState, setVatState] = useState<"idle" | "ok" | "bad">("idle");

  const find = async () => {
    setBusy(true);
    const parsed = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const mm = l.match(/^(.*?)(?:\s*[x×*]\s*|\s+)(\d+)\s*$/i);
        return mm ? { query: mm[1].trim(), qty: Math.max(1, Number(mm[2])) } : { query: l, qty: 1 };
      });
    const found = await Promise.all(parsed.map(async (r) => ({ ...r, product: (await search(r.query, 1)).products[0] ?? null })));
    setRows(found);
    setBusy(false);
  };

  const net = (p: IndexedProduct) => {
    const n = (p as IndexedProduct & { net?: { pln: number; eur: number } | null }).net;
    const gross = m.currency === "PLN" ? p.price.pln : p.price.eur;
    return n ? (m.currency === "PLN" ? n.pln : n.eur) : gross;
  };
  const totalNet = rows.reduce((s, r) => s + (r.product ? net(r.product) * r.qty : 0), 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
      <div>
        <h2 className="font-serif text-3xl">{t.quickOrder}</h2>
        <p className="mt-2 text-sm text-ink-soft">{t.quickOrderHint}</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          aria-label={t.quickOrder}
          className="mt-4 w-full rounded-2xl border border-line bg-warm p-4 font-mono text-sm leading-7 outline-none focus:border-ink"
        />
        <button type="button" onClick={find} disabled={busy} className="mt-3 h-12 rounded-full bg-ink px-6 text-sm font-semibold text-linen disabled:opacity-60">
          {t.findProducts}
        </button>

        <div className="mt-10 rounded-2xl border border-line bg-warm p-5">
          <label htmlFor="vat" className="text-sm font-semibold">
            {t.vatNumber}
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="vat"
              value={vat}
              onChange={(e) => (setVat(e.target.value), setVatState("idle"))}
              placeholder="PL1234567890"
              className="h-11 min-w-0 flex-1 rounded-full border border-line bg-linen px-4 uppercase"
            />
            <button type="button" onClick={() => setVatState(EU_VAT.test(vat.replace(/[\s.-]/g, "").toUpperCase()) ? "ok" : "bad")} className="h-11 rounded-full border border-ink px-5 text-sm font-semibold">
              {t.checkVat}
            </button>
          </div>
          {vatState === "ok" ? <p className="mt-2 text-sm text-cardamom">✓ {t.vatValid}</p> : null}
          {vatState === "bad" ? <p className="mt-2 text-sm text-chilli">⚠ {t.vatInvalid}</p> : null}
        </div>
      </div>

      <div>
        {rows.length ? (
          <>
            <p className="mb-3 text-sm font-medium text-ink-muted">{t.netPrices}</p>
            <ul className="divide-y divide-line rounded-2xl border border-line bg-warm">
              {rows.map((r, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-3">
                  {r.product ? (
                    <>
                      <PackImage src={r.product.image} alt="" brand={r.product.brand} className="h-12 w-12 shrink-0 rounded-lg" sizes="48px" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">
                          <span className="font-semibold">{r.product.brand}</span> {r.product.title[m.lang]} · {r.product.size}
                        </p>
                        <p className="truncate text-xs text-ink-muted">“{r.query}”</p>
                      </div>
                      <input
                        type="number"
                        min={1}
                        value={r.qty}
                        aria-label={t.quantity}
                        onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, qty: Math.max(1, Number(e.target.value) || 1) } : x)))}
                        className="tabular h-10 w-16 rounded-lg border border-line bg-linen px-2 text-center"
                      />
                      <span className="tabular w-24 text-right text-sm font-semibold">{money(net(r.product) * r.qty, m)}</span>
                    </>
                  ) : (
                    <p className="text-sm text-ink-muted">
                      “{r.query}” · {t.noMatch}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between">
              <p className="tabular text-lg font-semibold">
                {money(totalNet, m)} <span className="text-sm font-normal text-ink-muted">netto</span>
              </p>
              <button
                type="button"
                onClick={() => {
                  rows.forEach((r) => r.product && add(r.product, r.qty));
                  pushToast({ kind: "bulk", text: t.bulkAdded(rows.filter((r) => r.product).length) });
                }}
                className="h-12 rounded-full bg-saffron px-6 text-sm font-semibold text-white hover:bg-saffron-deep"
              >
                {t.addLines}
              </button>
            </div>
          </>
        ) : (
          <div className="grid h-full min-h-60 place-items-center rounded-2xl border-2 border-dashed border-line p-8 text-center text-sm text-ink-muted">{t.quickOrderHint}</div>
        )}
      </div>
    </div>
  );
}
