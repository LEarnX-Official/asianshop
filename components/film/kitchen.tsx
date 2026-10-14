"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { money, priceOf } from "@/lib/format";
import { useMarket, useT } from "../global/market-context";
import { ChaiCup } from "../home/window-scene";
import { productHref } from "../product/product-card";
import { skyline } from "./skyline";

const BACK = skyline({ seed: 5, minH: 260, maxH: 520, minW: 90, maxW: 170, winSize: 12, litShare: 0.5 });

/** Words wrapped in masks so they can rise into place (no SplitText needed, works in every language). */
export function MaskedWords({ text, className = "", wordClass = "film-word" }: { text: string; className?: string; wordClass?: string }) {
  return (
    <span className={className}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <span className={`inline-block ${wordClass}`}>{w}</span>
          {" "}
        </span>
      ))}
    </span>
  );
}

function packHeight(p: Product) {
  const s = (p.size ?? "").toLowerCase();
  const n = parseFloat(s.replace(",", "."));
  if (/kg|l\b/.test(s) && n >= 5) return 34;
  if (/kg|l\b/.test(s)) return 30;
  if (n >= 250) return 25;
  if (n >= 90) return 22;
  return 13;
}

/** Scene 2: inside the kitchen. Shown as the camera passes through the window. */
export function Kitchen({ packs }: { packs: Product[] }) {
  const m = useMarket();
  const t = useT();
  return (
    <div className="film-kitchen absolute inset-0 overflow-hidden" style={{ containerType: "size" }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_68%_8%,#fff3dc_0%,#f5e3c6_38%,#e6cca6_100%)]" />
      {/* the window we came through, now seen from inside: the night city outside */}
      <div className="film-backwindow absolute right-[5%] top-[13%] hidden h-[40%] w-[30%] overflow-hidden rounded-[18px] border-[10px] border-[#fbf3e4] shadow-[inset_0_0_40px_rgba(0,0,0,0.35)] md:block">
        <div className="absolute inset-0 bg-[linear-gradient(#141a33,#2c2a52_55%,#9a6a6a)]" />
        <svg aria-hidden="true" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
          <circle cx="1180" cy="230" r="70" fill="#f6ecd4" opacity="0.9" />
          <path d={BACK.path} fill="#221e3c" />
          {BACK.windows.filter((w) => w.lit).map((w, i) => (
            <rect key={i} x={w.x} y={w.y} width={w.w} height={w.h} fill="#ffcf86" opacity="0.85" />
          ))}
        </svg>
        <div className="absolute inset-y-0 left-1/2 w-[8px] -translate-x-1/2 bg-[#fbf3e4]" />
        <div className="absolute inset-x-0 top-1/2 h-[8px] -translate-y-1/2 bg-[#fbf3e4]" />
      </div>
      {/* pendant lamp */}
      <svg aria-hidden="true" viewBox="0 0 200 300" className="absolute left-[58%] top-0 hidden h-[30%] md:block">
        <defs>
          <radialGradient id="lampglow">
            <stop offset="0" stopColor="#ffe7b0" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ffe7b0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <line x1="100" y1="0" x2="100" y2="150" stroke="#5b4636" strokeWidth="2" />
        <circle cx="100" cy="200" r="90" fill="url(#lampglow)" />
        <path d="M60 190 Q100 130 140 190 Z" fill="#b5542a" />
        <ellipse cx="100" cy="191" rx="40" ry="6" fill="#ffe2a2" />
      </svg>

      {/* words */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1280px] flex-col px-5 pt-[16vh] sm:px-8 md:pt-[15vh]">
        <div className="max-w-[560px]">
          <p className="film-k-eyebrow text-sm font-semibold uppercase tracking-[0.22em] text-saffron-text">{t.greeting}</p>
          <h1 className="mt-4 font-serif text-[42px] font-medium leading-[1.02] tracking-[-0.02em] text-ink sm:text-6xl lg:text-[min(76px,8.2vh)]">
            <MaskedWords text={t.brandLine} wordClass="film-k-word" />
          </h1>
          <div className="film-k-cta mt-7">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("search:open"))}
              className="flex h-14 w-full max-w-md items-center gap-3 rounded-full border border-[#d9c3a3] bg-[#fffaf1]/90 px-5 text-left text-ink-muted shadow-[0_10px_30px_rgba(120,70,20,0.12)] backdrop-blur transition-colors hover:border-ink-muted/40"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <span className="truncate">{t.searchPlaceholder}</span>
            </button>
            <div className="mt-4 flex flex-wrap gap-2">
              {t.quickChips.map((c) => (
                <Link key={c} href={`/${m.code}/search?q=${encodeURIComponent(c.toLowerCase())}`} className="rounded-full bg-[#fffaf1]/80 px-4 py-2 text-sm font-medium text-ink backdrop-blur hover:bg-white">
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* the shelf */}
      <div className="absolute inset-x-0 bottom-[7%] z-10">
        {/* packs and board share one box; packs sit right-aligned on the board and shrink to fit its width */}
        <div className="film-shelf relative mx-auto flex h-[38cqh] w-[94%] max-w-[1320px] items-end justify-center gap-[2%] px-[3%] md:justify-end md:pr-[4%]">
          {packs.map((p, i) => (
            <Link
              key={p.id}
              href={productHref(m.code, p)}
              aria-label={`${p.brand} ${p.title[m.lang]}, ${money(priceOf(p, m), m)}`}
              className={`film-k-pack group relative flex items-end ${i === 6 ? "hidden 2xl:flex" : i >= 3 ? "hidden md:flex" : ""}`}
              style={{ height: `calc(${packHeight(p)} * var(--pack-unit))` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- transparent cut-out */}
              <img src={`/products/cutout/${p.id}.webp`} alt="" className="h-full w-auto max-w-none drop-shadow-[0_8px_10px_rgba(80,40,10,0.25)] transition-transform duration-200 group-hover:-translate-y-1.5" />
              <span className="pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-3 py-1 text-xs text-linen group-hover:block group-focus-visible:block">
                {p.title[m.lang]} · {money(priceOf(p, m), m)}
              </span>
            </Link>
          ))}
          <ChaiCup className="film-k-pack h-[calc(17*var(--pack-unit))] w-auto shrink-0" />
        </div>
        <div className="mx-auto h-4 w-[94%] max-w-[1320px] rounded-sm bg-[linear-gradient(#c79464,#9f6c43)] shadow-[0_14px_24px_rgba(90,50,20,0.25)]" />
      </div>
    </div>
  );
}
