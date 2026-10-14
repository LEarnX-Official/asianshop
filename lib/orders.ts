"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MarketCode } from "./markets";
import type { Product } from "./types";

// Prototype order history, alerts and reminders, kept on this device (no backend yet).

export type OrderLine = { product: Product; qty: number; price: number };
export type Order = {
  id: string;
  createdAt: string; // ISO
  market: MarketCode;
  currency: "PLN" | "EUR";
  lines: OrderLine[];
  subtotal: number;
  deliveryCost: number;
  total: number;
  delivery: { id: string; label: string; arrive: [string, string] };
  payment: string;
  address: { firstName: string; lastName: string; street: string; postcode: string; city: string; country: "PL" | "DE"; email: string; phone: string };
  demo?: boolean;
};

type State = {
  orders: Order[];
  alerts: Product[];
  reminders: number[];
  seeded: boolean;
  hydrated: boolean;
  place: (o: Omit<Order, "id" | "createdAt">) => Order;
  toggleAlert: (p: Product) => void;
  hasAlert: (id: number) => boolean;
  toggleReminder: (id: number) => void;
  seedDemo: (o: Order[]) => void;
};

export const useOrders = create<State>()(
  persist(
    (set, get) => ({
      orders: [],
      alerts: [],
      reminders: [],
      seeded: false,
      hydrated: false,
      place: (o) => {
        const order: Order = { ...o, id: `AS-${String(Date.now()).slice(-6)}`, createdAt: new Date().toISOString() };
        set((s) => ({ orders: [order, ...s.orders] }));
        return order;
      },
      toggleAlert: (p) =>
        set((s) => ({ alerts: s.alerts.some((a) => a.id === p.id) ? s.alerts.filter((a) => a.id !== p.id) : [...s.alerts, p] })),
      hasAlert: (id) => get().alerts.some((a) => a.id === id),
      toggleReminder: (id) => set((s) => ({ reminders: s.reminders.includes(id) ? s.reminders.filter((x) => x !== id) : [...s.reminders, id] })),
      seedDemo: (o) => set((s) => (s.seeded ? s : { orders: [...s.orders, ...o], seeded: true })),
    }),
    {
      name: "asianshop-orders",
      partialize: (s) => ({ orders: s.orders, alerts: s.alerts, reminders: s.reminders, seeded: s.seeded }),
      skipHydration: true,
      onRehydrateStorage: () => () => useOrders.setState({ hydrated: true }),
    },
  ),
);

/** Simulated tracking: the parcel moves on as time passes since the order (demo orders are delivered). */
export function trackingStep(o: Order, now = Date.now()) {
  if (o.demo) return 3;
  const s = (now - new Date(o.createdAt).getTime()) / 1000;
  return s < 30 ? 0 : s < 90 ? 1 : s < 180 ? 2 : 3;
}

/** "Your usual": products bought in 2+ orders, with roughly how often. */
export function usualItems(orders: Order[]) {
  const seen = new Map<number, { product: Product; dates: number[]; qty: number }>();
  for (const o of orders) {
    for (const l of o.lines) {
      const e = seen.get(l.product.id) ?? { product: l.product, dates: [], qty: 0 };
      e.dates.push(new Date(o.createdAt).getTime());
      e.qty += l.qty;
      seen.set(l.product.id, e);
    }
  }
  return [...seen.values()]
    .filter((e) => e.dates.length >= 2)
    .map((e) => {
      const ds = e.dates.sort((a, b) => a - b);
      const gaps = ds.slice(1).map((d, i) => d - ds[i]);
      const weeks = Math.max(1, Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length / (7 * 86_400_000)));
      return { product: e.product, weeks, last: new Date(ds[ds.length - 1]).toISOString(), times: ds.length };
    })
    .sort((a, b) => b.times - a.times);
}
