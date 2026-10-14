"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { TODAY, money, shortDate } from "@/lib/format";
import { addWorkingDays, cityCoords } from "@/lib/delivery";
import { trackingStep, useOrders, usualItems, type Order } from "@/lib/orders";
import { useBasket } from "@/lib/basket";
import { useSession } from "@/lib/session";
import type { Product } from "@/lib/types";
import { useMarket, useT } from "../global/market-context";
import { PackImage } from "../product/pack-image";
import { ProductCard, productHref } from "../product/product-card";
import { AddAll } from "../home/add-all";

/* ------------------------------------------------------------ signed-in pages */

/** Account pages need a signed-in shopper; anyone else is sent to sign in and brought back here. */
function useRequireUser() {
  const m = useMarket();
  const router = useRouter();
  const hydrated = useSession((s) => s.hydrated);
  const user = useSession((s) => s.user);
  // Signing out from this page leads home, so only someone who arrives signed out is sent to sign in.
  const wasSignedIn = useRef(false);
  useEffect(() => {
    if (user) wasSignedIn.current = true;
    else if (hydrated && !wasSignedIn.current) router.replace(`/${m.code}/login?next=${encodeURIComponent(window.location.pathname)}`);
  }, [hydrated, user, router, m.code]);
  return hydrated ? user : null;
}

/* ------------------------------------------------------------ demo history (prototype only) */

function demoOrders(products: Product[], market: ReturnType<typeof useMarket>): Order[] {
  const pick = (ids: number[]) => ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p);
  const baskets = [
    { weeksAgo: 15, ids: [1483, 216, 1674, 1748, 488] },
    { weeksAgo: 10, ids: [1483, 1674, 1120, 488, 1911] },
    { weeksAgo: 5, ids: [216, 1674, 1748, 1911, 1120] },
  ];
  return baskets.map(({ weeksAgo, ids }, i) => {
    const created = new Date(TODAY.getTime() - weeksAgo * 7 * 86_400_000);
    const lines = pick(ids).map((p) => ({ product: p, qty: p.size?.includes("kg") && parseFloat(p.size) >= 5 ? 1 : 2, price: market.currency === "PLN" ? p.price.pln : p.price.eur }));
    const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
    return {
      id: `AS-DEMO${i + 1}`,
      createdAt: created.toISOString(),
      market: market.code,
      currency: market.currency,
      lines,
      subtotal,
      deliveryCost: 0,
      total: subtotal,
      delivery: { id: "inpost-locker", label: "InPost Paczkomat 24/7", arrive: [addWorkingDays(1, created).toISOString(), addWorkingDays(2, created).toISOString()] },
      payment: "BLIK",
      address: { firstName: "Priya", lastName: "S.", street: "ul. Długa 12", postcode: "31-147", city: "Kraków", country: "PL", email: "demo@example.com", phone: "500 000 000" },
      demo: true,
    };
  });
}

function useSeed(products: Product[]) {
  const m = useMarket();
  const hydrated = useOrders((s) => s.hydrated);
  const seeded = useOrders((s) => s.seeded);
  const seedDemo = useOrders((s) => s.seedDemo);
  useEffect(() => {
    if (hydrated && !seeded) seedDemo(demoOrders(products, m));
  }, [hydrated, seeded, seedDemo, products, m]);
}

const STEP_KEYS = ["stPacked", "stOnWay", "stOut", "stDelivered"] as const;

/* ------------------------------------------------------------ account home (G4) */

