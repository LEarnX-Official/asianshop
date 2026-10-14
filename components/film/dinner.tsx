"use client";

import Link from "next/link";
import type { Product, Recipe } from "@/lib/types";
import { money, priceOf } from "@/lib/format";
import { useMarket, useT } from "../global/market-context";
import { AddAll } from "../home/add-all";
import { productHref } from "../product/product-card";
import { MaskedWords } from "./kitchen";

/* Scene 5 — "Tonight's dinner": each ingredient sends a spoonful into the kadai.
   It lands with a ripple, leaves its seeds on the dal, the dal deepens, the tadka sizzles, steam rises. */

// What each ingredient looks like as it hits the pot (by product id), with a fallback.
const LOOK: Record<number, { color: string; seed: "round" | "long" | "flake" }> = {
  1674: { color: "#e8b64a", seed: "round" }, // toor dal
  1748: { color: "#f5d98a", seed: "flake" }, // ghee
  1091: { color: "#6e4f2c", seed: "long" }, // cumin seeds
  2656: { color: "#3b2617", seed: "round" }, // mustard seeds
  1120: { color: "#f0b21b", seed: "flake" }, // turmeric
  675: { color: "#c0392b", seed: "flake" }, // kashmiri chilli
  495: { color: "#efe2c2", seed: "flake" }, // hing
  488: { color: "#8a5528", seed: "flake" }, // garam masala
};
const look = (id: number, i: number) => LOOK[id] ?? { color: ["#e8b64a", "#c0392b", "#6e4f2c", "#f0b21b"][i % 4], seed: "round" as const };

// Deterministic landing points and seed scatter inside the dal (svg units, centre 200/200, dal radius 136).
function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const r2 = (n: number) => Math.round(n * 100) / 100;
const LAND = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2 + 0.4;
  const r = 30 + (i % 3) * 26;
  return { x: r2(200 + Math.cos(a) * r), y: r2(200 + Math.sin(a) * r) };
});
const SEEDS = LAND.map((p, i) => {
  const r = rng(100 + i);
  return Array.from({ length: 7 }, () => ({ x: r2(p.x + (r() - 0.5) * 70), y: r2(p.y + (r() - 0.5) * 70), rot: r2(r() * 180), s: r2(0.7 + r() * 0.7) }));
});
const BUBBLES = (() => {
  const r = rng(7);
  return Array.from({ length: 16 }, () => ({ x: r2(200 + (r() - 0.5) * 220), y: r2(200 + (r() - 0.5) * 220), r: r2(3 + r() * 6) }));
})();

function Seed({ kind, color, x, y, rot, s }: { kind: "round" | "long" | "flake"; color: string; x: number; y: number; rot: number; s: number }) {
  const t = `translate(${x} ${y}) rotate(${rot}) scale(${s})`;
  if (kind === "long") return <ellipse transform={t} rx="5.5" ry="2" fill={color} />;
  if (kind === "flake") return <path transform={t} d="M-5 -2 q4 -5 9 -1 q2 4 -3 6 q-6 1 -6 -5 Z" fill={color} opacity="0.85" />;
  return <circle transform={t} r="3.2" fill={color} />;
}

function Kadai({ ingredients }: { ingredients: Product[] }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 400 400" className="dinner-kadai h-full w-full overflow-visible">
      <defs>
        <linearGradient id="k-copper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0b07a" />
          <stop offset="0.35" stopColor="#c06a35" />
          <stop offset="0.75" stopColor="#8a4220" />
          <stop offset="1" stopColor="#5c2a12" />
        </linearGradient>
        <radialGradient id="k-wall" cx="0.42" cy="0.38" r="0.7">
          <stop offset="0.7" stopColor="#7a3a18" />
          <stop offset="1" stopColor="#3e1b0a" />
        </radialGradient>
        <radialGradient id="k-dal" cx="0.42" cy="0.36" r="0.75">
          <stop offset="0" stopColor="#ffd97a" />
          <stop offset="0.5" stopColor="#efb13e" />
          <stop offset="1" stopColor="#c27c1a" />
        </radialGradient>
        <radialGradient id="k-shadow">
          <stop offset="0.6" stopColor="#000" stopOpacity="0.45" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <filter id="k-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <clipPath id="k-surface">
          <circle cx="200" cy="200" r="136" />
        </clipPath>
      </defs>
      <ellipse cx="214" cy="222" rx="200" ry="196" fill="url(#k-shadow)" />
      {/* handles */}
      <path d="M22 182 q-26 18 0 36 h22 v-36 Z" fill="#6e3214" stroke="#4a200b" strokeWidth="3" />
      <path d="M378 182 q26 18 0 36 h-22 v-36 Z" fill="#6e3214" stroke="#4a200b" strokeWidth="3" />
      {/* the kadai */}
      <circle cx="200" cy="200" r="168" fill="url(#k-copper)" />
      <path d="M78 110 A150 150 0 0 1 250 52" stroke="#ffe0bd" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.55" />
      <circle cx="200" cy="200" r="150" fill="url(#k-wall)" />
      <circle cx="200" cy="200" r="136" fill="url(#k-dal)" />
      <g clipPath="url(#k-surface)">
        <circle className="dal-deep" cx="200" cy="200" r="136" fill="#d4741e" opacity="0" />
        <ellipse cx="160" cy="150" rx="70" ry="22" fill="#fff4cc" opacity="0.22" transform="rotate(-25 160 150)" />
        <ellipse cx="250" cy="260" rx="40" ry="10" fill="#fff4cc" opacity="0.14" transform="rotate(-25 250 260)" />
        {ingredients.map((p, i) => (
          <g key={p.id}>
            <circle className={`dal-ripple dal-ripple-${i}`} cx={LAND[i].x} cy={LAND[i].y} r="16" fill="none" stroke="#fff3cf" strokeWidth="3" opacity="0" />
            <g className={`dal-seeds dal-seeds-${i}`}>
              {SEEDS[i].map((s, j) => (
                <g key={j} className="dal-seed" opacity="0">
                  <Seed kind={look(p.id, i).seed} color={look(p.id, i).color} {...s} />
                </g>
              ))}
            </g>
          </g>
        ))}
        {BUBBLES.map((b, i) => (
          <circle key={i} className="dal-bubble" cx={b.x} cy={b.y} r={b.r} fill="none" stroke="#fff6da" strokeWidth="1.6" opacity="0" />
        ))}
      </g>
      {/* steam seen from above: soft wisps drifting off the surface */}
      <g filter="url(#k-soft)">
        {["M150 210 c-20 -30 30 -45 10 -80", "M205 190 c-22 -32 30 -48 8 -88", "M255 215 c-20 -30 30 -45 10 -80"].map((d, i) => (
          <path key={d} className={`dal-steam dal-steam-${i}`} d={d} stroke="#fff6e4" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0" />
        ))}
      </g>
    </svg>
  );
}

