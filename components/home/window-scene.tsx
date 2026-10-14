/**
 * The hero "shot" (Experience Script S1): a warm kitchen window in a European city.
 * Colours come from CSS variables set by the visitor's local time (morning/day/evening/night).
 * Pure SVG, no animation here; packs and steam are layered on top by HeroShelf.
 */
export function WindowScene() {
  return (
    <svg aria-hidden="true" viewBox="0 0 700 520" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--sky-top)" }} />
          <stop offset="1" style={{ stopColor: "var(--sky-bottom)" }} />
        </linearGradient>
        <radialGradient id="roomglow" cx="0.5" cy="1" r="0.9">
          <stop offset="0" stopColor="#ffcf8a" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffcf8a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c48f5f" />
          <stop offset="1" stopColor="#a8744a" />
        </linearGradient>
        <clipPath id="glass">
          <rect x="58" y="26" width="584" height="268" rx="14" />
        </clipPath>
      </defs>

      {/* the kitchen wall */}
      <rect width="700" height="520" fill="#efe3d1" />
      <rect width="700" height="520" fill="url(#roomglow)" style={{ opacity: "var(--room-glow)" }} />

      {/* the view outside */}
      <g clipPath="url(#glass)">
        <rect x="58" y="26" width="584" height="268" fill="url(#sky)" />
        <circle cx="520" cy="92" r="30" fill="#fff1c9" style={{ opacity: "var(--sun)" }} />
        <g style={{ opacity: "var(--moon)" }}>
          <circle cx="510" cy="86" r="20" fill="#f4ecd6" />
          <circle cx="519" cy="80" r="18" style={{ fill: "var(--sky-top)" }} />
          {[[150, 60], [230, 92], [330, 52], [410, 104], [600, 64], [120, 120], [460, 46]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="#f6efd9" />
          ))}
        </g>
        {/* far rooftops: pitched roofs and a church spire, a European old town */}
        <path
          style={{ fill: "var(--roof-far)" }}
          d="M58 220 L90 196 L122 220 L122 206 L150 184 L178 206 L178 214 L214 190 L250 214 L262 214 L262 140 L270 112 L278 140 L278 214 L300 214 L330 186 L360 214 L392 196 L392 178 L404 178 L404 200 L430 184 L462 208 L498 182 L534 208 L560 192 L596 216 L642 196 L642 294 L58 294 Z"
        />
        {/* near rooftops with chimneys and windows */}
        <path
          style={{ fill: "var(--roof-near)" }}
          d="M58 250 L110 214 L162 250 L162 236 L176 236 L176 222 L188 222 L188 240 L232 208 L288 248 L330 226 L372 252 L420 214 L470 250 L470 238 L484 238 L484 226 L496 226 L496 246 L540 218 L592 252 L642 228 L642 294 L58 294 Z"
        />
        <g fill="#ffd98a" style={{ opacity: "var(--lit)" }}>
          {[[96, 256], [124, 262], [208, 252], [252, 262], [318, 258], [352, 266], [400, 250], [440, 262], [520, 254], [560, 266], [612, 258]].map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="9" height="12" rx="1.5" />
          ))}
        </g>
      </g>

      {/* window frame and mullions */}
      <rect x="58" y="26" width="584" height="268" rx="14" fill="none" stroke="#fffaf2" strokeWidth="14" />
      <path d="M350 26 V294 M58 150 H642" stroke="#fffaf2" strokeWidth="9" />
      <rect x="44" y="20" width="612" height="282" rx="20" fill="none" stroke="#e2d3bd" strokeWidth="3" />

      {/* windowsill (the top shelf) and the lower shelf */}
      <rect x="30" y="294" width="640" height="18" rx="4" fill="url(#wood)" />
      <rect x="30" y="309" width="640" height="5" fill="#8f603c" opacity="0.5" />
      <rect x="30" y="462" width="640" height="16" rx="4" fill="url(#wood)" />
      <rect x="30" y="475" width="640" height="5" fill="#8f603c" opacity="0.5" />
      <path d="M80 478 v18 h18 M620 478 v18 h-18" stroke="#9d6c45" strokeWidth="5" fill="none" />
    </svg>
  );
}

/** The chai cup on the lower shelf, with three steam wisps (2.4 s loop, 3 cycles, then still). */
export function ChaiCup({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 120" className={className}>
      <g fill="none" stroke="#fffaf2" strokeWidth="4" strokeLinecap="round" opacity="0.9">
        {[1.08, 1.48, 1.88].map((d, i) => (
          <path
            key={d}
            className="steam"
            style={{ animationDelay: `${d}s, ${d + 7.2}s` }}
            d={["M44 46 c-8 -10 8 -14 0 -26", "M60 44 c-8 -10 8 -14 0 -28", "M76 46 c-8 -10 8 -14 0 -26"][i]}
          />
        ))}
      </g>
      <ellipse cx="60" cy="108" rx="40" ry="7" fill="#d8c8b2" />
      <path d="M26 58 h68 l-6 34 a14 14 0 0 1 -14 12 h-28 a14 14 0 0 1 -14 -12 Z" fill="#fbf5ea" stroke="#d9c6ac" strokeWidth="2" />
      <path d="M93 66 c16 0 16 22 -2 22" fill="none" stroke="#d9c6ac" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="60" cy="58" rx="34" ry="6" fill="#b5703c" />
      <path d="M34 74 h52" stroke="#c8611e" strokeWidth="3" opacity="0.6" />
    </svg>
  );
}
