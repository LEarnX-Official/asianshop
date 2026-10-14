import Link from "next/link";
import { notFound } from "next/navigation";
import { getMarket } from "@/lib/markets";
import { dict } from "@/lib/i18n";
import { splitAllergens } from "@/lib/allergens";
import { brandSlug, byBrand, catalog, curation, getCategory, getDetail, getProduct, getProducts, goesWellWith, hasImage, idFromPath, recipesUsing } from "@/lib/catalog";
import type { Lang, Sections } from "@/lib/types";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductBuy } from "@/components/product/product-buy";
import { ProductRow } from "@/components/home/product-row";
import { SectionHead } from "@/components/home/sections";

// Navigation into this page may wait for it to render: that is what lets the card -> page
// match cut pair both images in one commit (React <ViewTransition>). All data is local and prerendered.
export const instant = false;

export function generateStaticParams() {
  return catalog().map((p) => ({ slug: `${p.slug}-${p.id}` }));
}

export async function generateMetadata({ params }: PageProps<"/[market]/p/[slug]">) {
  const { market, slug } = await params;
  const p = getProduct(idFromPath(slug) ?? -1);
  if (!p) return {};
  const m = getMarket(market);
  return { title: `${p.brand} ${p.title[m.lang]} ${p.size ?? ""}`.trim() };
}

function pick(sections: Record<Lang, Sections>, lang: Lang, key: keyof Sections) {
  return sections[lang]?.[key] || sections.en?.[key] || sections.pl?.[key] || "";
}