export function DinnerScene({ recipe, ingredients }: { recipe: Recipe; ingredients: Product[] }) {
  const m = useMarket();
  const t = useT();
  const list = ingredients.slice(0, 8);
  const total = list.reduce((s, p) => s + priceOf(p, m), 0);
  return (
    <section
      className="film-dinner relative h-svh overflow-hidden bg-[radial-gradient(ellipse_at_50%_45%,#3d2c21_0%,#1e1814_60%,#130f0c_100%)] text-linen md:bg-[radial-gradient(ellipse_at_68%_50%,#3d2c21_0%,#1e1814_60%,#130f0c_100%)]"
      aria-label={t.dinnerTitle}
    >
      <div className="grain" />
      <div className="dinner-frame relative z-10 mx-auto grid h-full max-w-[1280px] grid-cols-[minmax(0,1fr)] content-center gap-x-12 gap-y-[2.4svh] px-5 pt-[124px] sm:px-8 md:grid-cols-[1fr_1.05fr] md:gap-y-8 md:pt-[100px]">
        <div className="md:col-start-1 md:row-start-1 md:self-end">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-turmeric md:text-sm">{t.dinnerEyebrow}</p>
          <h2 className="mt-2 font-serif text-[32px] font-medium leading-[1.05] tracking-tight sm:text-5xl md:mt-3 lg:text-6xl">
            <MaskedWords text={t.dinnerTitle} wordClass="film-d-word" />
          </h2>
          <p className="dinner-sub mt-2 max-w-md text-[15px] text-linen/75 [@media(max-height:720px)]:hidden md:mt-4 md:text-lg md:[@media(max-height:720px)]:block">{t.dinnerSub}</p>
        </div>

        <div className="dinner-pot relative mx-auto aspect-square w-[min(64vw,28svh)] max-w-[440px] [@media(max-height:720px)]:w-[26svh] md:col-start-2 md:row-span-2 md:row-start-1 md:w-[min(40vw,60svh)] md:max-w-none md:self-center">
          <Kadai ingredients={list} />
        </div>

        <div className="md:col-start-1 md:row-start-2 md:self-start">
          <ul className="mx-auto grid w-[min(100%,46svh)] max-w-md grid-cols-4 gap-2 md:mx-0 md:w-auto md:gap-2.5">
            {list.map((p, i) => (
              <li key={p.id} className="dinner-slot">
                <Link
                  href={productHref(m.code, p)}
                  aria-label={`${p.brand} ${p.title[m.lang]}`}
                  title={`${p.title[m.lang]} · ${money(priceOf(p, m), m)}`}
                  className={`dinner-tile dinner-tile-${i} relative block aspect-square rounded-2xl bg-linen/95 p-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-0.5`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP */}
                  <img src={p.image.replace(".webp", "-400.webp")} alt="" className="pack-img h-full w-full object-contain" />
                  <span
                    aria-hidden="true"
                    className={`dinner-check dinner-check-${i} absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold text-white opacity-0`}
                    style={{ background: look(p.id, i).color }}
                  >
                    ✓
                  </span>
                  <span aria-hidden="true" className={`dinner-drop dinner-drop-${i} pointer-events-none absolute left-1/2 top-1/2 z-30 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0`} style={{ background: `radial-gradient(circle at 35% 35%, #fff8, ${look(p.id, i).color} 55%)` }} />
                </Link>
              </li>
            ))}
          </ul>
          <div className="dinner-cta mt-4 flex flex-col items-center md:mt-6 md:flex-row md:justify-start md:gap-3">
            <AddAll products={list} dish={recipe.title[m.lang]} variant="saffron" label={t.addIngredients(list.length, money(total, m))} />
            <Link href={`/${m.code}/recipes/${recipe.slug}`} className="whitespace-nowrap px-3 pt-2 text-sm font-semibold text-turmeric hover:underline md:py-3">
              {t.stepsTitle} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The cooking choreography, shared by desktop (scrubbed, unit = timeline progress) and phones
 * (plays once, unit = seconds). Positions are measured from the DOM, so it works at any size.
 */
export function buildDinner(
  _gsap: typeof import("gsap").default,
  tl: gsap.core.Timeline,
  u: number,
  { intro = true, cook = true, start = 0.26 }: { intro?: boolean; cook?: boolean; start?: number } = {},
) {
  const pot = document.querySelector<SVGSVGElement>(".dinner-kadai");
  const point = (i: number) => {
    // landing point of ingredient i, in px relative to its tile's centre
    const tile = document.querySelector<HTMLElement>(`.dinner-tile-${i}`)!.getBoundingClientRect();
    const r = pot!.getBoundingClientRect();
    const ex = r.left + (LAND[i].x / 400) * r.width - (tile.left + tile.width / 2);
    const ey = r.top + (LAND[i].y / 400) * r.height - (tile.top + tile.height / 2);
    return { ex, ey, mx: ex * 0.55, my: Math.min(ey, 0) - r.height * 0.32 };
  };
  if (intro) {
    tl.from(".film-d-word", { yPercent: 115, stagger: 0.02 * u, duration: 0.14 * u, ease: "power3.out" }, 0)
      .from(".dinner-sub", { autoAlpha: 0, y: 14, duration: 0.1 * u }, 0.08 * u)
      .from(".dinner-pot", { scale: 0.86, autoAlpha: 0, rotate: -12, duration: 0.16 * u, ease: "power2.out" }, 0.02 * u)
      .from(".dinner-slot", { y: 18, autoAlpha: 0, stagger: 0.015 * u, duration: 0.1 * u, ease: "power2.out" }, 0.08 * u) // the slot moves in; the tile inside is pressed while cooking
      .from(".dinner-cta", { autoAlpha: 0, y: 14, duration: 0.08 * u }, 0.2 * u);
  }
  if (!cook) return tl;

  for (let i = 0; i < 8; i++) {
    if (!document.querySelector(`.dinner-tile-${i}`)) continue;
    const t0 = (start + i * 0.065) * u;
    const fly = 0.07 * u;
    tl.set(`.dinner-drop-${i}`, { x: 0, y: 0, scale: 1, autoAlpha: 1 }, t0)
      .to(`.dinner-tile-${i}`, { scale: 0.9, duration: 0.02 * u, yoyo: true, repeat: 1, ease: "power1.inOut" }, t0)
      .to(`.dinner-drop-${i}`, { x: () => point(i).mx, duration: fly / 2, ease: "none" }, t0)
      .to(`.dinner-drop-${i}`, { y: () => point(i).my, duration: fly / 2, ease: "power2.out" }, t0)
      .to(`.dinner-drop-${i}`, { x: () => point(i).ex, duration: fly / 2, ease: "none" }, t0 + fly / 2)
      .to(`.dinner-drop-${i}`, { y: () => point(i).ey, scale: 0.6, duration: fly / 2, ease: "power2.in" }, t0 + fly / 2)
      .to(`.dinner-drop-${i}`, { autoAlpha: 0, duration: 0.01 * u }, t0 + fly)
      .fromTo(`.dal-ripple-${i}`, { scale: 0.3, opacity: 0.8, transformOrigin: "50% 50%" }, { scale: 3, opacity: 0, duration: 0.09 * u, ease: "power2.out", immediateRender: false }, t0 + fly)
      .fromTo(`.dal-seeds-${i} .dal-seed`, { opacity: 0, scale: 0, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, stagger: 0.004 * u, duration: 0.05 * u, ease: "back.out(2)" }, t0 + fly)
      .to(`.dinner-check-${i}`, { opacity: 1, duration: 0.03 * u }, t0 + fly)
      .to(".dal-deep", { opacity: 0.05 + i * 0.04, duration: 0.05 * u }, t0 + fly);
  }

  const sizzle = (start + 0.58) * u;
  tl.fromTo(".dal-bubble", { opacity: 0, scale: 0, transformOrigin: "50% 50%" }, { keyframes: [{ opacity: 0.9, scale: 1 }, { opacity: 0, scale: 1.4 }], stagger: { each: 0.006 * u, from: "random" }, duration: 0.08 * u }, sizzle)
    .fromTo(".dal-steam", { opacity: 0, y: 10 }, { opacity: 0.28, y: -18, stagger: 0.02 * u, duration: 0.12 * u, ease: "power1.out" }, sizzle + 0.02 * u);
  return tl;
}
