"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { money } from "@/lib/format";
import { dayLabel } from "@/lib/delivery";
import { useOrders } from "@/lib/orders";
import type { Recipe } from "@/lib/types";
import { useMarket, useT } from "../global/market-context";
import { Seal } from "../global/brand";

/** The chai still life: the cup settles, steam draws upward, then rises three times and rests. */
export function ChaiStillLife({ className = "" }: { className?: string }) {
  const settle = [0.22, 1, 0.36, 1] as const;
  return (
    <svg aria-hidden="true" viewBox="0 0 240 240" className={className}>
      <defs>
        <radialGradient id="tea" cx="0.45" cy="0.4">
          <stop offset="0" stopColor="#c98a4e" />
          <stop offset="1" stopColor="#8f5326" />
        </radialGradient>
      </defs>
      <motion.g initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 26 }}>
        <ellipse cx="120" cy="206" rx="86" ry="14" fill="#e3cfb2" />
        <ellipse cx="120" cy="200" rx="76" ry="11" fill="#f3e6d1" stroke="#dcc6a6" strokeWidth="2" />
        <path d="M52 112 h136 l-12 66 a28 28 0 0 1 -28 22 h-56 a28 28 0 0 1 -28 -22 Z" fill="#fbf5ea" stroke="#d9c6ac" strokeWidth="3" />
        <path d="M186 128 c30 0 30 44 -4 44" fill="none" stroke="#d9c6ac" strokeWidth="11" strokeLinecap="round" />
        <ellipse cx="120" cy="112" rx="68" ry="12" fill="url(#tea)" />
        <path d="M66 140 h108" stroke="#c8611e" strokeWidth="4" opacity="0.55" />
        <path d="M74 152 h92" stroke="#e8964f" strokeWidth="3" opacity="0.4" />
      </motion.g>
      {[
        "M92 96 c-14 -18 14 -26 0 -46",
        "M120 92 c-14 -18 14 -26 0 -50",
        "M148 96 c-14 -18 14 -26 0 -46",
      ].map((d, i) => (
        <motion.path
          key={d}
          d={d}
          fill="none"
          stroke="#c9a77f"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1], opacity: [0, 0.6, 0], y: [6, -4, -22] }}
          transition={{ duration: 2.4, delay: 0.4 + i * 0.15, repeat: 2, ease: "easeInOut", times: [0, 0.4, 1] }}
        />
      ))}
      {[
        "M92 96 c-14 -18 14 -26 0 -46",
        "M120 92 c-14 -18 14 -26 0 -50",
        "M148 96 c-14 -18 14 -26 0 -46",
      ].map((d, i) => (
        <motion.path
          key={`rest-${d}`}
          d={d}
          fill="none"
          stroke="#c9a77f"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.4 + i * 0.15 + 7.4, duration: 0.8, ease: settle }}
        />
      ))}
    </svg>
  );
}

/** S13 Order confirmed — the emotional peak, in the warmest light of the journey. */
export function OrderConfirmed({ id, recipes }: { id: string; recipes: Recipe[] }) {
  const m = useMarket();
  const t = useT();
  const hydrated = useOrders((s) => s.hydrated);
  const order = useOrders((s) => s.orders.find((o) => o.id === id));
  if (!hydrated) return <div className="min-h-[70vh]" />;
  if (!order) {
    return (
      <div className="mx-auto max-w-xl py-24 text-center">
        <p className="font-serif text-3xl">{t.notFoundTitle}</p>
        <Link href={`/${m.code}`} className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-linen">
          {t.backToShop}
        </Link>
      </div>
    );
  }
  const ids = new Set(order.lines.map((l) => l.product.id));
  const best = [...recipes].map((r) => ({ r, hit: r.ingredients.filter((x) => ids.has(x)).length })).sort((a, b) => b.hit - a.hit)[0];
  const [a, b] = order.delivery.arrive.map((d) => dayLabel(new Date(d), m));
  const rise = (delay: number) => ({ initial: { y: 8, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay, duration: 0.25, ease: [0.22, 1, 0.36, 1] as const } });
  return (
    <section className="relative flex min-h-[calc(100dvh-112px)] flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_38%,#fff4e2_0%,#fbeedb_35%,var(--color-linen)_75%)] px-5 py-16 text-center">
      <div className="relative">
        <ChaiStillLife className="h-[180px] w-[180px] sm:h-[240px] sm:w-[240px]" />
        {/* the parcel is sealed: the shop's seal presses on like a sticker */}
        <motion.div
          initial={{ scale: 1.8, opacity: 0, rotate: -34 }}
          animate={{ scale: 1, opacity: 1, rotate: -10 }}
          transition={{ delay: 0.9, duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
          className="absolute -right-12 -top-2 w-[84px] rounded-full bg-[#fffaf1]/90 text-ink shadow-lift sm:-right-16 sm:w-[104px]"
        >
          <Seal className="h-auto w-full" />
        </motion.div>
      </div>
      <motion.h1 {...rise(0.3)} className="mt-6 max-w-2xl font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
        {t.onItsWay}
      </motion.h1>
      <motion.p {...rise(0.45)} className="mt-4 text-lg text-ink-soft">
        {t.expectedLine(a === b ? a : `${a}–${b}`)}
      </motion.p>
      <motion.p {...rise(0.45)} className="mt-2 text-sm text-ink-muted">
        {t.orderNo} {order.id} · {order.delivery.label} · {money(order.total, { ...m, currency: order.currency })}
      </motion.p>
      <motion.div {...rise(0.6)} className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={`/${m.code}/account/orders/${order.id}`} className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-linen hover:bg-ink-soft">
          {t.trackParcel}
        </Link>
        <Link href={`/${m.code}`} className="rounded-full border border-ink px-6 py-3 text-sm font-semibold hover:bg-ink hover:text-linen">
          {t.continueShopping}
        </Link>
      </motion.div>
      {best && best.hit > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.3 }} className="mt-10">
          <Link href={`/${m.code}/recipes/${best.r.slug}`} className="inline-flex items-center gap-3 rounded-2xl border border-line bg-warm px-5 py-4 text-left hover:shadow-lift">
            <span aria-hidden="true" className="text-2xl">🍲</span>
            <span className="text-sm">{t.recipeIdea(best.r.title[m.lang])}</span>
            <span aria-hidden="true" className="text-saffron-text">→</span>
          </Link>
        </motion.div>
      ) : null}
    </section>
  );
}
