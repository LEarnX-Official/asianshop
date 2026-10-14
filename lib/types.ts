export type Lang = "pl" | "de" | "en";
export type Localized = Record<Lang, string>;

export type Product = {
  id: number;
  slug: string;
  brand: string;
  category: string;
  subcategory: string;
  title: Localized;
  name: Localized;
  size: string | null;
  price: { pln: number; eur: number };
  /** Net price (excl. VAT) as published by the shop. */
  net?: { pln: number; eur: number } | null;
  unitPrice: { per: "kg" | "l"; pln: number; eur: number } | null;
  promo: {
    regularPln: number | null;
    lowest30Pln: number | null;
    regularEur: number | null;
    lowest30Eur: number | null;
    until: string;
  } | null;
  stock: "in" | "low" | "out";
  /** Demo value: the source shop has no batch data (blueprint B4). */
  bestBefore: string;
  bestBeforeIsDemo?: boolean;
  image: string;
  imageCount?: number;
  gtin?: string | null;
  sku?: string | null;
  available?: Record<Lang, boolean>;
};

export type Sections = {
  intro?: string;
  ingredients?: string;
  nutrition?: string;
  storage?: string;
  usage?: string;
  brand?: string;
  benefits?: string;
  more?: string;
};

export type ProductDetail = {
  sections: Record<Lang, Sections>;
  allergens: string[];
  allergensDetected: boolean;
  sourceUrl: string;
  images: string[];
};

export type Category = {
  key: string;
  name: Localized;
  count: number;
  tilePacks: number[];
  subs: { key: string; name: Localized; count: number }[];
};

export type Brand = { name: string; slug: string; count: number; packs: number[] };

export type Recipe = {
  slug: string;
  minutes: number;
  serves: number;
  region: Localized;
  title: Localized;
  from: Localized;
  ingredients: number[];
  steps: Record<Lang, string[]>;
};

export type Curation = {
  heroShelf: number[];
  pantryStaples: number[];
  bestsellers: number[];
  brands: string[];
  memoryLines: Record<string, Localized>;
};
