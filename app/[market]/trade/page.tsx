import { getMarket } from "@/lib/markets";
import { dict } from "@/lib/i18n";
import { QuickOrder } from "@/components/trade/quick-order";

export default async function TradePage({ params }: PageProps<"/[market]/trade">) {
  const { market } = await params;
  const t = dict(getMarket(market).lang);
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <header className="rounded-[28px] bg-ink px-8 py-12 text-linen sm:px-12">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-turmeric">Trade</p>
        <h1 className="mt-3 max-w-3xl font-serif text-5xl font-medium leading-tight sm:text-6xl">{t.tradeTitle}</h1>
        <p className="mt-4 max-w-2xl text-lg text-linen/75">{t.tradeSub}</p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-3">
          {[t.tradeB1, t.tradeB2, t.tradeB3].map((b) => (
            <li key={b} className="rounded-2xl bg-white/5 px-5 py-4 text-sm leading-relaxed">
              <span className="text-turmeric">✓</span> {b}
            </li>
          ))}
        </ul>
        <button type="button" className="mt-8 h-12 rounded-full bg-linen px-6 text-sm font-semibold text-ink">
          {t.applyTrade}
        </button>
      </header>
      <section className="mt-12">
        <QuickOrder />
      </section>
    </div>
  );
}
