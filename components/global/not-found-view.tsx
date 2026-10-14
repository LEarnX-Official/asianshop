"use client";

import Link from "next/link";
import { useMarket, useT } from "./market-context";

/** E3: an empty spot on the shelf, a search, and a way back. */
export function NotFoundView() {
  const m = useMarket();
  const t = useT();
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <svg aria-hidden="true" viewBox="0 0 240 120" className="w-64">
        <rect x="10" y="92" width="220" height="12" rx="3" fill="#c79464" />
        <rect x="30" y="38" width="42" height="54" rx="5" fill="#e9dcc6" />
        <rect x="168" y="50" width="38" height="42" rx="5" fill="#e9dcc6" />
        <rect x="96" y="44" width="48" height="48" rx="6" fill="none" stroke="#c9b9a1" strokeWidth="2" strokeDasharray="5 6" />
      </svg>
      <h1 className="mt-8 font-serif text-4xl font-medium">{t.notFoundTitle}</h1>
      <p className="mt-3 text-ink-soft">{t.notFoundSub}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("search:open"))} className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-linen">
          {t.searchLabel}
        </button>
        <Link href={`/${m.code}`} className="rounded-full border border-ink px-6 py-3 text-sm font-semibold">
          {t.home}
        </Link>
      </div>
    </section>
  );
}
