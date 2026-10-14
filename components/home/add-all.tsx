"use client";

import { useRef, useState } from "react";
import { money, priceOf } from "@/lib/format";
import { useBasket } from "@/lib/basket";
import { flyToBasket } from "@/lib/fly";
import type { Product } from "@/lib/types";
import { useMarket, useT } from "../global/market-context";

/**
 * "Add all" for pantry rows and recipes (Script S10): three dots fly, not nine —
 * a sense of "many" without clutter — then one toast with Undo all.
 */
export function AddAll({ products, label, dish, variant = "dark" }: { products: Product[]; label?: string; dish?: string; variant?: "dark" | "saffron" }) {
  const m = useMarket();
  const t = useT();
  const addMany = useBasket((s) => s.addMany);
  const pushToast = useBasket((s) => s.pushToast);
  const openDrawer = useBasket((s) => s.openDrawer);
  const btn = useRef<HTMLButtonElement>(null);
  const [done, setDone] = useState(false);
  const total = products.reduce((s, p) => s + priceOf(p, m), 0);

  const onClick = () => {
    if (done) return openDrawer(true);
    const before = useBasket.getState();
    const snapshot = { lines: before.lines, order: before.order };
    addMany(products);
    if (btn.current) [0, 80, 160].forEach((delay) => flyToBasket(btn.current!, { delay: 40 + delay }));
    pushToast({
      kind: "bulk",
      text: dish ? t.ingredientsAdded(products.length, dish) : t.bulkAdded(products.length),
      undo: () => useBasket.setState(snapshot),
    });
    setTimeout(() => setDone(true), 450);
  };

  return (
    <button
      ref={btn}
      type="button"
      onClick={onClick}
      className={`inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full px-6 text-sm font-semibold transition-colors ${
        variant === "saffron" ? "bg-saffron text-white hover:bg-saffron-deep" : "bg-ink text-linen hover:bg-ink-soft"
      }`}
    >
      {done ? t.addedView : label ?? `${t.addAll} · ${money(total, m)}`}
    </button>
  );
}
