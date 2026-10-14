"use client";

import { money } from "@/lib/format";
import { useMarket } from "../global/market-context";

/** A price rendered on the server that must follow the shopper's currency choice: pass both amounts. */
export function MoneyOf({ pln, eur }: { pln: number; eur: number }) {
  const m = useMarket();
  return <>{money(m.currency === "PLN" ? pln : eur, m)}</>;
}
