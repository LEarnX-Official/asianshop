"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { money, priceOf } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useMarket, useT } from "../global/market-context";
import { FreshnessBadge, StockBadge } from "./badges";
import { Price } from "./price";
import { AddToBasket } from "./add-to-basket";

/** The buy box (Script S7.2 items 4–8) plus the mobile sticky add bar. */
export function ProductBuy({ product }: { product: Product }) {
  const m = useMarket();
  const t = useT();
  const anchor = useRef<HTMLDivElement>(null);
  const [sticky, setSticky] = useState(false);
  useEffect(() => {
    const el = anchor.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSticky(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <FreshnessBadge product={product} explain />
        <StockBadge product={product} />
      </div>
      <div className="mt-5">
        <Price product={product} size="lg" />
        <p className="mt-1 text-xs text-ink-muted">{t.vatIncluded}</p>
      </div>
      <div ref={anchor} className="mt-6 max-w-sm">
        <AddToBasket product={product} size="lg" />
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm text-ink-soft">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 text-cardamom" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" strokeLinejoin="round" />
          <circle cx="7" cy="17.5" r="1.6" />
          <circle cx="17" cy="17.5" r="1.6" />
        </svg>
        {t.deliveryLine(m.deliveryDays, m.countryName[m.lang])}
      </p>
      <AnimatePresence>
        {sticky ? (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-linen/95 px-4 py-3 backdrop-blur lg:hidden"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{product.title[m.lang]}</p>
              <p className="tabular font-semibold">{money(priceOf(product, m), m)}</p>
            </div>
            <div className="w-40">
              <AddToBasket product={product} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
