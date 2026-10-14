"use client";

import Fuse, { type IFuseOptions } from "fuse.js";
import type { Product } from "./types";

export type IndexedProduct = Product & { n: string };
type Index = { synonyms: Record<string, string[]>; products: IndexedProduct[] };

let loading: Promise<{ fuse: Fuse<IndexedProduct>; synonyms: Record<string, string[]> }> | null = null;

const OPTIONS: IFuseOptions<IndexedProduct> = {
  keys: [
    { name: "title.en", weight: 2 },
    { name: "title.pl", weight: 2 },
    { name: "title.de", weight: 2 },
    { name: "brand", weight: 1.6 },
    { name: "n", weight: 1 },
  ],
  threshold: 0.32,
  ignoreLocation: true,
  minMatchCharLength: 2,
  includeScore: true,
};

/** Loaded once, the first time search opens (~110 KB gzipped). */
export function loadSearch() {
  if (!loading) {
    loading = fetch("/search-index.json")
      .then((r) => r.json() as Promise<Index>)
      .then((idx) => ({ fuse: new Fuse(idx.products, OPTIONS), synonyms: idx.synonyms }));
  }
  return loading;
}

const UNITS = new Set(["kg", "g", "gm", "gr", "ml", "l", "ltr", "x", "pcs", "szt"]);

export type SearchResult = {
  products: IndexedProduct[];
  total: number;
  /** "haldi = turmeric, kurkuma" — the "they understand me" line (Script S5). */
  homeWord: { word: string; meaning: string } | null;
};

export async function search(query: string, limit = 8): Promise<SearchResult> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return { products: [], total: 0, homeWord: null };
  const { fuse, synonyms } = await loadSearch();

  const tokens = q.split(/\s+/);
  const grams = [q, ...tokens.map((_, i) => tokens.slice(i, i + 2).join(" ")), ...tokens];
  const key = grams.find((g) => synonyms[g]);
  const terms = key ? synonyms[key] : [];

  const scores = new Map<number, { item: IndexedProduct; score: number }>();
  const run = (term: string, penalty: (item: IndexedProduct) => number) => {
    for (const r of fuse.search(term, { limit: 200 })) {
      const s = (r.score ?? 1) + penalty(r.item);
      const prev = scores.get(r.item.id);
      if (!prev || s < prev.score) scores.set(r.item.id, { item: r.item, score: s });
    }
  };
  // When a home word is recognised ("haldi"), loose fuzzy hits on the raw word ("Haldiram") drop
  // below the products that mean it; products naming the word itself ("Haldi Turmeric") stay on top.
  const whole = key ? new RegExp(`(^|[^\\p{L}])${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^\\p{L}]|$)`, "iu") : null;
  const loose = (item: IndexedProduct) => (whole && !whole.test(`${item.title.en} ${item.n}`) ? 0.3 : 0);
  run(q, loose);
  // Multi-word queries ("mdh garam", "TRS turmeric 1 kg"): every *word* must match somewhere, in any
  // order. Numbers and units are not words to match; a pack size in the query is a ranking hint instead.
  const sizeHint = q.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l)\b/);
  const words = tokens
    .filter((tok) => tok.length >= 2 && !/^\d+([.,]\d+)?$/.test(tok) && !UNITS.has(tok))
    .map((tok) => (synonyms[tok] ? synonyms[tok][0] : tok));
  if (words.length > 1 || (words.length === 1 && words[0] !== q)) {
    const perToken = words.map((tok) => new Map(fuse.search(tok, { limit: 800 }).map((r) => [r.item.id, r] as const)));
    for (const [id, r] of perToken[0]) {
      if (perToken.every((mp) => mp.has(id))) {
        const s = perToken.reduce((sum, mp) => sum + (mp.get(id)!.score ?? 1), 0) / words.length + 0.01;
        const prev = scores.get(id);
        if (!prev || s < prev.score) scores.set(id, { item: r.item, score: s });
      }
    }
  }
  if (sizeHint) {
    const want = `${sizeHint[1].replace(",", ".")} ${sizeHint[2]}`;
    for (const e of scores.values()) {
      if ((e.item.size ?? "").toLowerCase().replace(",", ".") === want) e.score -= 0.15;
    }
  }
  // Synonym terms rank just below a direct match; the rest of the query is kept (e.g. "haldi 400 g").
  const rest = key ? q.replace(key, "").trim() : "";
  terms.forEach((term) => run(rest ? `${term} ${rest}` : term, (item) => 0.02 + (term === key ? loose(item) : 0)));

  const ranked = [...scores.values()]
    .sort((a, b) => a.score - b.score || (a.item.stock === "low" ? 1 : 0) - (b.item.stock === "low" ? 1 : 0))
    .map((x) => x.item);
  return {
    products: ranked.slice(0, limit),
    total: ranked.length,
    homeWord: key ? { word: key, meaning: terms.join(", ") } : null,
  };
}

const RECENT = "asianshop-recent";
export function recentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT) ?? "[]");
  } catch {
    return [];
  }
}
export function saveRecent(q: string) {
  try {
    const list = [q, ...recentSearches().filter((x) => x !== q)].slice(0, 5);
    localStorage.setItem(RECENT, JSON.stringify(list));
  } catch {
    /* private mode: recent searches are a convenience only */
  }
}
export function removeRecent(q: string) {
  try {
    localStorage.setItem(RECENT, JSON.stringify(recentSearches().filter((x) => x !== q)));
  } catch {}
}
