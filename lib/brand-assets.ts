// The shop's own artwork from asianshop.pl, prepared by scripts/build_brand_assets.py into /public/brand.
import type { Lang } from "./types";

export const BRAND_RED = "#ed1c24"; // the red of the real ASIAN SHOP wordmark
export const TAGLINE = "Bringing Home Closer"; // the real logo's line; kept in English in every market, as on the shop

/* ---- aisle icons: the shop's category illustrations; two drawn to match (ghee-oil, more) ---- */
const AISLE: Record<string, string> = {
  rice: "rice",
  flour: "flour",
  grains: "grains",
  dal: "dal",
  masala: "masala",
  pickles: "pickles",
  snacks: "snacks",
  sweets: "sweets",
  nuts: "nuts",
  cooking: "cooking",
  sauces: "cooking",
  "ready-meals": "ready-meals",
  drinks: "drinks",
  tea: "drinks",
};
/** Icon for a category (or subcategory) key; size 120 for small uses, 240 above ~60 px. */
export function aisleIcon(key: string, size: 120 | 240 = 240) {
  const f = AISLE[key];
  if (f) return `/brand/aisle/${f}-${size}.webp`;
  if (key === "ghee-oil" || key === "oil" || key === "dairy") return "/brand/aisle/ghee-oil.svg";
  if (key === "more") return "/brand/aisle/more.svg";
  return null;
}

/* ---- category backdrops: real photos for the two aisles they show ---- */
export const BACKDROPS: Record<string, { src: string; position: string }> = {
  masala: { src: "/brand/backdrops/spices", position: "78% 50%" },
  rice: { src: "/brand/backdrops/rice-terraces", position: "60% 60%" },
};

/* ---- "Shop by category" tiles: a real photo for two aisles, a still life of real packs for the rest ---- */
export type TileArt =
  | { kind: "photo"; src: string; position: string }
  /** packs: left, centre (tallest, in front), right, then an optional small one in front on the right */
  | { kind: "packs"; tint: string; glow: string; packs: number[] };
export const TILE_ART: Record<string, TileArt> = {
  rice: { kind: "photo", src: "/brand/backdrops/rice-terraces", position: "55% 62%" },
  masala: { kind: "photo", src: "/brand/backdrops/spices", position: "88% 50%" },
  flour: { kind: "packs", tint: "#f1e2c4", glow: "#fff6e2", packs: [197, 216, 1707] },
  dal: { kind: "packs", tint: "#f4d7c3", glow: "#fff1e6", packs: [607, 603, 1141, 629] },
  pickles: { kind: "packs", tint: "#e4e8c9", glow: "#f8fae9", packs: [1284, 1102, 809, 807] },
  snacks: { kind: "packs", tint: "#f6d8c1", glow: "#fff0e2", packs: [3052, 295, 1911] },
  cooking: { kind: "packs", tint: "#f1d1c8", glow: "#fff0ea", packs: [1792, 318, 2618, 3049] },
  drinks: { kind: "packs", tint: "#d7e8dc", glow: "#f2faf4", packs: [1016, 1059, 1061, 360] },
  "ghee-oil": { kind: "packs", tint: "#f4e3ac", glow: "#fffaea", packs: [1114, 1634, 1748, 1109] },
  more: { kind: "packs", tint: "#e7dfee", glow: "#faf6fd", packs: [425, 1209, 344, 3066] },
};

/* ---- campaign banners: text is baked in, so each one only shows where its language is read ---- */
export type Campaign = {
  brand: string;
  file: string;
  /** the pack the banner advertises (its price on the banner matches the catalogue) */
  product: number;
  /** languages the banner's own text is written in; empty = English text, shown everywhere */
  langs: Lang[];
  /** where the artwork's own message sits, so we never cover it */
  copySide: "left" | "right";
};
export const CAMPAIGNS: Campaign[] = [
  { brand: "Lal Qilla", file: "lal-qilla", product: 3014, langs: [], copySide: "left" },
  { brand: "Daawat", file: "daawat-pl", product: 1524, langs: ["pl"], copySide: "left" },
  { brand: "Hasina", file: "hasina", product: 177, langs: [], copySide: "left" },
  { brand: "Royal Tiger", file: "royal-tiger-pl", product: 1808, langs: ["pl"], copySide: "left" },
  { brand: "Ali Baba", file: "ali-baba-falooda", product: 360, langs: [], copySide: "left" },
];
export const campaignsFor = (lang: Lang) => CAMPAIGNS.filter((c) => !c.langs.length || c.langs.includes(lang));
export const campaignFor = (brand: string, lang: Lang) => campaignsFor(lang).find((c) => c.brand === brand);
