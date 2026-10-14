"use client";

// Signature moment 2 (Experience Script S8): a small spice dot flies from the add button
// to the basket on a curved arc, then the basket bumps.

let target: HTMLElement | null = null;
let inFlight = 0;

export function registerBasketTarget(el: HTMLElement | null) {
  target = el;
}

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export type Token = "dot" | "marigold";

function visible(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
}

/** Returns false when no flight happened (reduced motion, basket off-screen, too many dots). */
export function flyToBasket(from: HTMLElement, opts: { token?: Token; delay?: number } = {}): boolean {
  if (!target || reducedMotion() || !visible(target) || inFlight >= 3) {
    window.dispatchEvent(new CustomEvent("basket:arrive"));
    return false;
  }
  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2;
  const x1 = b.left + b.width / 2, y1 = b.top + b.height / 2;
  const lift = window.innerWidth < 640 ? 80 : 120;
  const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - lift; // apex above the start (S8)

  const dot = document.createElement("div");
  dot.className = opts.token === "marigold" ? "fly-token fly-token--marigold" : "fly-token";
  dot.setAttribute("aria-hidden", "true");
  document.body.appendChild(dot);
  inFlight++;

  const frames: Keyframe[] = [];
  const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * x1;
    const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y1;
    const s = 1 - 0.4 * t;
    frames.push({
      transform: `translate(${x - 5}px, ${y - 5}px) scale(${s}) rotate(${opts.token === "marigold" ? t * 120 : 0}deg)`,
      opacity: t > 0.87 ? 0 : 1,
      offset: t,
    });
  }
  const anim = dot.animate(frames, { duration: 450, delay: opts.delay ?? 40, easing: "cubic-bezier(.5,0,.2,1)", fill: "both" });
  anim.onfinish = () => {
    dot.remove();
    inFlight--;
    window.dispatchEvent(new CustomEvent("basket:arrive"));
  };
  return true;
}
