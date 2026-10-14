import { skyline, stars } from "./skyline";

/* Scene 1 set: a European old town at dusk. Each depth plane is its own layer so the
   camera push-in can move them at different speeds (a real dolly, not a zoom). */

const FAR = skyline({ seed: 7, minH: 210, maxH: 400, minW: 60, maxW: 120, winSize: 6, litShare: 0.3 });
const MID = skyline({ seed: 23, minH: 290, maxH: 500, minW: 90, maxW: 170, winSize: 9, litShare: 0.42, skip: [560, 1040] });
const STARS = stars(11, 70);

function Windows({ list, color, className }: { list: { x: number; y: number; w: number; h: number; lit: boolean; delay: number }[]; color: string; className: string }) {
  return (
    <g>
      {list.map((w, i) =>
        w.lit ? (
          <rect key={i} x={w.x} y={w.y} width={w.w} height={w.h} rx="1" fill={color} className={className} style={{ ["--d" as string]: `${w.delay}` }} />
        ) : null,
      )}
    </g>
  );
}

export function CitySky() {
  return (
    <div className="film-sky absolute inset-0">
      <svg aria-hidden="true" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMin slice" className="absolute inset-0 h-full w-full">
        <defs>
          <mask id="moon-cut">
            <rect width="1600" height="1000" fill="white" />
            <circle cx="1276" cy="140" r="34" fill="black" />
          </mask>
          <radialGradient id="moon-halo">
            <stop offset="0" stopColor="#f6e7c4" stopOpacity="0.35" />
            <stop offset="1" stopColor="#f6e7c4" stopOpacity="0" />
          </radialGradient>
        </defs>
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#f7efd9" className="film-star" style={{ ["--d" as string]: `${s.d}` }} />
        ))}
        <circle cx="1262" cy="152" r="140" fill="url(#moon-halo)" />
        <circle cx="1262" cy="152" r="36" fill="#f6ecd4" mask="url(#moon-cut)" />
      </svg>
    </div>
  );
}

export function CityFar() {
  return (
    <div className="film-layer film-far">
      <svg aria-hidden="true" viewBox="0 0 1600 1000" className="h-full w-full">
        <path d={FAR.path} fill="#4a4676" />
        <Windows list={FAR.windows} color="#f5c879" className="film-lit film-lit--far" />
      </svg>
    </div>
  );
}

export function CityMid() {
  return (
    <div className="film-layer film-mid">
      <svg aria-hidden="true" viewBox="0 0 1600 1000" className="h-full w-full">
        <path d={MID.path} fill="#2f2a51" />
        <Windows list={MID.windows} color="#ffcf86" className="film-lit" />
      </svg>
    </div>
  );
}

/** The building with our window. Window centre = (800, 560) = 50% / 56% of the layer box. */
export function CityHome() {
  return (
    <div className="film-layer film-home">
      <svg aria-hidden="true" viewBox="0 0 1600 1000" className="h-full w-full">
        <defs>
          <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe2a6" />
            <stop offset="0.6" stopColor="#ffbe6e" />
            <stop offset="1" stopColor="#f08c46" />
          </linearGradient>
          <radialGradient id="home-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffc777" stopOpacity="0.8" />
            <stop offset="0.45" stopColor="#ff9b52" stopOpacity="0.25" />
            <stop offset="1" stopColor="#ff9b52" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="800" cy="560" r="430" fill="url(#home-glow)" className="film-glow" />
        {/* the facade */}
        <path d="M590 1000 V330 L610 318 H990 L1010 330 V1000 Z" fill="#26213d" />
        <rect x="580" y="300" width="440" height="22" rx="3" fill="#1d1931" />
        <path d="M640 300 L800 210 L960 300 Z" fill="#221d38" />
        <circle cx="800" cy="262" r="16" fill="#ffcf86" opacity="0.85" />
        {/* neighbour windows on our building */}
        {[[628, 380], [902, 380], [628, 760], [902, 760]].map(([x, y], i) => (
          <g key={i}>
            <rect x={x} y={y} width="70" height="110" rx="4" fill={i === 1 ? "#ffcf86" : "#3a3360"} opacity={i === 1 ? 0.9 : 1} />
            <path d={`M${x + 35} ${y} V${y + 110} M${x} ${y + 48} H${x + 70}`} stroke="#1d1931" strokeWidth="5" />
          </g>
        ))}
        {/* our window: warm glass with a glimpse of the shelf and the lamp inside */}
        <rect x="686" y="418" width="228" height="284" rx="8" fill="#1a1630" />
        <rect x="700" y="432" width="200" height="256" rx="4" fill="url(#glass)" />
        <path d="M790 432 v34 M790 466 q0 0 -16 22 h32 q-16 -22 -16 -22" stroke="#6b3d1e" strokeWidth="2.5" fill="#6b3d1e" opacity="0.55" />
        <rect x="712" y="618" width="176" height="7" fill="#7a4a26" opacity="0.7" />
        {[[722, 584, 22, 34, "#c23a2a"], [750, 576, 26, 42, "#2f6db5"], [782, 590, 18, 28, "#e2b13c"], [806, 580, 22, 38, "#3f8a4a"], [834, 588, 20, 30, "#d8662a"], [860, 594, 18, 24, "#f2eee2"]].map(([x, y, w, h, c], i) => (
          <rect key={i} x={x as number} y={y as number} width={w as number} height={h as number} rx="2" fill={c as string} opacity="0.75" />
        ))}
        <path d="M700 432 q30 120 4 256 h-4 Z M900 432 q-30 120 -4 256 h4 Z" fill="#d9773a" opacity="0.55" />
        <path d="M800 432 V688 M700 552 H900" stroke="#1a1630" strokeWidth="9" />
        <rect x="676" y="702" width="248" height="14" rx="3" fill="#1d1931" />
        <path d="M694 702 q8 -26 18 0 M724 702 q10 -34 20 0 M760 702 q6 -22 14 0 M842 702 q10 -30 18 0 M876 702 q8 -24 16 0" stroke="#3d5a3a" strokeWidth="6" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/** Foreground roofs, chimney with smoke, an aerial, and a cat on the ridge. */
export function CityNear() {
  return (
    <div className="film-layer film-near">
      <svg aria-hidden="true" viewBox="0 0 1600 1000" className="h-full w-full">
        <path d="M-40 1000 V760 L240 700 L520 1000 Z" fill="#181424" />
        <path d="M1640 1000 V720 L1360 650 L1080 1000 Z" fill="#14111f" />
        <rect x="120" y="640" width="46" height="96" fill="#1f1a2e" />
        <rect x="112" y="632" width="62" height="14" fill="#262036" />
        <g className="film-smoke" fill="none" stroke="#b9b3c9" strokeWidth="8" strokeLinecap="round" opacity="0.25">
          <path d="M143 620 q-18 -40 6 -80 q22 -36 -4 -74" />
        </g>
        <path d="M1420 664 V560 M1392 586 H1448 M1400 604 H1440" stroke="#2a2440" strokeWidth="5" />
        {/* the cat */}
        <path d="M1236 676 q-6 -24 6 -38 l4 -12 l6 10 h10 l6 -10 l4 12 q12 14 6 38 q18 -2 22 10 q-26 2 -36 2 h-26 z" fill="#0f0d17" />
      </svg>
    </div>
  );
}
