import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMarket } from "@/lib/markets";
import { dict } from "@/lib/i18n";
import { brandBySlug, brands, byBrand, hasImage } from "@/lib/catalog";
import { ListingView } from "@/components/listing/listing-view";
import { BrandCampaign } from "@/components/home/campaigns";
import { campaignFor } from "@/lib/brand-assets";

// Blocking navigation keeps the card -> page morph paired (see product page).
export const instant = false;

export function generateStaticParams() {
  return brands().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[market]/brand/[slug]">) {
  const { slug } = await params;
  return { title: brandBySlug(slug)?.name };
}

export default async function BrandPage({ params }: PageProps<"/[market]/brand/[slug]">) {
  const { market: code, slug } = await params;
  const m = getMarket(code);
  const t = dict(m.lang);
  const b = brandBySlug(slug);
  if (!b) notFound();
  const products = byBrand(b.name);
  const campaign = campaignFor(b.name, m.lang);
  const hero = products.filter((p) => p.stock !== "out" && hasImage(p.id)).slice(0, 5);
  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-10 pt-6 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
        <Link href={`/${m.code}`} className="hover:underline">{t.home}</Link> <span aria-hidden="true">›</span> <span className="text-ink">{b.name}</span>
      </nav>
      <header className="mt-5 flex flex-col gap-6 overflow-hidden rounded-[28px] bg-ink px-8 py-10 text-linen md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-turmeric">{t.brandsFromHome}</p>
          <h1 className="mt-2 font-serif text-5xl font-medium sm:text-6xl">{b.name}</h1>
          <p className="mt-2 text-linen/70">{t.products(b.count)}</p>
        </div>
        <div className="flex items-end -space-x-6">
          {hero.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP
            <img key={p.id} src={p.image.replace(".webp", "-400.webp")} alt="" className="h-24 w-24 rounded-2xl bg-linen object-contain p-1.5 shadow-lift sm:h-28 sm:w-28" style={{ transform: `rotate(${[-6, 3, -2, 5, -4][i]}deg)` }} />
          ))}
        </div>
      </header>
      {campaign ? <BrandCampaign c={campaign} market={m} /> : null}
      <div className="mt-8">
        <Suspense fallback={<div className="skeleton h-96 rounded-2xl" />}>
          <ListingView products={products} brands={[b.name]} />
        </Suspense>
      </div>
    </section>
  );
}
