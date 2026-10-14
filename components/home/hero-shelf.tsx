"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { money, priceOf } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useMarket, useT } from "../global/market-context";
import { ChaiCup, WindowScene } from "./window-scene";
import { productHref } from "../product/product-card";

const SETTLED = "asianshop-hero-settled";

/** Pack height as a share of the scene, scaled by pack size so a 5 kg bag stands taller than a 100 g box. */
function packHeight(p: Product) {
  const s = (p.size ?? "").toLowerCase();
  const n = parseFloat(s.replace(",", "."));
  if (/kg|l\b/.test(s) && n >= 5) return 30;
  if (/kg|l\b/.test(s)) return 27;
  if (n >= 250) return 23;
  if (n >= 90) return 20;
  return 13;
}

type Phase = "pending" | "settle" | "rest";

function ShelfPack({ p, index, phase, row }: { p: Product; index: number; phase: Phase; row: "top" | "bottom" }) {
  const m = useMarket();
  const [hover, setHover] = useState(false);
  const delay = 0.2 + index * 0.04; // Script S1: first pack at 200 ms, then every 40 ms
  const shown = phase !== "pending";
  const settle = phase === "settle";
  return (
    <Link
      href={productHref(m.code, p)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      aria-label={`${p.brand} ${p.title[m.lang]} ${p.size ?? ""}, ${money(priceOf(p, m), m)}`}
      className="relative flex h-full flex-col items-center justify-end"
      style={{ height: `${packHeight(p) * (row === "top" ? 1 : 0.92)}cqh` }}
    >
      <motion.div
        aria-hidden="true"
        className="absolute -bottom-[2px] h-[6px] w-[70%] rounded-[50%] bg-ink/35 blur-[2px]"
        initial={{ opacity: 0, scaleX: 0.6 }}
        animate={shown ? { opacity: hover ? 0.28 : 0.35, scaleX: hover ? 1.08 : 1 } : { opacity: 0, scaleX: 0.6 }}
        transition={settle && !hover ? { duration: 0.3, delay: delay + 0.25 } : { duration: phase === "rest" && !hover ? 0 : 0.15 }}
      />
      <motion.img
        src={`/products/cutout/${p.id}.webp`}
        alt=""
        draggable={false}
        className="relative h-full w-auto max-w-none object-contain drop-shadow-[0_2px_2px_rgba(31,26,23,0.15)]"
        initial={{ y: -12, opacity: 0 }}
        animate={shown ? { y: hover ? -4 : 0, opacity: 1 } : { y: -12, opacity: 0 }}
        transition={settle && !hover ? { type: "spring", stiffness: 300, damping: 26, delay } : { duration: phase === "rest" && !hover ? 0 : 0.15 }}
        onError={(e) => ((e.currentTarget as HTMLImageElement).src = p.image.replace(".webp", "-400.webp"))}
      />
      {hover ? (
        <span className="toast-in pointer-events-none absolute -top-12 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-xs text-linen shadow-lift">
          {p.title[m.lang]} · {p.size} · {money(priceOf(p, m), m)}
        </span>
      ) : null}
    </Link>
  );
}

/** C1 HeroShelf — the brand line, the search, and the shelf from home (signature moment 1). */
export function HeroShelf({ packs }: { packs: Product[] }) {
  const t = useT();
  const m = useMarket();
  const [phase, setPhase] = useState<Phase>("pending");
  useEffect(() => {
    // Settle once per visit (Script S1); later visits show the shelf at rest.
    let seen = false;
    try {
      seen = sessionStorage.getItem(SETTLED) === "1";
      sessionStorage.setItem(SETTLED, "1");
    } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Start on the next frame so the first paint is the empty shelf and the packs visibly settle.
    const id = requestAnimationFrame(() => setPhase(seen || reduce ? "rest" : "settle"));
    return () => cancelAnimationFrame(id);
  }, []);
  const top = packs.slice(0, 4);
  const bottom = packs.slice(4, 7);
  return (
    <section className="mx-auto grid max-w-[1280px] grid-cols-[minmax(0,1fr)] items-center gap-8 px-4 pb-10 pt-6 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:pb-16 lg:pt-10">
      <div className="lg:col-span-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-saffron-text">{t.greeting}</p>
        <h1 className="mt-3 font-serif text-[40px] font-medium leading-[1.05] tracking-tight sm:text-5xl lg:text-[56px]">{t.brandLine}</h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">{t.heroSub}</p>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("search:open"))}
          className="mt-7 flex h-14 w-full max-w-md items-center gap-3 rounded-full border border-line bg-warm px-5 text-left text-ink-muted shadow-sm transition-colors hover:border-ink-muted/40"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <span className="truncate">{t.searchPlaceholder}</span>
        </button>
        <div className="mt-4 flex flex-wrap gap-2">
          {t.quickChips.map((c) => (
            <Link key={c} href={`/${m.code}/search?q=${encodeURIComponent(c.toLowerCase())}`} className="rounded-full bg-stone px-4 py-2 text-sm font-medium hover:bg-line">
              {c}
            </Link>
          ))}
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] sm:aspect-[7/5.2]" style={{ containerType: "size" }}>
          <WindowScene />
          {/* top shelf = the windowsill, packs silhouetted against the window light */}
          <div className="absolute inset-x-[7%] flex items-end justify-around gap-[2%]" style={{ bottom: `${100 - (294 / 520) * 100}%` }}>
            {top.map((p, i) => (
              <ShelfPack key={p.id} p={p} index={i} phase={phase} row="top" />
            ))}
          </div>
          <div className="absolute inset-x-[9%] hidden items-end justify-around gap-[2%] sm:flex" style={{ bottom: `${100 - (462 / 520) * 100}%` }}>
            {bottom.map((p, i) => (
              <ShelfPack key={p.id} p={p} index={i + 4} phase={phase} row="bottom" />
            ))}
            <ChaiCup className="h-[19cqh] w-auto" />
          </div>
          <ChaiCup className="absolute bottom-[13%] right-[8%] h-[18cqh] w-auto sm:hidden" />
        </div>
      </div>
    </section>
  );
}
