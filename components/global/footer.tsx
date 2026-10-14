"use client";

import Link from "next/link";
import type { Category } from "@/lib/types";
import { useMarket, useT } from "./market-context";
import { Seal } from "./brand";

/** A13 Footer. */
export function Footer({ categories }: { categories: Category[] }) {
  const m = useMarket();
  const t = useT();
  return (
    <footer className="mt-24 border-t border-line bg-stone/60">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
        <div>
          <Seal className="h-28 w-28 text-ink" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">{t.footerTagline}</p>
          <p className="mt-4 text-sm text-ink-soft">
            Balice · Kraków — Wrocław
            <br />
            biuro@asianshop.pl
          </p>
        </div>
        <nav aria-label={t.allCategories}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{t.allCategories}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {categories.slice(0, 7).map((c) => (
              <li key={c.key}>
                <Link href={`/${m.code}/c/${c.key}`} className="hover:underline hover:underline-offset-4">
                  {c.name[m.lang]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t.help}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{t.help}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(["about", "delivery", "payments", "returns", "terms", "privacy", "contact"] as const).map((x) => (
              <li key={x}>
                <Link href={`/${m.code}/info/${x}`} className="hover:underline hover:underline-offset-4">
                  {t.infoNav[x]}
                </Link>
              </li>
            ))}
            <li>
              <Link href={`/${m.code}/trade`} className="font-semibold hover:underline hover:underline-offset-4">
                {t.tradeTitle}
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Newsletter</h2>
          <p className="mt-3 text-sm text-ink-soft">{t.newsletter}</p>
          <form className="mt-3 flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <label className="sr-only" htmlFor="nl">
              {t.emailPlaceholder}
            </label>
            <input id="nl" type="email" placeholder={t.emailPlaceholder} className="h-11 min-w-0 flex-1 rounded-full border border-line bg-warm px-4 text-sm" />
            <button type="submit" className="h-11 rounded-full bg-ink px-4 text-sm font-semibold text-linen">
              {t.subscribe}
            </button>
          </form>
          <p className="mt-6 text-xs text-ink-muted">
            {t.payments}: {m.country === "PL" ? "BLIK · Przelewy24 · Visa · Mastercard · Apple Pay · Google Pay" : "PayPal · Klarna · SEPA · Visa · Mastercard · Apple Pay"}
          </p>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-[1280px] px-4 py-5 text-xs text-ink-muted sm:px-6">{t.prototypeNote}</p>
      </div>
    </footer>
  );
}
