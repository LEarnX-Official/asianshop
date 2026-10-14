"use client";

import { useState } from "react";
import { freshness, shortDate } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useMarket, useT } from "../global/market-context";

/** B4 FreshnessBadge (signature feature: "Freshness you can see"). */
export function FreshnessBadge({ product, explain = false }: { product: Product; explain?: boolean }) {
  const m = useMarket();
  const t = useT();
  const [open, setOpen] = useState(false);
  const state = freshness(product.bestBefore);
  if (state === "hidden") return null;
  const date = shortDate(product.bestBefore, m);
  const tone = state === "fresh" ? "text-cardamom bg-cardamom/8 border-cardamom/20" : "text-saffron-deep bg-turmeric/15 border-turmeric/40";
  const label = (
    <>
      <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="2" y="3" width="12" height="11" rx="2" />
        <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" strokeLinecap="round" />
      </svg>
      <span>
        {explain ? t.bestBefore : t.bestBeforeShort} {date}
      </span>
    </>
  );
  if (!explain) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-5 ${tone}`}>
        {label}
      </span>
    );
  }
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${tone}`}
      >
        {label}
        <span aria-hidden="true" className="text-xs opacity-70">ⓘ</span>
      </button>
      {state === "short" ? <span className="ml-2 text-sm text-saffron-deep">{t.shortDateBadge}</span> : null}
      {open ? (
        <div role="dialog" aria-label={t.freshnessTitle} className="toast-in absolute left-0 top-full z-30 mt-2 w-80 rounded-2xl border border-line bg-warm p-5 shadow-lift">
          <p className="font-serif text-lg">{t.freshnessTitle}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t.freshnessBody(date)}</p>
          <p className="mt-3 text-xs text-ink-muted">{t.demoDate}</p>
          <button type="button" onClick={() => setOpen(false)} className="mt-3 text-sm font-medium text-saffron-text underline-offset-4 hover:underline">
            {t.close}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** B5 StockBadge: always words, never colour alone. */
export function StockBadge({ product }: { product: Product }) {
  const t = useT();
  if (product.stock === "in") return <span className="text-sm text-cardamom">● {t.stockIn}</span>;
  if (product.stock === "low") return <span className="text-sm text-saffron-deep">● {t.stockLow}</span>;
  return <span className="text-sm text-ink-muted">○ {t.stockOut}</span>;
}
