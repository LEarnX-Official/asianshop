"use client";

import Link from "next/link";
import type { Brand, Product } from "@/lib/types";
import { shortDate } from "@/lib/format";
import { useMarket, useT } from "../global/market-context";
import { MaskedWords } from "./kitchen";
import { Seal } from "../global/brand";

const Cutout = ({ id, className = "", style }: { id: number; className?: string; style?: React.CSSProperties }) => (
  // eslint-disable-next-line @next/next/no-img-element -- transparent cut-outs from our pipeline
  <img src={`/products/cutout/${id}.webp`} alt="" className={className} style={style} loading="lazy" draggable={false} />
);

/* ---------------------------------------------------------------- Scene 3: the brands you grew up with */

export type BrandBay = { brand: Brand; pack: Product };

export function BrandsScene({ bays, foreground }: { bays: BrandBay[]; foreground: number[] }) {
  const m = useMarket();
  const t = useT();
  return (
    <section className="film-brands relative h-svh overflow-hidden bg-[radial-gradient(ellipse_at_50%_35%,#3a2b21_0%,#211a15_60%,#17120f_100%)] text-linen" aria-label={t.brandsTitle}>
      <div className="grain" />
      <div className="relative z-10 mx-auto max-w-[1280px] px-5 pt-[132px] sm:px-8 md:pt-[13vh]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-turmeric">{t.brandsFromHome}</p>
        <h2 className="mt-3 max-w-3xl font-serif text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
          <MaskedWords text={t.brandsTitle} wordClass="film-b-word" />
        </h2>
        <p className="film-b-sub mt-3 max-w-xl text-[15px] text-linen/70 md:mt-4 md:text-base">{t.brandsSub}</p>
      </div>
      <div className="brand-viewport no-scrollbar absolute inset-x-0 bottom-[5svh] top-[47svh] md:bottom-[6vh] md:top-[40vh]">
        <div className="brand-track relative flex h-full w-max items-end gap-[8vw] pl-[18vw] pr-[18vw] md:gap-[4vw] md:pl-[8vw] md:pr-[20vw]">
          {bays.map(({ brand, pack }) => (
            <Link
              key={brand.name}
              href={`/${m.code}/brand/${brand.slug}`}
              className="brand-bay group relative flex h-full w-[64vw] shrink-0 flex-col items-center justify-end sm:w-[30vw] lg:w-[22vw]"
            >
              <div className="relative flex h-[58%] w-full items-end justify-center md:h-[62%]">
                <div className="absolute bottom-0 h-[30%] w-[70%] rounded-[50%] bg-[radial-gradient(#ffd79a55,transparent_70%)] blur-xl transition-opacity group-hover:opacity-100" />
                <Cutout id={pack.id} className="brand-pack relative h-full w-auto max-w-[90%] object-contain drop-shadow-[0_24px_30px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:-translate-y-2" />
              </div>
              <div className="mt-[2.5svh] h-3 w-full rounded-sm bg-[linear-gradient(#8e6141,#5d3d27)]" />
              <p className="mt-4 font-serif text-3xl sm:text-4xl md:mt-5">{brand.name}</p>
              <p className="mt-1 text-center text-sm text-linen/60">
                {pack.title[m.lang]} · {t.brandProducts(brand.count)} <span className="text-turmeric">→</span>
              </p>
            </Link>
          ))}
        </div>
        {/* out-of-focus foreground jars passing faster: depth */}
        <div aria-hidden="true" className="brand-fore pointer-events-none absolute inset-y-0 left-0 flex w-max items-end gap-[38vw] pl-[30vw]">
          {foreground.map((id, i) => (
            <Cutout key={i} id={id} className="h-[120%] w-auto translate-y-[62%] opacity-80 blur-[16px] brightness-[0.3] saturate-[0.6]" />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Scene 4: freshness you can see */

function Roller({ digits }: { digits: string }) {
  return (
    <span className="inline-flex">
      {digits.split("").map((d, i) =>
        /\d/.test(d) ? (
          <span key={i} className="relative inline-block h-[1.15em] w-[0.62em] overflow-hidden">
            <span className="fresh-roll absolute left-0 top-0 flex flex-col" data-digit={d}>
              {Array.from({ length: 10 }, (_, n) => (
                <span key={n} className="h-[1.15em] leading-[1.15em]">
                  {n}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i} className="inline-block w-[0.4em] text-center">
            {d}
          </span>
        ),
      )}
    </span>
  );
}

export function FreshnessScene({ product }: { product: Product }) {
  const m = useMarket();
  const t = useT();
  const d = new Date(`${product.bestBefore}T12:00:00Z`);
  const digits = `${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${d.getUTCFullYear()}`;
  return (
    <section className="film-fresh relative h-svh overflow-hidden bg-linen" aria-label={t.freshnessTitle}>
      <div aria-hidden="true" className="fresh-bignum pointer-events-none absolute -right-[6vw] top-[68%] -translate-y-1/2 select-none font-serif text-[62vw] leading-none text-[#efe4d2] md:-right-[4vw] md:top-1/2 md:text-[34vw]">
        15
      </div>
      <div className="relative z-10 mx-auto grid h-full max-w-[1280px] content-center items-center gap-5 px-5 pt-[96px] sm:px-8 md:grid-cols-2 md:gap-6 md:pt-0">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cardamom">{t.freshEyebrow}</p>
          <h2 className="mt-3 font-serif text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
            <MaskedWords text={t.freshnessTitle} wordClass="film-f-word" />
          </h2>
          <p className="fresh-body mt-4 max-w-md text-base leading-relaxed text-ink-soft md:mt-5 md:text-lg">{t.freshBody}</p>
        </div>
        <div className="relative flex h-[min(84vw,40svh)] items-center justify-center sm:h-[min(60vw,40svh)] md:h-[70vh]" style={{ perspective: "1200px" }}>
          <div className="fresh-pack relative h-full">
            <Cutout id={product.id} className="h-full w-auto drop-shadow-[0_40px_40px_rgba(80,40,10,0.28)]" />
            <div className="fresh-stamp absolute -right-[10%] bottom-[8%] md:-right-[18%] md:bottom-[12%] rotate-[-7deg] rounded-2xl border-[3px] border-cardamom bg-[#f4faf6]/95 px-5 py-3 text-cardamom shadow-lift backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em]">{t.bestBefore}</p>
              <p className="tabular font-serif text-3xl font-semibold sm:text-4xl" aria-label={shortDate(product.bestBefore, m)}>
                <Roller digits={digits} />
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-cardamom/70">{t.demoDate}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Scene 6: from Kraków to your door */

const CITIES = {
  krakow: { name: "Kraków", lat: 50.06, lon: 19.94 },
  warsaw: { name: "Warszawa", lat: 52.23, lon: 21.01 },
  wroclaw: { name: "Wrocław", lat: 51.11, lon: 17.03 },
  gdansk: { name: "Gdańsk", lat: 54.35, lon: 18.65 },
  poznan: { name: "Poznań", lat: 52.41, lon: 16.93 },
  berlin: { name: "Berlin", lat: 52.52, lon: 13.4 },
  hamburg: { name: "Hamburg", lat: 53.55, lon: 9.99 },
  munich: { name: "München", lat: 48.14, lon: 11.58 },
  frankfurt: { name: "Frankfurt", lat: 50.11, lon: 8.68 },
  cologne: { name: "Köln", lat: 50.94, lon: 6.96 },
};
const SOON = [
  { name: "Praha", lat: 50.08, lon: 14.44 },
  { name: "Wien", lat: 48.21, lon: 16.37 },
  { name: "Amsterdam", lat: 52.37, lon: 4.9 },
  { name: "København", lat: 55.68, lon: 12.57 },
];
// simple equirectangular view of central Europe
const proj = (lat: number, lon: number) => ({ x: ((lon - 3) / 21) * 1000, y: ((56.2 - lat) / 9) * 600 });

export function EuropeScene() {
  const t = useT();
  const k = proj(CITIES.krakow.lat, CITIES.krakow.lon);
  const live = Object.entries(CITIES).filter(([key]) => key !== "krakow");
  return (
    <section className="film-europe relative overflow-hidden bg-[#f3ebdd] py-24" aria-label={t.europeTitle}>
      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8">
        {/* phones: the map is too small for it, so the seal sits beside the title */}
        <div className="eu-seal pointer-events-none absolute -top-6 right-4 w-[92px] rotate-[-8deg] text-ink sm:right-8 sm:w-[110px] md:hidden">
          <Seal className="h-auto w-full" />
        </div>
        <div className="grid items-end gap-6 md:grid-cols-2">
          <h2 className="font-serif text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
            <MaskedWords text={t.europeTitle} wordClass="film-e-word" />
          </h2>
          <div>
            <p className="max-w-md text-lg text-ink-soft">{t.europeSub}</p>
            <p className="mt-4 flex gap-5 text-sm">
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-saffron" /> {t.liveNow}</span>
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full border-2 border-ink-muted" /> {t.comingSoon}</span>
            </p>
          </div>
        </div>
        <div className="relative mt-10 overflow-hidden">
        {/* the last frame of the film: the shop's seal stamped on the map's empty corner, like a postmark */}
        <div className="eu-seal pointer-events-none absolute bottom-[3%] left-[2%] z-10 hidden w-[13%] rotate-[-8deg] text-ink md:block">
          <Seal className="h-auto w-full drop-shadow-[0_6px_14px_rgba(80,50,20,0.18)]" />
        </div>
        <svg viewBox="0 0 1000 600" className="eu-map -ml-[16%] w-[118%] max-w-none md:ml-0 md:w-full" role="img" aria-label={`${t.europeTitle} ${live.map(([, c]) => c.name).join(", ")}`}>
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`v${i}`} x1={i * 111} y1="0" x2={i * 111} y2="600" stroke="#e2d5c0" strokeWidth="1" />
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 120} x2="1000" y2={i * 120} stroke="#e2d5c0" strokeWidth="1" />
          ))}
          {SOON.map((c) => {
            const p = proj(c.lat, c.lon);
            return (
              <g key={c.name} className="eu-soon">
                <path d={`M${k.x} ${k.y} Q${(k.x + p.x) / 2} ${Math.min(k.y, p.y) - 80} ${p.x} ${p.y}`} fill="none" stroke="#b9ab95" strokeWidth="1.5" strokeDasharray="4 8" />
                <circle cx={p.x} cy={p.y} r="6" fill="#f3ebdd" stroke="#9a8d7a" strokeWidth="2" />
                <text x={p.x + 10} y={p.y + 4} fontSize="16" fill="#8c8070" fontFamily="var(--font-dm-sans)">{c.name}</text>
              </g>
            );
          })}
          {live.map(([key, c]) => {
            const p = proj(c.lat, c.lon);
            return (
              <g key={key}>
                <path className="eu-route" pathLength={1} d={`M${k.x} ${k.y} Q${(k.x + p.x) / 2} ${Math.min(k.y, p.y) - 90} ${p.x} ${p.y}`} fill="none" stroke="#c8611e" strokeWidth="2.5" strokeLinecap="round" />
                <circle className="eu-city" cx={p.x} cy={p.y} r="7" fill="#c8611e" />
                {/* the easternmost city's label sits to the left of its dot so it never clips */}
                <text className="eu-label" x={p.x > 820 ? p.x - 8 : p.x + 12} y={p.x > 820 ? p.y + 40 : p.y + 5} textAnchor={p.x > 820 ? "end" : "start"} fontSize="18" fontWeight="600" fill="#1f1a17" fontFamily="var(--font-dm-sans)">{c.name}</text>
              </g>
            );
          })}
          <circle cx={k.x} cy={k.y} r="22" fill="#c8611e" opacity="0.15" className="eu-pulse" />
          <circle cx={k.x} cy={k.y} r="11" fill="#1f1a17" />
          <text x={k.x + 18} y={k.y + 26} fontSize="22" fontWeight="700" fill="#1f1a17" fontFamily="var(--font-dm-sans)">{CITIES.krakow.name}</text>
        </svg>
        </div>
      </div>
    </section>
  );
}
