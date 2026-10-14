"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CURRENCIES, MARKETS, switchMarketPath, type MarketCode } from "@/lib/markets";
import { aisleIcon } from "@/lib/brand-assets";
import { basketCount, useBasket } from "@/lib/basket";
import { registerBasketTarget } from "@/lib/fly";
import { useSession } from "@/lib/session";
import { useCurrency } from "@/lib/currency";
import type { Category } from "@/lib/types";
import { useMarket, useT } from "./market-context";
import { SearchOverlay } from "../search/search-overlay";

export { Logo } from "./brand"; // the real AsianShop emblem lockup
import { Logo } from "./brand";

/** Account: a person icon that leads to sign in; once signed in, the shopper's initial leading to their account. */
function AccountLink() {
  const m = useMarket();
  const t = useT();
  const user = useSession((s) => (s.hydrated ? s.user : null));
  return (
    <Link
      href={`/${m.code}/${user ? "account" : "login"}`}
      aria-label={user ? `${t.account}: ${user.name}` : t.signIn}
      className="hdr-link grid h-11 w-10 place-items-center rounded-full hover:bg-stone max-[379px]:hidden sm:w-11"
    >
      {user ? (
        <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-full bg-saffron font-serif text-[15px] font-semibold text-white">
          {user.name.slice(0, 1).toUpperCase()}
        </span>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
        </svg>
      )}
    </Link>
  );
}

function BasketButton() {
  const t = useT();
  const count = useBasket((s) => basketCount(s.lines));
  const hydrated = useBasket((s) => s.hydrated);
  const openDrawer = useBasket((s) => s.openDrawer);
  const ref = useRef<HTMLButtonElement>(null);
  const [bump, setBump] = useState(0);
  useEffect(() => {
    registerBasketTarget(ref.current);
    const onArrive = () => setBump((b) => b + 1);
    window.addEventListener("basket:arrive", onArrive);
    return () => {
      window.removeEventListener("basket:arrive", onArrive);
      registerBasketTarget(null);
    };
  }, []);
  const n = hydrated ? count : 0;
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => openDrawer(true)}
      aria-label={t.basketItems(n)}
      className="hdr-basket relative flex h-11 items-center gap-1.5 rounded-full bg-ink pl-3 pr-3.5 text-linen hover:bg-ink-soft sm:gap-2 sm:pl-3.5 sm:pr-4"
    >
      <span key={bump} className={bump ? "bump inline-flex" : "inline-flex"}>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M5 8h14l-1.3 10.2a2 2 0 0 1-2 1.8H8.3a2 2 0 0 1-2-1.8L5 8Z" strokeLinejoin="round" />
          <path d="M9 10V7a3 3 0 0 1 6 0v3" strokeLinecap="round" />
        </svg>
      </span>
      <span className="tabular min-w-[1ch] overflow-hidden text-sm font-semibold" aria-hidden="true">
        <motion.span key={n} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.15 }} className="inline-block">
          {n}
        </motion.span>
      </span>
    </button>
  );
}

