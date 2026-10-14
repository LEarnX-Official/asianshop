"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useBasket } from "@/lib/basket";
import { flyToBasket } from "@/lib/fly";
import { useOrders } from "@/lib/orders";
import type { Product } from "@/lib/types";
import { useMarket, useT } from "../global/market-context";

/** B6 AddToBasket / QuantityStepper with the spice dot (Script S8). */
export function AddToBasket({ product, size = "sm", label }: { product: Product; size?: "sm" | "lg"; label?: string }) {
  const t = useT();
  const m = useMarket();
  const qty = useBasket((s) => s.lines[product.id]?.qty ?? 0);
  const hydrated = useBasket((s) => s.hydrated);
  const add = useBasket((s) => s.add);
  const setQty = useBasket((s) => s.setQty);
  const pushToast = useBasket((s) => s.pushToast);
  const restore = useBasket((s) => s.restore);
  const btn = useRef<HTMLButtonElement>(null);
  // S18: the alert is kept on this device and listed in the account.
  const notified = useOrders((s) => s.alerts.some((a) => a.id === product.id));
  const toggleAlert = useOrders((s) => s.toggleAlert);
  const title = product.title[m.lang];
  const lg = size === "lg";

  if (product.stock === "out") {
    return (
      <button
        type="button"
        onClick={() => toggleAlert(product)}
        aria-pressed={notified}
        className={`w-full rounded-full border border-line bg-warm font-medium text-ink-soft ${lg ? "h-14 text-base" : "h-10 text-sm"}`}
      >
        {notified ? `✓ ${t.notifyDone}` : t.notifyMe}
      </button>
    );
  }

  const onAdd = () => {
    add(product);
    if (btn.current) flyToBasket(btn.current);
    pushToast({ kind: "added", text: `${t.added}: ${product.brand} ${title}`, productId: product.id });
  };

  const minus = () => {
    if (qty <= 1) {
      const state = useBasket.getState();
      const index = state.order.indexOf(product.id);
      const line = state.lines[product.id];
      setQty(product.id, 0);
      pushToast({ kind: "removed", text: `${t.removed}: ${title}`, undo: () => line && restore(line, index) });
    } else setQty(product.id, qty - 1);
  };

  const showStepper = hydrated && qty > 0;
  return (
    <div className={lg ? "h-14" : "h-10"}>
      <AnimatePresence mode="popLayout" initial={false}>
        {showStepper ? (
          <motion.div
            key="stepper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`flex h-full items-center justify-between rounded-full bg-ink text-linen ${lg ? "px-2" : "px-1"}`}
          >
            <button type="button" onClick={minus} aria-label={t.decrease} className={`grid place-items-center rounded-full hover:bg-white/10 ${lg ? "h-11 w-11 text-xl" : "h-8 w-8 text-lg"}`}>
              −
            </button>
            <span aria-live="polite" className="tabular font-semibold">
              <span className="sr-only">{t.quantity}: </span>
              <motion.span key={qty} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.15 }} className="inline-block">
                {qty}
              </motion.span>
            </span>
            <button
              type="button"
              ref={btn}
              onClick={() => {
                setQty(product.id, qty + 1);
                if (btn.current) flyToBasket(btn.current);
              }}
              aria-label={t.increase}
              className={`grid place-items-center rounded-full hover:bg-white/10 ${lg ? "h-11 w-11 text-xl" : "h-8 w-8 text-lg"}`}
            >
              +
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="add"
            ref={btn}
            type="button"
            onClick={onAdd}
            whileTap={{ scale: 0.96 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`h-full w-full rounded-full bg-saffron font-semibold text-white shadow-sm transition-colors hover:bg-saffron-deep ${lg ? "text-base" : "text-sm"}`}
          >
            {label ?? (lg ? t.addToBasket : t.add)}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
