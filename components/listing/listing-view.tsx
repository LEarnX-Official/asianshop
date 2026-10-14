"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { priceOf } from "@/lib/format";
import type { Localized, Product } from "@/lib/types";
import { useMarket, useT } from "../global/market-context";
import { ProductCard } from "../product/product-card";

type Sub = { key: string; name: Localized; count: number };
const PAGE = 24;

/** D2–D4: filter bar, sort, grid that re-arranges smoothly, "Show more" (never infinite scroll). */
export function ListingView({ products, subs = [], brands }: { products: Product[]; subs?: Sub[]; brands: string[] }) {
  const t = useT();
  const m = useMarket();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const sub = params.get("sub");
  const brandSel = useMemo(() => params.getAll("brand"), [params]);
  const inStock = params.get("stock") === "1";
  const sort = params.get("sort") ?? "rec";
  const [shown, setShown] = useState(PAGE);
  const [sheet, setSheet] = useState(false);

  const update = (mut: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mut(next);
    setShown(PAGE);
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  const filtered = useMemo(() => {
    let list = products.filter(
      (p) => (!sub || p.subcategory === sub) && (!brandSel.length || brandSel.includes(p.brand)) && (!inStock || p.stock !== "out"),
    );
    const unit = (p: Product) => (p.unitPrice ? (m.currency === "PLN" ? p.unitPrice.pln : p.unitPrice.eur) : Infinity);
    if (sort === "low") list = [...list].sort((a, b) => priceOf(a, m) - priceOf(b, m));
    if (sort === "high") list = [...list].sort((a, b) => priceOf(b, m) - priceOf(a, m));
    if (sort === "unit") list = [...list].sort((a, b) => unit(a) - unit(b));
    if (sort === "fresh") list = [...list].sort((a, b) => b.bestBefore.localeCompare(a.bestBefore));
    if (sort === "rec") list = [...list].sort((a, b) => Number(a.stock === "out") - Number(b.stock === "out"));
    return list;
  }, [products, sub, brandSel, inStock, sort, m]);

  const chip = (active: boolean) =>
    `whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-150 ${active ? "border-ink bg-ink text-linen" : "border-line bg-warm hover:bg-stone"}`;

  const brandFilter = (
    <div className="flex flex-wrap gap-2">
      {brands.slice(0, 14).map((b) => (
        <button
          key={b}
          type="button"
          aria-pressed={brandSel.includes(b)}
          onClick={() => update((p) => {
            const cur = p.getAll("brand");
            p.delete("brand");
            (cur.includes(b) ? cur.filter((x) => x !== b) : [...cur, b]).forEach((x) => p.append("brand", x));
          })}
          className={chip(brandSel.includes(b))}
        >
          {b}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <div className="sticky top-[124px] z-20 -mx-4 mb-6 md:top-[68px] border-b border-line/60 bg-linen/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-4 lg:top-[112px]">
        <div className="flex items-center gap-2">
          <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
            {subs.length > 1 ? (
              <>
                <button type="button" onClick={() => update((p) => p.delete("sub"))} className={chip(!sub)} aria-pressed={!sub}>
                  {t.allCategories}
                </button>
                {subs.map((s) => (
                  <button key={s.key} type="button" aria-pressed={sub === s.key} onClick={() => update((p) => (sub === s.key ? p.delete("sub") : p.set("sub", s.key)))} className={chip(sub === s.key)}>
                    {s.name[m.lang]} <span className="opacity-60">{s.count}</span>
                  </button>
                ))}
              </>
            ) : null}
            <button type="button" aria-pressed={inStock} onClick={() => update((p) => (inStock ? p.delete("stock") : p.set("stock", "1")))} className={chip(inStock)}>
              {t.inStockOnly}
            </button>
          </div>
          <button type="button" onClick={() => setSheet(true)} className="shrink-0 rounded-full border border-line bg-warm px-3.5 py-1.5 text-sm font-medium hover:bg-stone">
            {t.filters}
            {brandSel.length ? ` (${brandSel.length})` : ""}
          </button>
          <label className="hidden shrink-0 items-center gap-2 text-sm sm:flex">
            <span className="text-ink-muted">{t.sortBy}</span>
            <select value={sort} onChange={(e) => update((p) => (e.target.value === "rec" ? p.delete("sort") : p.set("sort", e.target.value)))} className="h-9 rounded-full border border-line bg-warm px-3 text-sm">
              <option value="rec">{t.sortRecommended}</option>
              <option value="low">{t.sortPriceLow}</option>
              <option value="high">{t.sortPriceHigh}</option>
              <option value="unit">{t.sortUnit}</option>
              <option value="fresh">{t.sortFresh}</option>
            </select>
          </label>
        </div>
      </div>

      <p className="mb-4 text-sm text-ink-muted" aria-live="polite">
        <motion.span key={filtered.length} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="inline-block">
          {t.products(filtered.length)}
        </motion.span>
      </p>

      {filtered.length ? (
        <motion.ul layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          <AnimatePresence initial={false} mode="popLayout">
            {filtered.slice(0, shown).map((p, i) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProductCard product={p} priority={i < 4} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <div className="rounded-3xl bg-stone/60 py-16 text-center">
          <p className="font-serif text-2xl">{t.noFilterResults}</p>
          <button type="button" onClick={() => update((p) => { const b = p.getAll("brand"); if (b.length) { p.delete("brand"); b.slice(0, -1).forEach((x) => p.append("brand", x)); } else if (p.has("stock")) p.delete("stock"); else p.delete("sub"); })} className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-linen">
            {t.removeLastFilter}
          </button>
        </div>
      )}

      {filtered.length > shown ? (
        <div className="mt-10 text-center">
          <button type="button" onClick={() => setShown((s) => s + PAGE)} className="rounded-full border border-ink px-8 py-3 text-sm font-semibold hover:bg-ink hover:text-linen">
            {t.showMore} ({filtered.length - shown})
          </button>
        </div>
      ) : null}

      <AnimatePresence>
        {sheet ? (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={t.filters}>
            <motion.div className="absolute inset-0 bg-ink/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-linen p-6 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[420px] sm:rounded-3xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-serif text-2xl">{t.filters}</h2>
                <button type="button" onClick={() => update((p) => { p.delete("brand"); p.delete("stock"); p.delete("sub"); })} className="text-sm font-medium text-saffron-text">
                  {t.clearAll}
                </button>
              </div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">{t.brand}</h3>
              {brandFilter}
              <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-ink-muted sm:hidden">{t.sortBy}</h3>
              <select value={sort} onChange={(e) => update((p) => (e.target.value === "rec" ? p.delete("sort") : p.set("sort", e.target.value)))} className="h-11 w-full rounded-full border border-line bg-warm px-4 text-sm sm:hidden">
                <option value="rec">{t.sortRecommended}</option>
                <option value="low">{t.sortPriceLow}</option>
                <option value="high">{t.sortPriceHigh}</option>
                <option value="unit">{t.sortUnit}</option>
                <option value="fresh">{t.sortFresh}</option>
              </select>
              <button type="button" onClick={() => setSheet(false)} className="mt-6 h-12 w-full rounded-full bg-ink text-sm font-semibold text-linen">
                {t.showProducts(filtered.length)}
              </button>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
