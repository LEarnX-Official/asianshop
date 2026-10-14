import { BRAND_RED, TAGLINE } from "@/lib/brand-assets";

/** The shop's elephant mascot badge (the real one from asianshop.pl). */
export function Emblem({ className = "h-8 w-8" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- 128 px transparent badge, shown at up to ~64 px
  return <img src="/brand/emblem.webp" alt="" width={128} height={128} className={`shrink-0 select-none ${className}`} draggable={false} />;
}

/**
 * Header/menu lockup: the real emblem, the name set in our serif, and the real line "Bringing Home Closer".
 * The colour follows the surrounding text, so it works on the day and night header.
 */
export function Logo({ className = "", tagline = true }: { className?: string; tagline?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 max-[340px]:gap-1.5 ${className}`}>
      <Emblem className="h-9 w-9 max-[340px]:h-8 max-[340px]:w-8 sm:h-10 sm:w-10" />
      <span className="flex flex-col leading-none">
        <span className="font-serif text-[20px] font-medium tracking-tight max-[340px]:text-[18px] sm:text-[22px]">Asian Shop</span>
        {tagline ? (
          <span className="mt-1 hidden text-[9.5px] font-semibold uppercase tracking-[0.2em] opacity-60 sm:block">{TAGLINE}</span>
        ) : null}
      </span>
    </span>
  );
}

/**
 * The round seal, as on the shop's banners: name arched over the emblem, the line arched under it.
 * Drawn as SVG (text on a path) so it stays sharp at any size; the emblem in the middle is the real badge.
 */
export function Seal({ className = "h-28 w-28", ring = "currentColor" }: { className?: string; ring?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={`Asian Shop · ${TAGLINE}`}>
      <defs>
        <path id="seal-top" d="M 30 100 A 70 70 0 0 1 170 100" />
        <path id="seal-bottom" d="M 24 100 A 76 76 0 0 0 176 100" />
      </defs>
      <circle cx="100" cy="100" r="97" fill="none" stroke={ring} strokeOpacity="0.18" strokeWidth="1.5" />
      <text fill={BRAND_RED} fontFamily="var(--font-fraunces), Georgia, serif" fontSize="25" fontWeight="700" letterSpacing="2">
        <textPath href="#seal-top" startOffset="50%" textAnchor="middle">
          ASIAN SHOP
        </textPath>
      </text>
      <text fill="currentColor" fontFamily="var(--font-dm-sans), system-ui, sans-serif" fontSize="11.5" fontWeight="600" letterSpacing="3.2">
        <textPath href="#seal-bottom" startOffset="50%" textAnchor="middle" dominantBaseline="hanging">
          {TAGLINE.toUpperCase()}
        </textPath>
      </text>
      <circle cx="27" cy="104" r="3" fill="#e9a23b" />
      <circle cx="173" cy="104" r="3" fill="#e9a23b" />
      <image href="/brand/emblem.webp" x="58" y="58" width="84" height="84" />
    </svg>
  );
}
