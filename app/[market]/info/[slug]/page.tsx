import Link from "next/link";
import { notFound } from "next/navigation";
import { getMarket } from "@/lib/markets";
import { dict } from "@/lib/i18n";
import { infoPage } from "@/lib/catalog";

// Blocking navigation is fine for static text pages (Cache Components).
export const instant = false;

const SLUGS = ["delivery", "payments", "returns", "terms", "privacy", "about", "faq", "contact"] as const;

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export default async function InfoPage({ params }: PageProps<"/[market]/info/[slug]">) {
  const { market: code, slug } = await params;
  const m = getMarket(code);
  const t = dict(m.lang);
  if (!SLUGS.includes(slug as (typeof SLUGS)[number])) notFound();
  const info = slug === "contact" ? null : infoPage(m.lang, slug);
  return (
    <div className="mx-auto grid max-w-[1100px] gap-10 px-4 py-10 sm:px-6 md:grid-cols-[220px_1fr]">
      <nav aria-label={t.help} className="md:sticky md:top-32 md:self-start">
        <ul className="flex flex-wrap gap-2 md:flex-col md:gap-1">
          {SLUGS.map((s) => (
            <li key={s}>
              <Link
                href={`/${m.code}/info/${s}`}
                aria-current={s === slug ? "page" : undefined}
                className={`block rounded-full px-3 py-1.5 text-sm md:rounded-lg ${s === slug ? "bg-ink text-linen" : "text-ink-soft hover:bg-stone"}`}
              >
                {t.infoNav[s]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <article className="max-w-2xl">
        {slug === "contact" ? (
          <>
            <h1 className="font-serif text-5xl font-medium">{t.contactTitle}</h1>
            <dl className="mt-8 space-y-6 text-lg">
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wider text-ink-muted">E-mail</dt>
                <dd><a href="mailto:biuro@asianshop.pl" className="underline underline-offset-4">biuro@asianshop.pl</a></dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wider text-ink-muted">{t.warehouse}</dt>
                <dd>ul. Krakowska 62, 32-083 Balice</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wider text-ink-muted">{t.shopWroclaw}</dt>
                <dd>ul. Powstańców Śląskich 163, 53-138 Wrocław</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wider text-ink-muted">{t.phone}</dt>
                <dd className="rounded-xl bg-turmeric/15 px-4 py-3 text-base text-saffron-deep">{t.phoneToConfirm}: 780 747 999 · 514 251 728 · +48 609 993 637</dd>
              </div>
            </dl>
          </>
        ) : info ? (
          <>
            <p className="rounded-xl bg-turmeric/15 px-4 py-3 text-sm text-saffron-deep">
              {t.currentText}
              {info.fallback ? ` ${t.fallbackText}` : ""}
            </p>
            <h1 className="mt-6 font-serif text-5xl font-medium leading-tight">{info.page.title}</h1>
            <div className="mt-8 space-y-4 leading-relaxed text-ink-soft">
              {info.page.blocks.map((b, i) =>
                "h" in b ? (
                  <h2 key={i} className="pt-4 font-serif text-2xl text-ink">{b.h}</h2>
                ) : (
                  <p key={i}>{b.p}</p>
                ),
              )}
            </div>
            <p className="mt-10 text-xs text-ink-muted">
              Source: <a href={info.page.source} className="underline" rel="nofollow">{info.page.source}</a>
            </p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-5xl font-medium">{t.infoNav[slug]}</h1>
            <p className="mt-6 rounded-xl border border-chilli/30 bg-chilli/5 px-4 py-3 text-chilli">{t.missingPage}</p>
          </>
        )}
      </article>
    </div>
  );
}
