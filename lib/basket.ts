"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./types";

export type Line = { product: Product; qty: number };
export type Toast = { id: number; kind: "added" | "removed" | "bulk"; text: string; productId?: number; undo?: () => void };

type State = {
  lines: Record<number, Line>;
  order: number[];
  drawerOpen: boolean;
  toasts: Toast[];
  hydrated: boolean;
  add: (product: Product, qty?: number) => void;
  addMany: (products: Product[]) => void;
  setQty: (id: number, qty: number) => void;
  remove: (id: number) => Line | null;
  restore: (line: Line, index: number) => void;
  openDrawer: (open: boolean) => void;
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
};

let toastSeq = 1;

export const useBasket = create<State>()(
  persist(
    (set, get) => ({
      lines: {},
      order: [],
      drawerOpen: false,
      toasts: [],
      hydrated: false,
      add: (product, qty = 1) =>
        set((s) => {
          const line = s.lines[product.id];
          return {
            lines: { ...s.lines, [product.id]: { product, qty: (line?.qty ?? 0) + qty } },
            order: line ? s.order : [...s.order, product.id],
          };
        }),
      addMany: (products) =>
        set((s) => {
          const lines = { ...s.lines };
          const order = [...s.order];
          for (const p of products) {
            if (lines[p.id]) lines[p.id] = { ...lines[p.id], qty: lines[p.id].qty + 1 };
            else {
              lines[p.id] = { product: p, qty: 1 };
              order.push(p.id);
            }
          }
          return { lines, order };
        }),
      setQty: (id, qty) =>
        set((s) => {
          if (!s.lines[id]) return s;
          if (qty <= 0) {
            const rest = { ...s.lines };
            delete rest[id];
            return { lines: rest, order: s.order.filter((x) => x !== id) };
          }
          return { lines: { ...s.lines, [id]: { ...s.lines[id], qty } } };
        }),
      remove: (id) => {
        const line = get().lines[id] ?? null;
        get().setQty(id, 0);
        return line;
      },
      restore: (line, index) =>
        set((s) => {
          const order = s.order.filter((x) => x !== line.product.id);
          order.splice(Math.min(index, order.length), 0, line.product.id);
          return { lines: { ...s.lines, [line.product.id]: line }, order };
        }),
      openDrawer: (open) => set({ drawerOpen: open }),
      pushToast: (t) =>
        set((s) => ({ toasts: [...s.toasts.slice(-1), { ...t, id: toastSeq++ }] })), // at most 2 stacked (S9.3)
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: "asianshop-basket",
      partialize: (s) => ({ lines: s.lines, order: s.order }),
      skipHydration: true,
      onRehydrateStorage: () => () => useBasket.setState({ hydrated: true }),
    },
  ),
);

export function basketCount(lines: Record<number, Line>) {
  return Object.values(lines).reduce((n, l) => n + l.qty, 0);
}

export function basketTotal(lines: Record<number, Line>, currency: "PLN" | "EUR") {
  return Object.values(lines).reduce((sum, l) => sum + l.qty * (currency === "PLN" ? l.product.price.pln : l.product.price.eur), 0);
}