function MarketSwitcher() {
  const m = useMarket();
  const t = useT();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", close);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);
  const choose = (code: MarketCode) => {
    setOpen(false);
    router.push(switchMarketPath(pathname, code));
  };
  const symbol = m.currency === "PLN" ? "zł" : "€";
  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="hdr-pill flex h-11 items-center gap-1 rounded-full border border-line bg-warm px-2.5 text-sm font-medium hover:bg-stone sm:gap-1.5 sm:px-3.5"
      >
        <span className="sr-only">{t.shoppingFrom}: </span>
        {/* phones: globe + language code; wider screens: country · language · currency */}
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px] sm:hidden" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
        </svg>
        <span className="sm:hidden" aria-hidden="true">{m.lang.toUpperCase()}</span>
        <span className="sr-only sm:not-sr-only">{m.countryName[m.lang]}</span>
        <span className="hidden text-ink-muted sm:inline">·</span>
        <span className="sr-only sm:not-sr-only">{{ pl: "Polski", de: "Deutsch", en: "English" }[m.lang]}</span>
        <span className="hidden text-ink-muted sm:inline">·</span>
        <span className="sr-only sm:not-sr-only">{symbol}</span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-4 top-[68px] z-40 rounded-2xl border border-line bg-warm p-2 text-ink shadow-lift sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-72"
          >
            <p id="market-list-title" className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">{t.marketTitle}</p>
            <div role="listbox" aria-labelledby="market-list-title">
            {(Object.keys(MARKETS) as MarketCode[]).map((code) => {
              const x = MARKETS[code];
              const label = { pl: "Polski", de: "Deutsch", en: "English" }[x.lang];
              return (
                <button
                  key={code}
                  type="button"
                  role="option"
                  aria-selected={code === m.code}
                  onClick={() => choose(code)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-stone ${code === m.code ? "bg-stone font-semibold" : ""}`}
                >
                  <span>
                    {x.countryName[m.lang]} · {label}
                  </span>
                  {code === m.code ? <span aria-hidden="true" className="text-saffron-text">✓</span> : null}
                </button>
              );
            })}
            </div>
            <div className="mt-1 border-t border-line px-3 pb-2 pt-3">
              <CurrencyToggle />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** Country and language, at the foot of the phone menu. */
function MenuMarkets({ onClose }: { onClose: () => void }) {
  const m = useMarket();
  const t = useT();
  const pathname = usePathname();
  return (
    <div className="border-t border-line px-5 pb-6 pt-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{t.marketTitle}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(Object.keys(MARKETS) as MarketCode[]).map((code) => {
          const x = MARKETS[code];
          const active = code === m.code;
          return (
            <Link
              key={code}
              href={switchMarketPath(pathname, code)}
              onClick={onClose}
              aria-current={active ? "true" : undefined}
              className={`rounded-full border px-3.5 py-2 text-sm ${active ? "border-ink bg-ink font-semibold text-linen" : "border-line bg-warm hover:bg-stone"}`}
            >
              {x.countryName[m.lang]} · {{ pl: "Polski", de: "Deutsch", en: "English" }[x.lang]}
            </Link>
          );
        })}
      </div>
      <div className="mt-5">
        <CurrencyToggle />
      </div>
    </div>
  );
}

/** Złoty or euro, in any country. Choosing the country's own currency clears the choice. */
function CurrencyToggle() {
  const m = useMarket();
  const t = useT();
  const setCurrency = useCurrency((s) => s.setCurrency);
  const id = useId();
  return (
    <div>
      <p id={id} className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
        {t.currencyTitle}
      </p>
      <div role="radiogroup" aria-labelledby={id} className="mt-2 grid grid-cols-2 gap-1 rounded-full bg-stone p-1">
        {CURRENCIES.map((c) => {
          const on = m.currency === c;
          return (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setCurrency(c === m.homeCurrency ? null : c)}
              className={`flex h-9 items-center justify-center gap-1.5 rounded-full text-sm transition-colors ${on ? "bg-ink font-semibold text-linen shadow-sm" : "text-ink-soft hover:bg-warm"}`}
            >
              <span aria-hidden="true">{c === "PLN" ? "zł" : "€"}</span>
              <span>{c}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] leading-snug text-ink-muted">{t.currencyNote}</p>
    </div>
  );
}

function MobileMenu({ open, onClose, categories }: { open: boolean; onClose: () => void; categories: Category[] }) {
  const m = useMarket();
  const t = useT();
  const signedIn = useSession((s) => s.hydrated && !!s.user);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t.menu}>
          <motion.div className="absolute inset-0 bg-ink/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.nav
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-linen"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <Logo />
              <Link href={`/${m.code}/${signedIn ? "account" : "login"}`} onClick={onClose} className="ml-auto rounded-full px-3 py-2 text-sm font-medium hover:bg-stone">
                {signedIn ? t.account : t.signIn}
              </Link>
              <button type="button" onClick={onClose} className="rounded-full px-3 py-2 text-sm hover:bg-stone">
                {t.close}
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto px-2 py-2">
              {categories.map((c) => (
                <li key={c.key}>
                  <Link href={`/${m.code}/c/${c.key}`} onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-base hover:bg-stone">
                    {aisleIcon(c.key) ? (
                      // eslint-disable-next-line @next/next/no-img-element -- small pre-sized icon
                      <img src={aisleIcon(c.key, 120)!} alt="" width={36} height={36} className="h-9 w-9 shrink-0" />
                    ) : (
                      <span className="h-9 w-9 shrink-0" />
                    )}
                    <span className="flex-1">{c.name[m.lang]}</span>
                    <span className="text-xs text-ink-muted">{c.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <MenuMarkets onClose={onClose} />
          </motion.nav>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

/** A3 Header: sticky; the category row hides on scroll down and returns on scroll up. */
export function Header({ categories }: { categories: Category[] }) {
  const m = useMarket();
  const t = useT();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const pathname = usePathname();
  // On the homepage film the header never changes height: a resize would shift the pinned scenes.
  const isFilm = pathname === `/${m.code}`;
  useEffect(() => {
    if (isFilm) return;
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) > 6) setCompact(y > 140 && y > last);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isFilm]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    const onOpen = () => setSearchOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("search:open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("search:open", onOpen);
    };
  }, []);

  if (pathname.endsWith("/checkout")) {
    // Script S11: the checkout header is just the logo, "Secure checkout" and help.
    return (
      <header className="site-header sticky top-0 z-40 border-b border-line/70 bg-linen/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href={`/${m.code}`} aria-label="Asian Shop">
            <Logo />
          </Link>
          <p className="flex items-center gap-2 text-sm font-medium text-ink-soft">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-cardamom" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            {t.secureCheckout}
          </p>
          <Link href={`/${m.code}/info/contact`} className="text-sm font-medium text-ink-soft hover:text-ink">
            {t.help}
          </Link>
        </div>
      </header>
    );
  }

  const searchButton = (
    <button
      type="button"
      onClick={() => setSearchOpen(true)}
      className="hdr-pill flex h-11 w-full items-center gap-3 rounded-full border border-line bg-warm px-4 text-left text-[15px] text-ink-muted transition-colors hover:border-ink-muted/40"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <span className="truncate">{t.searchPlaceholder}</span>
    </button>
  );

  return (
    <>
      <header className="site-header sticky top-0 z-40 border-b border-line/70 bg-linen/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1280px] items-center gap-1.5 px-3 py-3 sm:gap-3 sm:px-6 lg:gap-6">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label={t.menu} className="hdr-link grid h-11 w-10 shrink-0 place-items-center rounded-full hover:bg-stone sm:w-11 lg:hidden">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
            </svg>
          </button>
          <Link href={`/${m.code}`} aria-label="Asian Shop" className="shrink-0">
            <Logo />
          </Link>
          <div className="hidden flex-1 md:block">{searchButton}</div>
          <div className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0">
            <MarketSwitcher />
            <AccountLink />
            <BasketButton />
          </div>
        </div>
        <div className="px-4 pb-3 md:hidden">{searchButton}</div>
        <motion.nav
          aria-label={t.allCategories}
          initial={false}
          animate={{ height: compact && !isFilm ? 0 : "auto", opacity: compact && !isFilm ? 0 : 1 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="hidden overflow-hidden lg:block"
        >
          <ul className="no-scrollbar mx-auto flex max-w-[1280px] justify-between overflow-x-auto px-3 pb-2.5 [mask-image:linear-gradient(to_right,black_94%,transparent)] sm:px-4">
            {categories.map((c) => (
              <li key={c.key}>
                <Link href={`/${m.code}/c/${c.key}`} className="hdr-link block whitespace-nowrap rounded-full px-2.5 py-1.5 text-[13.5px] text-ink-soft hover:bg-stone hover:text-ink">
                  {c.name[m.lang]}
                </Link>
              </li>
            ))}
          </ul>
        </motion.nav>
      </header>
      <SearchOverlay open={searchOpen} onClose={closeSearch} categories={categories} />
      <MobileMenu open={menuOpen} onClose={closeMenu} categories={categories} />
    </>
  );
}
