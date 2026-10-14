import type { Market } from "./markets";
import type { Product } from "./types";

const cache = new Map<string, Intl.NumberFormat>();

export function money(value: number, market: Market) {
  const key = `${market.numberLocale}-${market.currency}`;
  let f = cache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(market.numberLocale, { style: "currency", currency: market.currency });
    cache.set(key, f);
  }
  return f.format(value);
}

export function priceOf(p: Pick<Product, "price">, market: Market) {
  return market.currency === "PLN" ? p.price.pln : p.price.eur;
}

export function unitPriceOf(p: Pick<Product, "unitPrice">, market: Market) {
  if (!p.unitPrice) return null;
  return { value: market.currency === "PLN" ? p.unitPrice.pln : p.unitPrice.eur, per: p.unitPrice.per };
}

export function promoOf(p: Pick<Product, "promo">, market: Market) {
  if (!p.promo) return null;
  const pln = market.currency === "PLN";
  return {
    regular: pln ? p.promo.regularPln : p.promo.regularEur,
    lowest30: pln ? p.promo.lowest30Pln : p.promo.lowest30Eur,
    until: p.promo.until,
  };
}

/** Fixed "today" so server and browser agree (the crawl date). */
export const TODAY = new Date("2026-10-13T12:00:00Z");

export function daysUntil(isoDate: string) {
  return Math.round((new Date(`${isoDate}T12:00:00Z`).getTime() - TODAY.getTime()) / 86_400_000);
}

export function shortDate(isoDate: string, market: Market) {
  return new Intl.DateTimeFormat(market.textLocale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${isoDate}T12:00:00Z`),
  );
}

export type Freshness = "fresh" | "short" | "hidden";

export function freshness(isoDate: string): Freshness {
  const d = daysUntil(isoDate);
  if (d < 15) return "hidden";
  if (d <= 60) return "short";
  return "fresh";
}
