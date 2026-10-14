import Link from "next/link";
import { notFound } from "next/navigation";
import { getMarket } from "@/lib/markets";
import { dict } from "@/lib/i18n";
import { getProducts, hasImage, recipes } from "@/lib/catalog";
import { IngredientList } from "@/components/recipe/ingredient-list";

// Navigation into this page may wait for it to render: that is what lets the card -> page
// match cut pair both images in one commit (React <ViewTransition>). All data is local and prerendered.
export const instant = false;

export function generateStaticParams() {
  return recipes().map((r) => ({ slug: r.slug }));
}

export default async function RecipePage({ params }: PageProps<"/[market]/recipes/[slug]">) {
  const { market: code, slug } = await params;
  const m = getMarket(code);
  const t = dict(m.lang);
  const r = recipes().find((x) => x.slug === slug);
  if (!r) notFound();
  const ingredients = getProducts(r.ingredients);
  return (
    <article className="mx-auto max-w-[1280px] px-4 pb-10 pt-6 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
        <Link href={`/${m.code}`} className="hover:underline">{t.home}</Link> <span aria-hidden="true">›</span> <span className="text-ink">{r.title[m.lang]}</span>
      </nav>
      {/* E1 RecipeHero: no food photography yet, so the real ingredients form the still life */}
      <header className="mt-6 grid overflow-hidden rounded-[28px] bg-ink text-linen lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col justify-center gap-3 p-8 sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-turmeric">{r.region[m.lang]}</p>
          <h1 className="font-serif text-5xl font-medium leading-tight">{r.title[m.lang]}</h1>
          <p className="text-linen/75">{r.from[m.lang]}</p>
          <p className="text-sm text-linen/75">
            {t.minutes(r.minutes)} · {t.serves(r.serves)} · {ingredients.length} {t.ingredientsTitle.toLowerCase()}
          </p>
        </div>
        <div className="grid grid-cols-3 place-items-center gap-3 bg-[radial-gradient(circle_at_40%_30%,#3a2e26,#1f1a17)] p-8">
          {ingredients.slice(0, 9).map((p, i) => (
            <div key={p.id} className="h-20 w-20 rounded-2xl bg-linen/95 p-1.5 sm:h-24 sm:w-24" style={{ transform: `rotate(${[-6, 3, -2, 5, -4, 2, 6, -3, 4][i]}deg)` }}>
              {hasImage(p.id) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image.replace(".webp", "-400.webp")} alt="" className="pack-img h-full w-full object-contain" />
              ) : null}
            </div>
          ))}
        </div>
      </header>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <section>
          <h2 className="mb-4 font-serif text-3xl">{t.ingredientsTitle}</h2>
          <IngredientList products={ingredients} dish={r.title[m.lang]} />
        </section>
        <section>
          <h2 className="mb-4 font-serif text-3xl">{t.stepsTitle}</h2>
          <ol className="space-y-5">
            {r.steps[m.lang].map((s, i) => (
              <li key={i} className="flex gap-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-saffron font-semibold text-white">{i + 1}</span>
                <p className="pt-1 text-lg leading-relaxed">{s}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}
