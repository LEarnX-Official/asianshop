import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DM_Sans, Fraunces } from "next/font/google";
import "../globals.css";
import { MARKET_CODES, getMarket, isMarketCode } from "@/lib/markets";
import { dict } from "@/lib/i18n";
import { categories } from "@/lib/catalog";
import { MarketProvider } from "@/components/global/market-context";
import { InlineScript } from "@/components/global/inline-script";
import { SKY_SCRIPT } from "@/lib/sky";
import { Header } from "@/components/global/header";
import { Footer } from "@/components/global/footer";
import { BasketDrawer } from "@/components/global/basket-drawer";
import { Toasts } from "@/components/global/toasts";
import { ConsentBar } from "@/components/global/consent-bar";

const fraunces = Fraunces({ subsets: ["latin", "latin-ext"], variable: "--font-fraunces", axes: ["opsz"] });
const dmSans = DM_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-dm-sans" });

export function generateStaticParams() {
  return MARKET_CODES.map((market) => ({ market }));
}

export async function generateMetadata({ params }: LayoutProps<"/[market]">): Promise<Metadata> {
  const { market } = await params;
  const m = getMarket(market);
  const t = dict(m.lang);
  const title = {
    pl: "Indyjskie i azjatyckie produkty z dostawą po Europie · AsianShop",
    de: "Indische & asiatische Lebensmittel, geliefert in ganz Europa · AsianShop",
    en: "Indian & Asian groceries delivered across Europe · AsianShop",
  }[m.lang];
  return {
    title: { default: title, template: "%s · AsianShop" },
    description: t.heroSub,
    // prototype deployment: never indexed (the live shop is asianshop.pl)
    robots: { index: false, follow: false },
    alternates: {
      // hreflang on every page (Script S0) — fixes the missing tags on today's site
      languages: { "pl-PL": "/pl-pl", "en-PL": "/pl-en", "de-DE": "/de-de", "en-DE": "/de-en" },
    },
  };
}

export default async function MarketLayout({ children, params }: LayoutProps<"/[market]">) {
  const { market } = await params;
  if (!isMarketCode(market)) notFound();
  const m = getMarket(market);
  const t = dict(m.lang);
  const cats = categories();
  return (
    <html lang={m.lang} className={`${fraunces.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        <InlineScript html={SKY_SCRIPT} />
      </head>
      <body className="min-h-dvh flex flex-col bg-linen text-ink">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-linen">
          {t.skip}
        </a>
        <MarketProvider code={market}>
          <Header categories={cats} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer categories={cats} />
          <BasketDrawer />
          <Toasts />
          <ConsentBar />
        </MarketProvider>
      </body>
    </html>
  );
}
