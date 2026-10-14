import { getMarket } from "@/lib/markets";
import { dict } from "@/lib/i18n";
import { brands, categories, curation, getProduct, getProducts, recipes } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { HomeFilm } from "@/components/film/home-film";
import type { BrandBay } from "@/components/film/scenes";
import { CategoryTiles, FoundersNote, SectionHead } from "@/components/home/sections";
import { ProductRow } from "@/components/home/product-row";
import { AddAll } from "@/components/home/add-all";
import { CampaignRail } from "@/components/home/campaigns";

// Signature pack per brand for the tracking shot (Scene 3): the one people recognise from home.
const BRAND_PACKS: [string, number][] = [
  ["MDH", 488], ["Shan", 2618], ["Haldiram's", 295], ["TRS", 1129], ["Ali Baba", 1674], ["Parle G", 1911], ["Aachi", 1495],
  ["Priya", 809], ["Pataks", 307], ["Dabur", 1209], ["Laziza", 1895], ["Gits", 198], ["Aashirvaad", 216], ["India Gate", 1483],
];

export default async function Home({ params }: PageProps<"/[market]">) {
  const { market: code } = await params;
  const market = getMarket(code);
  const t = dict(market.lang);
  const cur = curation();
  const brandList = brands();
  const bays: BrandBay[] = BRAND_PACKS.flatMap(([name, id]) => {
    const brand = brandList.find((b) => b.name === name);
    const pack = getProduct(id);
    return brand && pack ? [{ brand, pack }] : [];
  });
  const dal = recipes().find((r) => r.slug === "dal-tadka") ?? recipes()[0];
  const pantry = getProducts(cur.pantryStaples);

  return (
    <>
      <HomeFilm
        shelf={getProducts([488, 1911, 2618, 1674, 1483, 1748, 216])}
        bays={bays}
        foreground={[1016, 1059, 1748, 809]}
        fresh={getProduct(488) as Product}
        recipe={dal}
        ingredients={getProducts(dal.ingredients)}
      />
      <div id="shop" className="scroll-mt-28">
        <section className="mx-auto max-w-[1280px] px-4 pb-10 pt-20 sm:px-6">
          <SectionHead title={t.shopTitle} sub={t.pantrySub} action={<div className="hidden sm:block"><AddAll products={pantry} /></div>} />
          <ProductRow products={pantry} />
          <div className="mt-4 sm:hidden">
            <AddAll products={pantry} />
          </div>
        </section>
        <CampaignRail market={market} />
        <CategoryTiles categories={categories()} market={market} />
        <FoundersNote market={market} />
      </div>
    </>
  );
}
