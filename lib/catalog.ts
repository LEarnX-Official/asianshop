import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Brand, Category, Curation, Product, ProductDetail, Recipe } from "./types";

// The mock API layer. Screens only talk to these functions, so swapping in the real
// commerce backend later changes no UI code (blueprint Part 7).

const DATA = path.join(process.cwd(), "data");
const read = <T,>(file: string): T => JSON.parse(fs.readFileSync(path.join(DATA, file), "utf-8")) as T;

let _catalog: Product[] | null = null;
let _byId: Map<number, Product> | null = null;
let _details: Record<string, ProductDetail> | null = null;

export function catalog(): Product[] {
  if (!_catalog) _catalog = read<Product[]>("catalog.json");
  return _catalog;
}

function byId() {
  if (!_byId) _byId = new Map(catalog().map((p) => [p.id, p]));
  return _byId;
}

export function getProduct(id: number) {
  return byId().get(id) ?? null;
}

export function getProducts(ids: number[]) {
  return ids.map((id) => byId().get(id)).filter((p): p is Product => !!p);
}

const imageCache = new Map<number | string, boolean>();
/** True when the cleaned pack photo exists (some photos are missing or still processing). `id` may be "1898_2". */
export function hasImage(id: number | string) {
  let v = imageCache.get(id);
  if (v === undefined) {
    v = fs.existsSync(path.join(process.cwd(), "public", "products", `${id}-400.webp`));
    imageCache.set(id, v);
  }
  return v;
}

export function getDetail(id: number): ProductDetail | null {
  if (!_details) _details = read<Record<string, ProductDetail>>("details.json");
  return _details[String(id)] ?? null;
}

export const categories = () => read<Category[]>("categories.json");
export const brands = () => read<Brand[]>("brands.json");
export const curation = () => read<Curation>("curation.json");
export const recipes = () => read<Recipe[]>("recipes.json");

export function getCategory(key: string) {
  return categories().find((c) => c.key === key) ?? null;
}

export function inCategory(key: string) {
  return catalog().filter((p) => p.category === key);
}

export function byBrand(name: string) {
  return catalog().filter((p) => p.brand === name);
}

/** URL segment for a product: "mdh-garam-masala-spice-100-g-488". */
export const productPath = (p: Pick<Product, "slug" | "id">) => `${p.slug}-${p.id}`;

export function idFromPath(segment: string) {
  const m = segment.match(/-(\d+)$/) ?? segment.match(/^(\d+)$/);
  return m ? Number(m[1]) : null;
}

/** "Goes well with": same category, different subcategory or brand, in stock. */
export function goesWellWith(p: Product, n = 4) {
  return catalog()
    .filter((x) => x.id !== p.id && x.stock !== "out" && x.category === p.category && x.subcategory !== p.subcategory)
    .slice(0, n);
}

export function recipesUsing(id: number) {
  return recipes().filter((r) => r.ingredients.includes(id));
}

export function brandSlug(name: string) {
  return brands().find((b) => b.name === name)?.slug ?? encodeURIComponent(name.toLowerCase());
}

export function brandBySlug(slug: string) {
  return brands().find((b) => b.slug === slug) ?? null;
}

type InfoPage = { title: string; source: string; blocks: ({ h: string } | { p: string })[] };
export function infoPage(lang: string, slug: string): { page: InfoPage; fallback: boolean } | null {
  const all = read<Record<string, Record<string, InfoPage | null>>>("info.json");
  const own = all[lang]?.[slug];
  if (own) return { page: own, fallback: false };
  const en = all.en?.[slug];
  return en ? { page: en, fallback: true } : null;
}
