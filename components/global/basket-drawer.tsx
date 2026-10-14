"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { money, priceOf } from "@/lib/format";
import { basketCount, basketTotal, useBasket } from "@/lib/basket";
import { useMarket, useT } from "./market-context";
import { FreeDeliveryBar } from "./free-delivery-bar";
import { PackImage } from "../product/pack-image";
import { FreshnessBadge } from "../product/badges";
import { productHref } from "../product/product-card";

/** A10 BasketDrawer — over-the-shoulder: the shop stays visible behind it (Script S9). */
export function BasketDrawer() {
  const m = useMarket();
  const t = useT();
  const open = useBasket((s) => s.drawerOpen);
  const openDrawer = useBasket((s) => s.openDrawer);
  const lines = useBasket((s) => s.lines);
  const order = useBasket((s) => s.order);
  const setQty = useBasket((s) => s.setQty);
  const restore = useBasket((s) => s.restore);
  const pushToast = useBasket((s) => s.pushToast);
  const title = useRef<HTMLHeadingElement>(null);
  const count = basketCount(lines);
  const total = basketTotal(lines, m.currency);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = setTimeout(() => title.current?.focus(), 250);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && openDrawer(false);
    window.addEventListener("keydown", esc);
    return () => {
      clearTimeout(id);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", esc);
    };
  }, [open, openDrawer]);

  const removeLine = (id: number) => {
    const index = order.indexOf(id);
    const line = lines[id];
    setQty(id, 0);
    pushToast({ kind: "removed", text: `${t.removed}: ${line.product.title[m.lang]}`, undo: () => restore(line, index) });
  };

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={t.yourBasket(count)}>
          <motion.div className="absolute inset-0 bg-ink/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={() => openDrawer(false)} />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-linen shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 ref={title} tabIndex={-1} className="font-serif text-2xl outline-none">
                {t.yourBasket(count)}
              </h2>
              <button type="button" onClick={() => openDrawer(false)} className="rounded-full px-3 py-2 text-sm hover:bg-stone">
                {t.close}
              </button>
            </div>
            {count ? (
              <>
                <div className="border-b border-line px-5 py-4">
                  <FreeDeliveryBar />
                </div>
                <ul className="flex-1 overflow-y-auto px-3 py-2">
                  <AnimatePresence initial={false}>
                    {order.map((id) => {
                      const line = lines[id];
                      if (!line) return null;
                      const p = line.product;
                      return (
                        <motion.li
                          key={id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="flex gap-3 overflow-hidden rounded-xl px-2 py-3"
                        >
                          <Link href={productHref(m.code, p)} onClick={() => openDrawer(false)} className="shrink-0">
                            <PackImage src={p.image} alt="" brand={p.brand} className="h-20 w-20 rounded-lg" sizes="80px" />
                          </Link>
                          <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-saffron-text">{p.brand}</p>
                            <p className="truncate text-[15px] leading-snug">{p.title[m.lang]}</p>
                            <p className="text-xs text-ink-muted">{p.size}</p>
                            <FreshnessBadge product={p} />
                            <div className="mt-1 flex items-center justify-between">
                              <div className="flex h-9 items-center rounded-full border border-line bg-warm">
                                <button type="button" aria-label={t.decrease} onClick={() => (line.qty <= 1 ? removeLine(id) : setQty(id, line.qty - 1))} className="grid h-9 w-9 place-items-center text-lg">
                                  −
                                </button>
                                <span className="tabular w-6 text-center text-sm font-semibold">{line.qty}</span>
                                <button type="button" aria-label={t.increase} onClick={() => setQty(id, line.qty + 1)} className="grid h-9 w-9 place-items-center text-lg">
                                  +
                                </button>
                              </div>
                              <span className="tabular font-semibold">{money(priceOf(p, m) * line.qty, m)}</span>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
                <div className="border-t border-line bg-warm px-5 py-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-ink-soft">{t.subtotal}</span>
                    <span className="tabular text-xl font-semibold">{money(total, m)}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-muted">{t.vatIncluded}</p>
                  <Link
                    href={`/${m.code}/checkout`}
                    onClick={() => openDrawer(false)}
                    className="mt-4 flex h-14 items-center justify-center rounded-full bg-saffron text-base font-semibold text-white hover:bg-saffron-deep"
                  >
                    {t.checkout}
                  </Link>
                  <button type="button" onClick={() => openDrawer(false)} className="mt-2 w-full py-2 text-sm font-medium text-ink-soft hover:text-ink">
                    {t.keepShopping}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <svg aria-hidden="true" viewBox="0 0 120 80" className="h-20 w-32 text-line">
                  <rect x="6" y="58" width="108" height="8" rx="3" fill="currentColor" />
                  <rect x="22" y="28" width="22" height="30" rx="4" fill="#efe3d1" />
                  <rect x="76" y="34" width="20" height="24" rx="4" fill="#efe3d1" />
                </svg>
                <p className="mt-4 font-serif text-xl">{t.emptyBasket}</p>
                <button type="button" onClick={() => openDrawer(false)} className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-linen">
                  {t.keepShopping}
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
