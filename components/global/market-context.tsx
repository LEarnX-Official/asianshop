"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { getMarket, withCurrency, type MarketCode } from "@/lib/markets";
import { dict } from "@/lib/i18n";
import { useBasket } from "@/lib/basket";
import { useOrders } from "@/lib/orders";
import { useSession } from "@/lib/session";
import { useCurrency } from "@/lib/currency";

const MarketContext = createContext<MarketCode>("pl-pl");

export function MarketProvider({ code, children }: { code: MarketCode; children: React.ReactNode }) {
  useEffect(() => {
    // The basket lives on this device; load it after hydration so server and client agree.
    useBasket.persist.rehydrate();
    useOrders.persist.rehydrate();
    useSession.persist.rehydrate();
    useCurrency.persist.rehydrate();
  }, []);
  return <MarketContext.Provider value={code}>{children}</MarketContext.Provider>;
}

/** The current market, with prices in the shopper's chosen currency. */
export function useMarket() {
  const code = useContext(MarketContext);
  const currency = useCurrency((s) => s.currency);
  return useMemo(() => withCurrency(getMarket(code), currency), [code, currency]);
}

export function useT() {
  return dict(useMarket().lang);
}
