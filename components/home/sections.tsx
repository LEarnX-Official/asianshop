import Link from "next/link";
import type { Market } from "@/lib/markets";
import { dict } from "@/lib/i18n";
import { money, priceOf } from "@/lib/format";
import type { Brand, Category, Product, Recipe } from "@/lib/types";
import { TILE_ART } from "@/lib/brand-assets";

/* Server-rendered home sections: no client JS unless a button needs it. */

export function SectionHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-serif text-[28px] font-medium leading-tight tracking-tight sm:text-[34px]">{title}</h2>
        {sub ? <p className="mt-1.5 text-ink-soft">{sub}</p> : null}
      </div>
      {action}
    </div>
  );
}

function Pack({ p, className = "" }: { p: Pick<Product, "image" | "id">; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP from our pipeline
  return <img src={p.image.replace(".webp", "-400.webp")} alt="" loading="lazy" width={400} height={400} className={`pack-img object-contain ${className}`} />;
}

/** C2 Brands from home. */
export function BrandsFromHome({ brands, packs, market }: { brands: Brand[]; packs: Map<number, Product>; market: Market }) {
  const t = dict(market.lang);
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <SectionHead title={t.brandsFromHome} />
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 lg:grid-cols-6">
        {brands.map((b) => (
          <li key={b.name} className="w-[42%] shrink-0 snap-start sm:w-auto">
            <Link href={`/${market.code}/brand/${b.slug}`} className="group block rounded-[var(--radius-card)] bg-stone p-4 transition-shadow hover:shadow-lift">
              <div className="relative flex h-24 items-end justify-center">
                {b.packs.slice(0, 2).map((id, i) => {
                  const p = packs.get(id);
                  return p ? (
                    <Pack
                      key={id}
                      p={p}
                      className={`h-24 w-24 transition-transform duration-150 ${i === 0 ? "-mr-6 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}
                    />
                  ) : null;
                })}
              </div>
              <p className="mt-3 text-center font-serif text-lg">{b.name}</p>
              <p className="text-center text-xs text-ink-muted">{t.products(b.count)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* Where each pack of a tile's still life stands: left, centre (tallest, in front), right, small one in front. */
const SLOT = [
  { box: "left-[7%] h-[42%] w-[36%] z-10 sm:h-[46%]", turn: "rotate-[-5deg] group-hover:-translate-x-1.5 group-hover:rotate-[-7deg]" },
  { box: "left-1/2 -ml-[21%] h-[50%] w-[42%] z-20 sm:h-[60%]", turn: "group-hover:-translate-y-2" },
  { box: "right-[7%] h-[45%] w-[36%] z-10 sm:h-[50%]", turn: "rotate-[5deg] group-hover:translate-x-1.5 group-hover:rotate-[7deg]" },
  { box: "right-[3%] h-[28%] w-[26%] z-30", turn: "rotate-[-3deg] group-hover:-translate-y-1" },
];

/** C3 Shop by category: two real photos (rice, spices) as large tiles; every other aisle is a still life of its real packs. */
export function CategoryTiles({ categories, market }: { categories: Category[]; market: Market }) {
  const t = dict(market.lang);
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <SectionHead title={t.shopByCategory} />
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {categories.map((c) => {
          const art = TILE_ART[c.key];
          const photo = art?.kind === "photo" ? art : null;
          return (
            <li key={c.key} className={photo ? "col-span-2" : ""}>
              <Link
                href={`/${market.code}/c/${c.key}`}
                className={`group relative block h-[230px] overflow-hidden rounded-[24px] transition-shadow duration-200 hover:shadow-lift sm:h-[280px] ${photo ? "bg-ink text-linen" : "text-ink"}`}
                style={art?.kind === "packs" ? { background: `radial-gradient(ellipse at 50% 30%, ${art.glow} 0%, ${art.tint} 70%)` } : undefined}
              >
                {photo ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP set */}
                    <img
                      src={`${photo.src}-1200.webp`}
                      srcSet={`${photo.src}-700.webp 700w, ${photo.src}-1200.webp 1200w`}
                      sizes="(min-width: 1024px) 620px, 100vw"
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      style={{ objectPosition: photo.position }}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,14,11,0.72)_0%,rgba(18,14,11,0.25)_55%,rgba(18,14,11,0)_80%)]" />
                  </>
                ) : art?.kind === "packs" ? (
                  <>
                    {/* soft floor shadow the packs stand on */}
                    <div className="absolute inset-x-[10%] bottom-[7%] h-[8%] rounded-[50%] bg-[radial-gradient(rgba(80,45,20,0.22),transparent_70%)]" />
                    {art.packs.slice(0, 4).map((id, i) => (
                      <div key={id} className={`absolute bottom-[9%] flex items-end justify-center ${SLOT[i].box}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- transparent cut-out */}
                        <img
                          src={`/products/cutout-cat/${id}.webp`}
                          alt=""
                          loading="lazy"
                          className={`max-h-full max-w-full object-contain drop-shadow-[0_10px_12px_rgba(70,40,15,0.25)] transition-transform duration-300 ease-out ${SLOT[i].turn}`}
                        />
                      </div>
                    ))}
                  </>
                ) : null}
                <div className={`relative z-40 p-4 sm:p-5 ${photo ? "flex h-full flex-col justify-end sm:p-7" : ""}`}>
                  <p className={`font-semibold leading-snug ${photo ? "font-serif text-[26px] font-medium sm:text-4xl" : "text-[16px] sm:text-[18px]"}`}>{c.name[market.lang]}</p>
                  <p className={`mt-0.5 text-xs sm:text-sm ${photo ? "text-linen/80" : "text-ink/60"}`}>{t.products(c.count)}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** C5 Cook tonight: ingredients laid out like a flat lay, one "Add all ingredients". */
export function CookTonight({
  recipe,
  ingredients,
  packs,
  market,
  addAll,
}: {
  recipe: Recipe;
  ingredients: Product[];
  packs: Map<number, Product>;
  market: Market;
  addAll: React.ReactNode;
}) {
  const t = dict(market.lang);
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <div className="grid overflow-hidden rounded-[28px] bg-ink text-linen lg:grid-cols-2">
        <div className="relative min-h-[280px] bg-[radial-gradient(circle_at_30%_30%,#3a2e26,#1f1a17)] p-6">
          <div className="grid h-full grid-cols-3 place-items-center gap-2">
            {ingredients.slice(0, 9).map((p, i) => (
              <div key={p.id} className="h-20 w-20 rounded-2xl bg-linen/95 p-1.5 sm:h-24 sm:w-24" style={{ transform: `rotate(${[-6, 3, -2, 5, -4, 2, 6, -3, 4][i]}deg)` }}>
                {packs.has(p.id) ? <Pack p={p} className="h-full w-full" /> : <span className="grid h-full place-items-center text-center text-[10px] text-ink-muted">{p.brand}</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center gap-4 p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-turmeric">{t.cookTonight}</p>
          <h2 className="font-serif text-4xl font-medium leading-tight">{recipe.title[market.lang]}</h2>
          <p className="text-linen/75">
            {recipe.from[market.lang]} · {recipe.region[market.lang]}
          </p>
          <p className="text-sm text-linen/75">
            {t.minutes(recipe.minutes)} · {t.serves(recipe.serves)} · {ingredients.length} {t.ingredientsTitle.toLowerCase()}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {addAll}
            <Link href={`/${market.code}/recipes/${recipe.slug}`} className="rounded-full px-4 py-3 text-sm font-semibold text-turmeric hover:underline">
              {t.stepsTitle} →
            </Link>
          </div>
          <p className="text-xs text-linen/60">
            {money(ingredients.reduce((s, p) => s + priceOf(p, market), 0), market)} · {t.vatIncluded}
          </p>
        </div>
      </div>
    </section>
  );
}

/** C7 Trust strip: the three promises. */
export function TrustStrip({ market }: { market: Market }) {
  const t = dict(market.lang);
  const items = [
    { title: t.trustFresh, sub: t.trustFreshSub, icon: <path d="M5 7h14v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7Zm0 4h14M9 3v4m6-4v4" /> },
    { title: t.trustEurope, sub: t.trustEuropeSub, icon: <path d="M3 17h2l2-5h8l2 5h2M7 17a2 2 0 1 0 4 0m2 0a2 2 0 1 0 4 0M9 12l1.5-4h3L15 12" /> },
    { title: t.trustBrands, sub: t.trustBrandsSub, icon: <path d="M12 3 4 7v6c0 4 3.4 7.4 8 8 4.6-.6 8-4 8-8V7l-8-4Zm-3 9 2 2 4-4" /> },
  ];
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <ul className="grid gap-4 rounded-[28px] border border-line bg-warm p-6 sm:grid-cols-3 sm:p-8">
        {items.map((x) => (
          <li key={x.title} className="flex gap-4">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8 shrink-0 text-saffron" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              {x.icon}
            </svg>
            <div>
              <p className="font-semibold">{x.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{x.sub}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** C8 From our family to yours. Real photo and real words still to come from the founders. */
export function FoundersNote({ market }: { market: Market }) {
  const t = dict(market.lang);
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div className="flex aspect-[4/3] items-center justify-center rounded-[28px] border-2 border-dashed border-line bg-stone/70 p-8 text-center text-sm text-ink-muted">
          {t.foundersPhoto}
        </div>
        <div>
          <h2 className="font-serif text-[34px] font-medium leading-tight">{t.foundersTitle}</h2>
          <p className="mt-4 max-w-lg leading-relaxed text-ink-soft">{t.foundersBody}</p>
          <p className="mt-6 font-serif text-2xl italic text-saffron-text">Aditya &amp; Abhi</p>
        </div>
      </div>
    </section>
  );
}
