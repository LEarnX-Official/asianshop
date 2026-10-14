"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { money, priceOf } from "@/lib/format";
import { loadSearch, recentSearches, removeRecent, saveRecent, search, type SearchResult } from "@/lib/search";
import type { Category } from "@/lib/types";
import { useMarket, useT } from "../global/market-context";
import { PackImage } from "../product/pack-image";
import { AddToBasket } from "../product/add-to-basket";
import { productHref } from "../product/product-card";

const POPULAR = ["atta", "ghee", "basmati", "haldi", "jeera", "chai"];

/** A6/A7 SearchBar + SearchOverlay — "Search in your own words" (Script S5). */
export function SearchOverlay({ open, onClose, categories }: { open: boolean; onClose: () => void; categories: Category[] }) {
  const t = useT();
  const m = useMarket();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [res, setRes] = useState<SearchResult | null>(null);
  const [active, setActive] = useState(-1);
  const [recentVersion, setRecentVersion] = useState(0);
  // The overlay only renders in the browser, so reading localStorage here is safe.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- recentVersion forces a re-read after a removal
  const recent = useMemo(() => (open ? recentSearches() : []), [open, recentVersion]);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    loadSearch();
    const id = requestAnimationFrame(() => input.current?.focus());
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    let alive = true;
    const handle = setTimeout(() => {
      search(q).then((r) => alive && (setRes(r), setActive(-1)));
    }, 60);
    return () => {
      alive = false;
      clearTimeout(handle);
    };
  }, [q]);

  const go = (query: string) => {
    if (!query.trim()) return;
    saveRecent(query.trim());
    onClose();
    router.push(`/${m.code}/search?q=${encodeURIComponent(query.trim())}`);
  };

  const products = q.trim().length >= 2 ? res?.products ?? [] : [];
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, products.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && products[active]) {
        saveRecent(q.trim());
        onClose();
        router.push(productHref(m.code, products[active]));
      } else go(q);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={t.searchLabel}>
          {/* rack focus: the page softens behind the search */}
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-[4px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto flex h-dvh max-w-3xl flex-col bg-linen sm:mt-4 sm:h-auto sm:max-h-[85vh] sm:rounded-3xl sm:shadow-lift"
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3 sm:px-6 sm:py-4">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-ink-muted" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                role="combobox"
                aria-expanded={products.length > 0}
                aria-controls={listId}
                aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
                aria-autocomplete="list"
                aria-label={t.searchLabel}
                placeholder={t.searchPlaceholder}
                className="h-11 flex-1 bg-transparent text-lg outline-none placeholder:text-ink-muted/80"
                autoComplete="off"
                spellCheck={false}
              />
              <button type="button" onClick={onClose} className="rounded-full px-3 py-2 text-sm font-medium text-ink-soft hover:bg-stone">
                {t.close}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              {q.trim().length < 2 ? (
                <div className="flex flex-col gap-6">
                  {recent.length ? (
                    <section>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">{t.searchRecent}</h3>
                      <ul className="flex flex-wrap gap-2">
                        {recent.map((r) => (
                          <li key={r} className="flex items-center rounded-full border border-line bg-warm">
                            <button type="button" onClick={() => setQ(r)} className="py-1.5 pl-3.5 pr-1 text-sm">
                              {r}
                            </button>
                            <button
                              type="button"
                              aria-label={`${t.remove} ${r}`}
                              onClick={() => (removeRecent(r), setRecentVersion((v) => v + 1))}
                              className="px-2.5 py-1.5 text-ink-muted hover:text-ink"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                  <section>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">{t.searchPopular}</h3>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR.map((w) => (
                        <button key={w} type="button" onClick={() => setQ(w)} className="rounded-full bg-stone px-3.5 py-1.5 text-sm hover:bg-line">
                          {w}
                        </button>
                      ))}
                    </div>
                  </section>
                  <section>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">{t.searchCategories}</h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {categories.map((c) => (
                        <Link key={c.key} href={`/${m.code}/c/${c.key}`} onClick={onClose} className="rounded-xl bg-warm px-3 py-2.5 text-sm hover:bg-stone">
                          {c.name[m.lang]}
                        </Link>
                      ))}
                    </div>
                  </section>
                </div>
              ) : (
                <div>
                  {res?.homeWord ? (
                    <p className="mb-3 rounded-xl bg-cardamom/8 px-3.5 py-2.5 text-sm font-medium text-cardamom">
                      {t.searchHomeWord(res.homeWord.word, res.homeWord.meaning)}
                    </p>
                  ) : null}
                  <p className="sr-only" aria-live="polite">
                    {res ? t.searchResults(res.total) : ""}
                  </p>
                  {products.length ? (
                    <ul id={listId} role="listbox" className="flex flex-col">
                      {products.map((p, i) => (
                        <motion.li
                          key={p.id}
                          id={`${listId}-${i}`}
                          role="option"
                          aria-selected={i === active}
                          layout="position"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.15, delay: Math.min(i, 8) * 0.02 }}
                          className={`flex items-center gap-3 rounded-xl px-2 py-2 ${i === active ? "bg-stone" : ""}`}
                        >
                          <Link href={productHref(m.code, p)} onClick={() => (saveRecent(q.trim()), onClose())} className="flex min-w-0 flex-1 items-center gap-3">
                            <PackImage src={p.image} alt="" brand={p.brand} className="h-14 w-14 shrink-0 rounded-lg" sizes="56px" />
                            <span className="min-w-0">
                              <span className="block text-[11px] font-semibold uppercase tracking-wider text-saffron-text">{p.brand}</span>
                              <span className="block truncate text-[15px]">{p.title[m.lang]}</span>
                              <span className="block text-xs text-ink-muted">
                                {p.size} · <span className="tabular">{money(priceOf(p, m), m)}</span>
                              </span>
                            </span>
                          </Link>
                          <div className="w-24 shrink-0">
                            <AddToBasket product={p} />
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  ) : res ? (
                    <div className="py-10 text-center">
                      <p className="font-serif text-xl">{t.searchNone(q.trim())}</p>
                      <p className="mt-2 text-sm text-ink-soft">{t.searchNoneHelp}</p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {POPULAR.slice(0, 3).map((w) => (
                          <button key={w} type="button" onClick={() => setQ(w)} className="rounded-full bg-stone px-3.5 py-1.5 text-sm">
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {res && res.total > products.length ? (
                    <button type="button" onClick={() => go(q)} className="mt-3 w-full rounded-full border border-line py-3 text-sm font-semibold hover:bg-stone">
                      {t.seeAll(res.total)}
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
