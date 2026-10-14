"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { search, type SearchResult } from "@/lib/search";
import { useT } from "../global/market-context";
import { ListingView } from "../listing/listing-view";

export function SearchResultsView() {
  const t = useT();
  const q = useSearchParams().get("q") ?? "";
  const [res, setRes] = useState<SearchResult | null>(null);
  useEffect(() => {
    let alive = true;
    search(q, 400).then((r) => alive && setRes(r));
    return () => {
      alive = false;
    };
  }, [q]);
  const brands = res ? [...new Set(res.products.map((p) => p.brand).filter(Boolean))] : [];
  return (
    <div>
      <h1 className="font-serif text-4xl font-medium tracking-tight">“{q}”</h1>
      {res?.homeWord ? (
        <p className="mt-4 inline-block rounded-xl bg-cardamom/8 px-4 py-2.5 font-medium text-cardamom">{t.searchHomeWord(res.homeWord.word, res.homeWord.meaning)}</p>
      ) : null}
      <div className="mt-6">
        {!res ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="skeleton aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : res.products.length ? (
          <ListingView products={res.products} brands={brands} />
        ) : (
          <div className="rounded-3xl bg-stone/60 py-16 text-center">
            <p className="font-serif text-2xl">{t.searchNone(q)}</p>
            <p className="mt-2 text-ink-soft">{t.searchNoneHelp}</p>
          </div>
        )}
      </div>
    </div>
  );
}
