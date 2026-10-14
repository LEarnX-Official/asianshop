import Link from "next/link";
import type { Market } from "@/lib/markets";
import { dict } from "@/lib/i18n";
import { MoneyOf } from "../product/money-of";
import { getProduct } from "@/lib/catalog";
import { campaignsFor, type Campaign } from "@/lib/brand-assets";
import { SectionHead } from "./sections";

/* The shop's own campaign artwork (from asianshop.pl). Each banner leads to the pack it advertises. */

function Banner({ c, sizes, priority = false }: { c: Campaign; sizes: string; priority?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP set
    <img
      src={`/brand/banners/${c.file}-1600.webp`}
      srcSet={`/brand/banners/${c.file}-800.webp 800w, /brand/banners/${c.file}-1600.webp 1600w`}
      sizes={sizes}
      alt=""
      loading={priority ? "eager" : "lazy"}
      className="aspect-[2.88] h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
    />
  );
}

function Caption({ c, market }: { c: Campaign; market: Market }) {
  const t = dict(market.lang);
  const p = getProduct(c.product);
  if (!p) return null;
  return (
    <div className="flex items-center justify-between gap-3 px-1 pt-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-saffron-text">{c.brand}</p>
        <p className="truncate text-[15px] font-medium">
          {p.title[market.lang]} {p.size ? <span className="text-ink-muted">· {p.size}</span> : null}
        </p>
      </div>
      <p className="flex shrink-0 items-center gap-3">
        <span className="tabular font-semibold"><MoneyOf pln={p.price.pln} eur={p.price.eur} /></span>
        <span className="hidden text-sm font-semibold text-saffron-text group-hover:underline sm:inline">{t.campaignCta} →</span>
      </p>
    </div>
  );
}

const href = (market: Market, c: Campaign) => {
  const p = getProduct(c.product);
  return p ? `/${market.code}/p/${p.slug}-${p.id}` : `/${market.code}`;
};

/** Home: "On the shelf now", a swipe row of the campaigns whose text the shopper can read. */
export function CampaignRail({ market }: { market: Market }) {
  const t = dict(market.lang);
  const list = campaignsFor(market.lang);
  if (!list.length) return null;
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6" aria-label={t.campaignsTitle}>
      <SectionHead title={t.campaignsTitle} sub={t.campaignsSub} />
      <ul className="no-scrollbar -mx-4 flex scroll-px-4 snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6">
        {list.map((c) => (
          <li key={c.file} className="w-[88%] shrink-0 snap-start sm:w-[72%] lg:w-[58%]">
            <Link href={href(market, c)} aria-label={`${t.campaignAlt(c.brand)}: ${t.campaignCta}`} className="group block">
              <span className="block overflow-hidden rounded-[22px] bg-stone shadow-[0_10px_30px_rgba(60,35,15,0.10)]">
                <Banner c={c} sizes="(min-width: 1024px) 720px, 88vw" />
              </span>
              <Caption c={c} market={market} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Brand page: the brand's own campaign, full width, leading to its pack. */
export function BrandCampaign({ c, market }: { c: Campaign; market: Market }) {
  const t = dict(market.lang);
  return (
    <Link href={href(market, c)} aria-label={`${t.campaignAlt(c.brand)}: ${t.campaignCta}`} className="group mt-6 block">
      <span className="block overflow-hidden rounded-[28px] bg-stone">
        <Banner c={c} sizes="(min-width: 1280px) 1232px, 100vw" priority />
      </span>
      <Caption c={c} market={market} />
    </Link>
  );
}
