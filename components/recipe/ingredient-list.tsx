"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { money, priceOf } from "@/lib/format";
import { useBasket } from "@/lib/basket";
import { flyToBasket } from "@/lib/fly";
import type { Product } from "@/lib/types";
import { useMarket, useT } from "../global/market-context";
import { PackImage } from "../product/pack-image";
import { productHref } from "../product/product-card";

/** E2 IngredientList — untick what you already have, then add the rest (Script S10). */
export function IngredientList({ products, dish }: { products: Product[]; dish: string }) {
  const m = useMarket();
  const t = useT();
  const [checked, setChecked] = useState<Set<number>>(() => new Set(products.filter((p) => p.stock !== "out").map((p) => p.id)));
  const [added, setAdded] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const addMany = useBasket((s) => s.addMany);
  const pushToast = useBasket((s) => s.pushToast);
  const openDrawer = useBasket((s) => s.openDrawer);
  const selected = useMemo(() => products.filter((p) => checked.has(p.id)), [products, checked]);
  const total = selected.reduce((s, p) => s + priceOf(p, m), 0);

  const toggle = (id: number) =>
    setChecked((c) => {
      const next = new Set(c);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const add = () => {
    if (added) return openDrawer(true);
    if (!selected.length) return;
    const before = useBasket.getState();
    const snapshot = { lines: before.lines, order: before.order };
    addMany(selected);
    if (btn.current) [0, 80, 160].forEach((d) => flyToBasket(btn.current!, { delay: 40 + d }));
    pushToast({ kind: "bulk", text: t.ingredientsAdded(selected.length, dish), undo: () => useBasket.setState(snapshot) });
    setTimeout(() => setAdded(true), 450);
  };

  return (
    <div>
      <p className="mb-3 text-sm text-ink-muted">{t.untickHint}</p>
      <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-warm">
        {products.map((p) => (
          <li key={p.id} className="flex items-center gap-3 px-3 py-2.5">
            <input
              id={`ing-${p.id}`}
              type="checkbox"
              checked={checked.has(p.id)}
              disabled={p.stock === "out"}
              onChange={() => toggle(p.id)}
              className="h-5 w-5 shrink-0 accent-[#c8611e]"
            />
            <label htmlFor={`ing-${p.id}`} className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
              <PackImage src={p.image} alt="" brand={p.brand} className="h-14 w-14 shrink-0 rounded-lg" sizes="56px" />
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-saffron-text">{p.brand}</span>
                <span className="block truncate">{p.title[m.lang]}</span>
                <span className="block text-xs text-ink-muted">{p.size}</span>
              </span>
            </label>
            <Link href={productHref(m.code, p)} className="tabular shrink-0 text-sm font-semibold hover:underline">
              {money(priceOf(p, m), m)}
            </Link>
          </li>
        ))}
      </ul>
      <div className="sticky bottom-3 z-20 mt-4">
        <button
          ref={btn}
          type="button"
          onClick={add}
          disabled={!selected.length}
          className="flex h-14 w-full items-center justify-center rounded-full bg-saffron text-base font-semibold text-white shadow-lift transition-colors hover:bg-saffron-deep disabled:bg-line disabled:text-ink-muted"
        >
          {added ? (
            t.addedView
          ) : (
            <motion.span key={`${selected.length}-${total}`} initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.15 }}>
              {t.addIngredients(selected.length, money(total, m))}
            </motion.span>
          )}
        </button>
      </div>
    </div>
  );
}
