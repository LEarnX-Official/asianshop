"use client";

import { money, priceOf, promoOf, unitPriceOf } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useMarket, useT } from "../global/market-context";

/**
 * B3 Price. Gross price, unit price per kg/l. On promotion: the discount is compared with the
 * lowest price of the last 30 days (Omnibus), never with a "price in other shops".
 */
export function Price({ product, size = "md" }: { product: Product; size?: "md" | "lg" }) {
  const m = useMarket();
  const t = useT();
  const price = priceOf(product, m);
  const unit = unitPriceOf(product, m);
  const promo = promoOf(product, m);
  const pct = promo?.lowest30 && promo.lowest30 > price ? Math.round((1 - price / promo.lowest30) * 100) : null;
  const big = size === "lg";
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-baseline gap-2">
        <span className={`tabular font-semibold ${big ? "text-2xl" : "text-lg"} ${promo ? "text-chilli" : "text-ink"}`}>{money(price, m)}</span>
        {pct ? <span className="rounded-full bg-chilli/10 px-2 py-0.5 text-xs font-semibold text-chilli">−{pct}%</span> : null}
      </div>
      {unit ? (
        <span className="tabular text-xs text-ink-muted">
          {money(unit.value, m)}
          {unit.per === "kg" ? t.perKg : t.perL}
        </span>
      ) : null}
      {promo?.lowest30 && big ? (
        <span className="tabular text-xs text-ink-muted">
          {t.lowest30}: {money(promo.lowest30, m)}
          {promo.until ? ` · ${promo.until}` : ""}
        </span>
      ) : null}
    </div>
  );
}