export function AccountView({ demoProducts }: { demoProducts: Product[] }) {
  useSeed(demoProducts);
  const m = useMarket();
  const t = useT();
  const hydrated = useOrders((s) => s.hydrated);
  const orders = useOrders((s) => s.orders);
  const alerts = useOrders((s) => s.alerts);
  const toggleAlert = useOrders((s) => s.toggleAlert);
  const usual = usualItems(orders).slice(0, 4);
  const user = useRequireUser();
  const signOut = useSession((s) => s.signOut);
  const router = useRouter();
  if (!hydrated || !user) return <div className="min-h-[60vh]" />;
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-saffron-text">{t.accountTitle}</p>
          <h1 className="mt-2 font-serif text-5xl font-medium tracking-tight">{t.hello(user.name)}</h1>
          <p className="mt-2 text-sm text-ink-soft">{t.signedInAs(user.email)}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            signOut();
            router.push(`/${m.code}`);
          }}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:bg-stone"
        >
          {t.signOut}
        </button>
      </div>
      <p className="mt-4 text-sm text-ink-muted">{t.demoHistory}</p>

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl">{t.usualTitle}</h2>
            <p className="mt-1 text-ink-soft">{t.usualSub}</p>
          </div>
          {usual.length ? <AddAll products={usual.map((u) => u.product)} /> : null}
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {usual.map((u) => (
            <li key={u.product.id} className="flex flex-col gap-1.5">
              <ProductCard product={u.product} />
              <p className="px-1 text-xs text-cardamom">{t.everyWeeks(u.weeks)}</p>
            </li>
          ))}
        </ul>
        <Link href={`/${m.code}/account/usual`} className="mt-4 inline-block text-sm font-semibold text-saffron-text hover:underline">
          {t.usualTitle} →
        </Link>
      </section>

      <section className="mt-14">
        <h2 className="mb-5 font-serif text-3xl">{t.ordersTitle}</h2>
        {orders.length ? (
          <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-warm">
            {orders.map((o) => {
              const step = trackingStep(o);
              return (
                <li key={o.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <div className="min-w-40">
                    <p className="font-semibold">{o.id}</p>
                    <p className="text-sm text-ink-muted">{shortDate(o.createdAt.slice(0, 10), m)}</p>
                  </div>
                  <div className="flex -space-x-3">
                    {o.lines.slice(0, 5).map((l) => (
                      <PackImage key={l.product.id} src={l.product.image} alt="" brand={l.product.brand} className="h-11 w-11 rounded-lg ring-2 ring-warm" sizes="44px" />
                    ))}
                  </div>
                  <p className={`text-sm font-medium ${step === 3 ? "text-cardamom" : "text-saffron-deep"}`}>● {t[STEP_KEYS[step]]}</p>
                  <p className="tabular ml-auto font-semibold">{money(o.total, m)}</p>
                  <Link href={`/${m.code}/account/orders/${o.id}`} className="rounded-full border border-line px-4 py-2 text-sm font-semibold hover:bg-stone">
                    {t.viewOrder}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-ink-soft">{t.noOrders}</p>
        )}
      </section>

      <section className="mt-14">
        <h2 className="mb-5 font-serif text-3xl">{t.alertsTitle}</h2>
        {alerts.length ? (
          <ul className="flex flex-col gap-2">
            {alerts.map((p) => (
              <li key={p.id} className="flex items-center gap-4 rounded-xl border border-line bg-warm px-4 py-3">
                <PackImage src={p.image} alt="" brand={p.brand} className="h-12 w-12 rounded-lg" sizes="48px" />
                <Link href={productHref(m.code, p)} className="flex-1 hover:underline">
                  {p.brand} {p.title[m.lang]}
                </Link>
                <button type="button" onClick={() => toggleAlert(p)} className="text-sm font-semibold text-saffron-text">
                  {t.removeAlert}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-soft">{t.noAlerts}</p>
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------ Your usual (G2) */

export function UsualView({ demoProducts }: { demoProducts: Product[] }) {
  useSeed(demoProducts);
  const m = useMarket();
  const t = useT();
  const hydrated = useOrders((s) => s.hydrated);
  const orders = useOrders((s) => s.orders);
  const reminders = useOrders((s) => s.reminders);
  const toggleReminder = useOrders((s) => s.toggleReminder);
  const add = useBasket((s) => s.add);
  const usual = usualItems(orders);
  const user = useRequireUser();
  if (!hydrated || !user) return <div className="min-h-[60vh]" />;
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6">
      <Link href={`/${m.code}/account`} className="text-sm text-ink-muted hover:underline">
        ← {t.accountTitle}
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-5xl font-medium tracking-tight">{t.usualTitle}</h1>
          <p className="mt-2 text-ink-soft">{t.usualSub}</p>
        </div>
        {usual.length ? <AddAll products={usual.map((u) => u.product)} variant="saffron" /> : null}
      </div>
      <ul className="mt-8 divide-y divide-line rounded-[var(--radius-card)] border border-line bg-warm">
        {usual.map((u) => (
          <li key={u.product.id} className="flex flex-wrap items-center gap-4 px-4 py-4">
            <PackImage src={u.product.image} alt="" brand={u.product.brand} className="h-16 w-16 rounded-xl" sizes="64px" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-saffron-text">{u.product.brand}</p>
              <Link href={productHref(m.code, u.product)} className="block truncate hover:underline">
                {u.product.title[m.lang]} · {u.product.size}
              </Link>
              <p className="text-sm text-cardamom">
                {t.everyWeeks(u.weeks)} · {t.lastOrdered(shortDate(u.last.slice(0, 10), m))}
              </p>
            </div>
            <button
              type="button"
              aria-pressed={reminders.includes(u.product.id)}
              onClick={() => toggleReminder(u.product.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium ${reminders.includes(u.product.id) ? "border-cardamom bg-cardamom/10 text-cardamom" : "border-line hover:bg-stone"}`}
            >
              {reminders.includes(u.product.id) ? `✓ ${t.reminded}` : t.remindMe}
            </button>
            <button type="button" onClick={() => add(u.product)} className="rounded-full bg-saffron px-5 py-2 text-sm font-semibold text-white hover:bg-saffron-deep">
              {t.add}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------ Tracking (G1, Script S15) */

const proj = (lat: number, lon: number) => ({ x: ((lon - 3) / 21) * 1000, y: ((56.2 - lat) / 9) * 600 });
const KRK = proj(50.06, 19.94);
// Faint reference cities so the map reads as Europe.
const REF: [string, number, number][] = [
  ["Warszawa", 52.23, 21.01], ["Gdańsk", 54.35, 18.65], ["Poznań", 52.41, 16.93], ["Wrocław", 51.11, 17.03], ["Praha", 50.08, 14.44],
  ["Berlin", 52.52, 13.4], ["Hamburg", 53.55, 9.99], ["München", 48.14, 11.58], ["Köln", 50.94, 6.96], ["Wien", 48.21, 16.37],
];

export function TrackingView({ id }: { id: string }) {
  const m = useMarket();
  const t = useT();
  const hydrated = useOrders((s) => s.hydrated);
  const order = useOrders((s) => s.orders.find((o) => o.id === id));
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(iv);
  }, []);
  if (!hydrated) return <div className="min-h-[60vh]" />;
  if (!order) return <p className="py-24 text-center font-serif text-3xl">{t.notFoundTitle}</p>;
  const step = trackingStep(order, now);
  const [lat, lon] = cityCoords(order.address.city || (order.address.country === "PL" ? "Warszawa" : "Berlin"), order.address.country);
  const dest = proj(lat, lon);
  const cx = (KRK.x + dest.x) / 2;
  const cy = Math.min(KRK.y, dest.y) - 90;
  const progress = [0.06, 0.5, 0.86, 1][step];
  // Same-city orders (e.g. Kraków) are local deliveries: a ring around the warehouse instead of a route.
  const local = Math.hypot(dest.x - KRK.x, dest.y - KRK.y) < 25;
  const q = (tt: number) => ({
    x: (1 - tt) ** 2 * KRK.x + 2 * (1 - tt) * tt * cx + tt ** 2 * dest.x,
    y: (1 - tt) ** 2 * KRK.y + 2 * (1 - tt) * tt * cy + tt ** 2 * dest.y,
  });
  const parcel = local ? { x: KRK.x + 34 * Math.cos(progress * 2 * Math.PI - Math.PI / 2), y: KRK.y + 34 * Math.sin(progress * 2 * Math.PI - Math.PI / 2) } : q(progress);
  const path = `M${KRK.x} ${KRK.y} Q${cx} ${cy} ${dest.x} ${dest.y}`;
  const stepTime = (i: number) => {
    const d = new Date(new Date(order.createdAt).getTime() + [0, 30, 90, 180][i] * 1000);
    return order.demo ? shortDate(order.delivery.arrive[0].slice(0, 10), m) : d.toLocaleTimeString(m.textLocale, { hour: "2-digit", minute: "2-digit" });
  };
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
      <Link href={`/${m.code}/account`} className="text-sm text-ink-muted hover:underline">
        ← {t.accountTitle}
      </Link>
      <h1 className="mt-3 font-serif text-5xl font-medium tracking-tight">{t.trackTitle}</h1>
      <p className="mt-2 text-ink-soft">
        {order.id} · {order.delivery.label} · {order.address.city}
      </p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[var(--radius-card)] border border-line bg-[#f3ebdd] p-4">
          <svg viewBox="0 0 1000 600" className="w-full" role="img" aria-label={`Kraków → ${order.address.city}: ${t[STEP_KEYS[step]]}`}>
            {Array.from({ length: 10 }, (_, i) => (
              <line key={`v${i}`} x1={i * 111} y1="0" x2={i * 111} y2="600" stroke="#e2d5c0" />
            ))}
            {Array.from({ length: 6 }, (_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 120} x2="1000" y2={i * 120} stroke="#e2d5c0" />
            ))}
            {REF.map(([name, la, lo]) => {
              const c = proj(la, lo);
              return (
                <g key={name} opacity="0.55">
                  <circle cx={c.x} cy={c.y} r="4" fill="#a99a84" />
                  <text x={c.x + 8} y={c.y + 5} fontSize="15" fill="#8c8070">{name}</text>
                </g>
              );
            })}
            {local ? null : <path d={path} fill="none" stroke="#c9b9a1" strokeWidth="3" strokeDasharray="6 10" />}
            {local ? (
              <motion.circle cx={KRK.x} cy={KRK.y} r="34" fill="none" stroke="#c8611e" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: progress }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }} />
            ) : (
              <motion.path d={path} fill="none" stroke="#c8611e" strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: progress }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }} />
            )}
            <circle cx={KRK.x} cy={KRK.y} r="10" fill="#1f1a17" />
            <text x={KRK.x + 14} y={KRK.y + 26} fontSize="22" fontWeight="700" fill="#1f1a17">Kraków</text>
            {local ? null : (
              <>
                <circle cx={dest.x} cy={dest.y} r="10" fill="#1e5f5b" />
                <text x={dest.x + 14} y={dest.y - 12} fontSize="22" fontWeight="700" fill="#1e5f5b">{order.address.city}</text>
              </>
            )}
            <motion.g initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.3, duration: 0.3 }} style={{ transformOrigin: `${parcel.x}px ${parcel.y}px` }}>
              <rect x={parcel.x - 16} y={parcel.y - 16} width="32" height="32" rx="6" fill="#c8611e" />
              <path d={`M${parcel.x - 16} ${parcel.y - 4} h32 M${parcel.x} ${parcel.y - 16} v12`} stroke="#fffaf1" strokeWidth="3" />
            </motion.g>
          </svg>
        </div>
        <ol className="flex flex-col gap-1">
          {STEP_KEYS.map((k, i) => (
            <li key={k} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-semibold ${i <= step ? "bg-cardamom text-white" : "bg-stone text-ink-muted"}`}>{i < step ? "✓" : i + 1}</span>
                {i < 3 ? <span className={`h-10 w-0.5 ${i < step ? "bg-cardamom" : "bg-line"}`} /> : null}
              </div>
              <div className="pt-1">
                <p className={i === step ? "font-semibold" : i < step ? "" : "text-ink-muted"}>{t[k]}</p>
                {i <= step ? <p className="text-sm text-ink-muted">{stepTime(i)}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-6 text-xs text-ink-muted">{t.demoTracking}</p>
    </div>
  );
}
