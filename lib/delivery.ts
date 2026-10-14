import type { Market } from "./markets";
import { TODAY, freeDeliveryThreshold, fromHome } from "./format";

export type DeliveryMethod = {
  id: string;
  label: string;
  kind: "courier" | "locker" | "pickup";
  price: number; // in the country's own currency (converted for display by deliveryPrice)
  days: [number, number]; // working days after dispatch
  freeAboveThreshold: boolean;
  note?: string;
};

// Real methods and prices from asianshop.pl's published shipping data (13 Oct 2026).
const PL: DeliveryMethod[] = [
  { id: "inpost-locker", label: "InPost Paczkomat 24/7", kind: "locker", price: 11, days: [1, 2], freeAboveThreshold: true },
  { id: "dpd-pickup", label: "DPD Pickup", kind: "locker", price: 7, days: [1, 2], freeAboveThreshold: true },
  { id: "dhl-box", label: "DHL Box 24/7", kind: "locker", price: 9, days: [1, 2], freeAboveThreshold: true },
  { id: "dpd-courier", label: "DPD Kurier", kind: "courier", price: 8.5, days: [1, 2], freeAboveThreshold: true },
  { id: "inpost-courier", label: "InPost Kurier", kind: "courier", price: 13, days: [1, 2], freeAboveThreshold: true },
  { id: "dhl-premium", label: "DHL Kurier Premium", kind: "courier", price: 10.5, days: [1, 1], freeAboveThreshold: false },
  { id: "pickup", label: "Odbiór osobisty · ul. Krakowska 62, Balice", kind: "pickup", price: 0, days: [1, 1], freeAboveThreshold: false },
];
// Germany: the shop publishes one method (DHL Kurier, Economy, 30 zł). EUR price converted at 4.38;
// delivery days are an ASSUMPTION for the prototype.
const DE: DeliveryMethod[] = [{ id: "dhl-economy", label: "DHL Paket (Economy)", kind: "courier", price: 6.85, days: [2, 4], freeAboveThreshold: true }];

export function deliveryMethods(m: Market) {
  return m.country === "PL" ? PL : DE;
}

export function deliveryPrice(method: DeliveryMethod, subtotal: number, m: Market) {
  return method.freeAboveThreshold && subtotal >= freeDeliveryThreshold(m) ? 0 : fromHome(method.price, m);
}

/** Adds working days (Mon–Fri) to the prototype's fixed "today". */
export function addWorkingDays(days: number, from = TODAY) {
  const d = new Date(from);
  let left = days;
  while (left > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6) left--;
  }
  return d;
}

export function arrivalRange(method: DeliveryMethod, from = TODAY) {
  return [addWorkingDays(method.days[0], from), addWorkingDays(method.days[1], from)] as const;
}

export function dayLabel(d: Date, m: Market) {
  return new Intl.DateTimeFormat(m.textLocale, { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(d);
}

export type PaymentMethod = { id: string; label: string; hint?: string };

// Methods that only settle in one currency: BLIK and cash on delivery in złoty, SEPA and Klarna (DE) in euro.
const ONLY: Record<string, "PLN" | "EUR"> = { blik: "PLN", cod: "PLN", sepa: "EUR", klarna: "EUR" };

export function paymentMethods(m: Market): PaymentMethod[] {
  return allPaymentMethods(m).filter((p) => !ONLY[p.id] || ONLY[p.id] === m.currency);
}

function allPaymentMethods(m: Market): PaymentMethod[] {
  return m.country === "PL"
    ? [
        { id: "blik", label: "BLIK" },
        { id: "p24", label: "Przelewy24", hint: "mBank · PKO · ING · Santander · Pekao…" },
        { id: "card", label: "Visa · Mastercard" },
        { id: "wallet", label: "Apple Pay · Google Pay" },
        { id: "cod", label: "Za pobraniem / Cash on delivery" },
      ]
    : [
        { id: "paypal", label: "PayPal" },
        { id: "klarna", label: "Klarna", hint: "Rechnung · Ratenkauf" },
        { id: "sepa", label: "SEPA-Lastschrift" },
        { id: "card", label: "Visa · Mastercard" },
        { id: "wallet", label: "Apple Pay · Google Pay" },
      ];
}

export const POSTCODE: Record<"PL" | "DE", { re: RegExp; fmt: string }> = {
  PL: { re: /^\d{2}-\d{3}$/, fmt: "00-000" },
  DE: { re: /^\d{5}$/, fmt: "00000" },
};

// Approximate coordinates for the tracking map (city -> lat/lon).
export const CITY_COORDS: Record<string, [number, number]> = {
  warszawa: [52.23, 21.01], warsaw: [52.23, 21.01], krakow: [50.06, 19.94], "kraków": [50.06, 19.94], wroclaw: [51.11, 17.03], "wrocław": [51.11, 17.03],
  gdansk: [54.35, 18.65], "gdańsk": [54.35, 18.65], poznan: [52.41, 16.93], "poznań": [52.41, 16.93], lodz: [51.76, 19.46], "łódź": [51.76, 19.46],
  katowice: [50.26, 19.02], lublin: [51.25, 22.57], szczecin: [53.43, 14.55], bydgoszcz: [53.12, 18.0], rzeszow: [50.04, 22.0], "rzeszów": [50.04, 22.0],
  berlin: [52.52, 13.4], hamburg: [53.55, 9.99], munchen: [48.14, 11.58], "münchen": [48.14, 11.58], munich: [48.14, 11.58], koln: [50.94, 6.96], "köln": [50.94, 6.96],
  cologne: [50.94, 6.96], frankfurt: [50.11, 8.68], stuttgart: [48.78, 9.18], dusseldorf: [51.23, 6.78], "düsseldorf": [51.23, 6.78], leipzig: [51.34, 12.37],
  dresden: [51.05, 13.74], hannover: [52.37, 9.73], nurnberg: [49.45, 11.08], "nürnberg": [49.45, 11.08], bremen: [53.08, 8.8],
};

export function cityCoords(city: string, country: "PL" | "DE"): [number, number] {
  const key = city.trim().toLowerCase();
  return CITY_COORDS[key] ?? (country === "PL" ? CITY_COORDS.warszawa : CITY_COORDS.berlin);
}
