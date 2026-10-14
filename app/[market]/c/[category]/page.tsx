import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMarket } from "@/lib/markets";
import { dict } from "@/lib/i18n";
import { categories, getCategory, inCategory } from "@/lib/catalog";
import { ListingView } from "@/components/listing/listing-view";
import { CategoryHero } from "@/components/listing/category-hero";

// Navigation into this page may wait for it to render: that is what lets the card -> page
// match cut pair both images in one commit (React <ViewTransition>). All data is local and prerendered.
export const instant = false;

export function generateStaticParams() {
  return categories().map((c) => ({ category: c.key }));
}

export async function generateMetadata({ params }: PageProps<"/[market]/c/[category]">) {
  const { market, category } = await params;
  const c = getCategory(category);
  return { title: c ? c.name[getMarket(market).lang] : undefined };
}

export default async function CategoryPage({ params }: PageProps<"/[market]/c/[category]">) {
  const { market: code, category } = await params;
  const m = getMarket(code);
  const t = dict(m.lang);
  const c = getCategory(category);
  if (!c) notFound();
  const products = inCategory(c.key);
  const brandCounts = new Map<string, number>();
  products.forEach((p) => p.brand && brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1));
  const brandList = [...brandCounts.entries()].sort((a, b) => b[1] - a[1]).map(([b]) => b);
  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-10 pt-6 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
        <Link href={`/${m.code}`} className="hover:underline">{t.home}</Link> <span aria-hidden="true">›</span> <span className="text-ink">{c.name[m.lang]}</span>
      </nav>
      <CategoryHero k={c.key} title={c.name[m.lang]} count={t.products(products.length)} />
      <div className="mt-6">
        <Suspense fallback={<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton aspect-[3/4] rounded-2xl" />)}</div>}>
          <ListingView products={products} subs={c.subs} brands={brandList} />
        </Suspense>
      </div>
    </section>
  );
}
