"use client";

import { createContext, useContext, useEffect } from "react";
import { getMarket, type MarketCode } from "@/lib/markets";
import { dict } from "@/lib/i18n";
import { useBasket } from "@/lib/basket";
import { useOrders } from "@/lib/orders";
import { useSession } from "@/lib/session";

const MarketContext = createContext<MarketCode>("pl-pl");

export function MarketProvider({ code, children }: { code: MarketCode; children: React.ReactNode }) {
  useEffect(() => {
    // The basket lives on this device; load it after hydration so server and client agree.
    useBasket.persist.rehydrate();
    useOrders.persist.rehydrate();
    useSession.persist.rehydrate();
  }, []);
  return <MarketContext.Provider value={code}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  return getMarket(useContext(MarketContext));
}

export function useT() {
  return dict(useMarket().lang);
}
