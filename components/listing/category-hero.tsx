import { aisleIcon, BACKDROPS } from "@/lib/brand-assets";

/**
 * Category page heading. Two aisles have a real photo from the shop (spices on slate, rice terraces);
 * the rest carry the shop's own aisle illustration, large, like the sign above a supermarket aisle.
 */
export function CategoryHero({ k, title, count }: { k: string; title: string; count: string }) {
  const photo = BACKDROPS[k];
  const icon = aisleIcon(k);
  if (photo) {
    return (
      <header className="relative mt-4 overflow-hidden rounded-[28px] bg-ink text-linen">
        {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP set */}
        <img
          src={`${photo.src}-1200.webp`}
          srcSet={`${photo.src}-700.webp 700w, ${photo.src}-1200.webp 1200w, ${photo.src}-2000.webp 2000w`}
          sizes="(min-width: 1280px) 1232px, 100vw"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: photo.position }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,14,11,0.82)_0%,rgba(18,14,11,0.55)_45%,rgba(18,14,11,0)_80%)]" />
        <div className="relative flex min-h-[200px] flex-col justify-end gap-2 p-6 sm:min-h-[260px] sm:p-10">
          {icon ? (
            // eslint-disable-next-line @next/next/no-img-element -- small pre-sized icon
            <img src={icon} alt="" width={56} height={56} className="h-12 w-12 sm:h-14 sm:w-14" />
          ) : null}
          <h1 className="font-serif text-4xl font-medium tracking-tight drop-shadow-[0_2px_16px_rgba(0,0,0,0.4)] sm:text-5xl">{title}</h1>
          <p className="text-linen/80">{count}</p>
        </div>
      </header>
    );
  }
  return (
    <header className="mt-3 flex items-center gap-4 sm:gap-6">
      {icon ? (
        // eslint-disable-next-line @next/next/no-img-element -- pre-sized icon
        <img src={icon} alt="" width={96} height={96} className="h-16 w-16 shrink-0 sm:h-24 sm:w-24" />
      ) : null}
      <div>
        <h1 className="font-serif text-4xl font-medium tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-2 text-ink-soft">{count}</p>
      </div>
    </header>
  );
}
