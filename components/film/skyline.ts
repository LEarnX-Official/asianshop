// Deterministic European rooftops for the film's city layers (same output on server and client).

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export type Win = { x: number; y: number; w: number; h: number; lit: boolean; delay: number };
export type Skyline = { path: string; windows: Win[] };

/**
 * Builds a strip of buildings from x=0..width, sitting on y=bottom.
 * Roof types: pitched, gable (stepped), flat with chimney, spire (rare).
 */
export function skyline(opts: {
  seed: number;
  width?: number;
  bottom?: number;
  minH: number;
  maxH: number;
  minW?: number;
  maxW?: number;
  litShare?: number;
  winSize?: number;
  skip?: [number, number];
}): Skyline {
  const r = rng(opts.seed);
  const width = opts.width ?? 1600;
  const bottom = opts.bottom ?? 1000;
  const minW = opts.minW ?? 70;
  const maxW = opts.maxW ?? 150;
  const ws = opts.winSize ?? 10;
  let x = -20;
  const parts: string[] = [];
  const windows: Win[] = [];
  while (x < width + 20) {
    const w = Math.round(minW + r() * (maxW - minW));
    const h = Math.round(opts.minH + r() * (opts.maxH - opts.minH));
    const top = bottom - h;
    const kind = r();
    const skip = opts.skip && x + w > opts.skip[0] && x < opts.skip[1];
    if (!skip) {
      let d = `M${x} ${bottom} L${x} ${top}`;
      if (kind < 0.42) {
        const peak = top - (18 + r() * w * 0.45);
        d += ` L${x + w / 2} ${peak} L${x + w} ${top}`;
      } else if (kind < 0.62) {
        const s = w / 6;
        d += ` L${x + s} ${top} L${x + s} ${top - 14} L${x + 2 * s} ${top - 14} L${x + 2 * s} ${top - 28} L${x + 4 * s} ${top - 28} L${x + 4 * s} ${top - 14} L${x + 5 * s} ${top - 14} L${x + 5 * s} ${top} L${x + w} ${top}`;
      } else if (kind < 0.95) {
        const cx = x + w * (0.2 + r() * 0.5);
        d += ` L${cx} ${top} L${cx} ${top - 26} L${cx + 14} ${top - 26} L${cx + 14} ${top} L${x + w} ${top}`;
      } else {
        const cx = x + w / 2;
        d += ` L${cx - 12} ${top} L${cx - 12} ${top - 40} L${cx} ${top - 110} L${cx + 12} ${top - 40} L${cx + 12} ${top} L${x + w} ${top}`;
      }
      d += ` L${x + w} ${bottom} Z`;
      parts.push(d);
      const cols = Math.max(1, Math.floor((w - 16) / (ws * 2.4)));
      const rows = Math.max(1, Math.floor((h - 30) / (ws * 2.6)));
      const gx = (w - cols * ws) / (cols + 1);
      for (let cI = 0; cI < cols; cI++) {
        for (let rI = 0; rI < rows; rI++) {
          if (r() < 0.35) continue;
          windows.push({
            x: Math.round(x + gx + cI * (ws + gx)),
            y: Math.round(top + 18 + rI * ws * 2.6),
            w: ws,
            h: Math.round(ws * 1.35),
            lit: r() < (opts.litShare ?? 0.35),
            delay: Math.round(r() * 1000) / 1000,
          });
        }
      }
    }
    x += w + Math.round(r() * 6);
  }
  return { path: parts.join(" "), windows };
}

export function stars(seed: number, n: number) {
  const r = rng(seed);
  return Array.from({ length: n }, () => ({ x: Math.round(r() * 1600), y: Math.round(r() * 520), r: Math.round((0.6 + r() * 1.4) * 10) / 10, d: Math.round(r() * 30) / 10 }));
}
