import type { Lang } from "./types";

export type MarketCode = "pl-pl" | "pl-en" | "de-de" | "de-en";

export type Market = {
  code: MarketCode;
  country: "PL" | "DE";
  lang: Lang;
  currency: "PLN" | "EUR";
  /** Locale used for numbers, prices and dates: the country's, whatever the language. */
  numberLocale: string;
  /** Locale used for words (month names etc.). */
  textLocale: string;
  freeDeliveryFrom: number;
  deliveryDays: string;
  countryName: Record<Lang, string>;
};

const PL_NAME = { pl: "Polska", de: "Polen", en: "Poland" };
const DE_NAME = { pl: "Niemcy", de: "Deutschland", en: "Germany" };

export const MARKETS: Record<MarketCode, Market> = {
  // Free delivery from 50 zł is today's threshold on asianshop.pl.
  "pl-pl": { code: "pl-pl", country: "PL", lang: "pl", currency: "PLN", numberLocale: "pl-PL", textLocale: "pl-PL", freeDeliveryFrom: 50, deliveryDays: "1–2", countryName: PL_NAME },
  "pl-en": { code: "pl-en", country: "PL", lang: "en", currency: "PLN", numberLocale: "pl-PL", textLocale: "en-GB", freeDeliveryFrom: 50, deliveryDays: "1–2", countryName: PL_NAME },
  // ASSUMPTION for the prototype: Germany threshold and delivery days are not set by the client yet.
  "de-de": { code: "de-de", country: "DE", lang: "de", currency: "EUR", numberLocale: "de-DE", textLocale: "de-DE", freeDeliveryFrom: 49, deliveryDays: "2–4", countryName: DE_NAME },
  "de-en": { code: "de-en", country: "DE", lang: "en", currency: "EUR", numberLocale: "de-DE", textLocale: "en-GB", freeDeliveryFrom: 49, deliveryDays: "2–4", countryName: DE_NAME },
};

export const MARKET_CODES = Object.keys(MARKETS) as MarketCode[];
export const DEFAULT_MARKET: MarketCode = "pl-pl";

export function isMarketCode(v: string): v is MarketCode {
  return v in MARKETS;
}

export function getMarket(code: string): Market {
  return isMarketCode(code) ? MARKETS[code] : MARKETS[DEFAULT_MARKET];
}

/** Same page in another market: swaps the first path segment. */
export function switchMarketPath(pathname: string, to: MarketCode) {
  const parts = pathname.split("/");
  if (parts.length > 1 && isMarketCode(parts[1])) parts[1] = to;
  else parts.splice(1, 0, to);
  return parts.join("/") || `/${to}`;
}