function Paragraphs({ text }: { text: string }) {
  return (
    <div className="space-y-2 leading-relaxed text-ink-soft">
      {text.split("\n").filter(Boolean).map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  );
}

function Panel({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-t border-line py-1 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-lg font-semibold">
        {title}
        <span aria-hidden="true" className="text-2xl font-light text-ink-muted transition-transform duration-200 group-open:rotate-45">+</span>
      </summary>
      <div className="pb-6">{children}</div>
    </details>
  );
}

export default async function ProductPage({ params }: PageProps<"/[market]/p/[slug]">) {
  const { market: code, slug } = await params;
  const m = getMarket(code);
  const t = dict(m.lang);
  const p = getProduct(idFromPath(slug) ?? -1);
  if (!p) notFound();
  const detail = getDetail(p.id);
  const cat = getCategory(p.category);
  const memory = curation().memoryLines[String(p.id)]?.[m.lang];
  const sections = detail?.sections ?? ({ pl: {}, de: {}, en: {} } as Record<Lang, Sections>);
  const intro = pick(sections, m.lang, "intro");
  const benefits = pick(sections, m.lang, "benefits");
  const ingredients = pick(sections, m.lang, "ingredients");
  const nutrition = pick(sections, m.lang, "nutrition");
  const usage = pick(sections, m.lang, "usage");
  const aboutBrand = pick(sections, m.lang, "brand");
  const allergens = detail?.allergens ?? [];
  const title = p.title[m.lang];
  const images = (detail?.images ?? [p.image]).filter((src, i) => i === 0 || hasImage(src.match(/(\d+_\d+)\.webp$/)?.[1] ?? ""));
  const well = goesWellWith(p).filter((x) => hasImage(x.id));
  const more = byBrand(p.brand).filter((x) => x.id !== p.id && x.stock !== "out" && !well.some((w) => w.id === x.id) && hasImage(x.id)).slice(0, 4);
  const recs = recipesUsing(p.id);

  return (
    <article className="mx-auto max-w-[1280px] px-4 pb-10 pt-6 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
        <Link href={`/${m.code}`} className="hover:underline">{t.home}</Link> <span aria-hidden="true">›</span>{" "}
        {cat ? (
          <>
            <Link href={`/${m.code}/c/${cat.key}`} className="hover:underline">{cat.name[m.lang]}</Link> <span aria-hidden="true">›</span>{" "}
          </>
        ) : null}
        <span className="text-ink">{title}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
        <ProductGallery id={p.id} images={images.length ? images : [p.image]} alt={`${p.brand} ${title}`} />
        <div>
          <Link href={`/${m.code}/brand/${brandSlug(p.brand)}`} className="inline-flex items-center gap-1 rounded-full bg-stone px-3 py-1 text-xs font-semibold uppercase tracking-wider text-saffron-text hover:bg-line">
            {p.brand} ›
          </Link>
          <h1 className="mt-3 font-serif text-[34px] font-medium leading-tight tracking-tight sm:text-[42px]">{title}</h1>
          <p className="mt-1 text-lg text-ink-muted">{p.size}</p>
          {memory ? <p className="mt-4 font-serif text-xl italic text-ink-soft">“{memory}”</p> : null}
          <div className="mt-6">
            <ProductBuy product={p} />
          </div>

          <div className="mt-10">
            <Panel title={t.description} open>
              <Paragraphs text={[intro, benefits].filter(Boolean).join("\n") || p.name[m.lang]} />
            </Panel>
            <Panel title={t.ingredients} open={!!ingredients}>
              {allergens.length ? (
                <p className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold text-chilli">⚠ {t.contains}:</span>
                  {allergens.map((a) => (
                    <span key={a} className="rounded-full border border-chilli/30 bg-chilli/5 px-2.5 py-0.5 text-chilli">
                      {t.allergensNames[a] ?? a}
                    </span>
                  ))}
                </p>
              ) : null}
              {ingredients ? (
                <>
                  <p className="leading-relaxed text-ink-soft">
                    {splitAllergens(ingredients).map((part, i) => (part.allergen ? <strong key={i} className="font-bold text-ink">{part.text}</strong> : <span key={i}>{part.text}</span>))}
                  </p>
                  <p className="mt-3 text-xs text-ink-muted">{t.allergenNote}</p>
                </>
              ) : (
                <p className="rounded-xl bg-turmeric/15 px-4 py-3 text-sm text-saffron-deep">{t.allergenMissing}</p>
              )}
            </Panel>
            <Panel title={t.nutrition}>{nutrition ? <Paragraphs text={nutrition} /> : <p className="text-sm text-ink-muted">{t.nutritionMissing}</p>}</Panel>
            {usage ? (
              <Panel title={t.howToUse}>
                <Paragraphs text={usage} />
              </Panel>
            ) : null}
            {aboutBrand ? (
              <Panel title={t.aboutBrand}>
                <Paragraphs text={aboutBrand} />
              </Panel>
            ) : null}
          </div>
        </div>
      </div>

      {recs.length ? (
        <section className="mt-16">
          <SectionHead title={t.usedIn} />
          <ul className="grid gap-4 sm:grid-cols-2">
            {recs.map((r) => {
              const ing = getProducts(r.ingredients);
              return (
                <li key={r.slug}>
                  <Link href={`/${m.code}/recipes/${r.slug}`} className="flex items-center gap-5 rounded-[var(--radius-card)] bg-ink p-5 text-linen hover:bg-ink-soft">
                    <div className="flex -space-x-6">
                      {ing.slice(0, 3).filter((x) => hasImage(x.id)).map((x) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={x.id} src={x.image.replace(".webp", "-400.webp")} alt="" className="h-16 w-16 rounded-xl bg-linen object-contain p-1" />
                      ))}
                    </div>
                    <div>
                      <p className="font-serif text-2xl">{r.title[m.lang]}</p>
                      <p className="text-sm text-linen/70">
                        {t.minutes(r.minutes)} · {ing.length} {t.ingredientsTitle.toLowerCase()}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {well.length ? (
        <section className="mt-16">
          <SectionHead title={t.goesWellWith} />
          <ProductRow products={well} />
        </section>
      ) : null}
      {more.length ? (
        <section className="mt-16">
          <SectionHead title={t.moreFrom(p.brand)} />
          <ProductRow products={more} />
        </section>
      ) : null}
    </article>
  );
}
