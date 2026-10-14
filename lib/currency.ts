"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Currency } from "./markets";

// The shopper's currency choice, kept on this device. null = the country's own currency.
// Loaded after hydration (see MarketProvider), so the first render matches the server's HTML.
type State = { currency: Currency | null; setCurrency: (c: Currency | null) => void };

export const useCurrency = create<State>()(
  persist(
    (set) => ({
      currency: null,
      setCurrency: (currency) => set({ currency }),
    }),
    { name: "asianshop-currency", partialize: (s) => ({ currency: s.currency }), skipHydration: true },
  ),
);
