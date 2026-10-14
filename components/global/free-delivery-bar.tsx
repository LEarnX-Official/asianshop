"use client";

import { useEffect, useRef, useState } from "react";
import { money } from "@/lib/format";
import { basketTotal, useBasket } from "@/lib/basket";
import { useMarket, useT } from "./market-context";

/** A11 FreeDeliveryBar — signature moment 3: the turmeric fill, one light sweep at unlock. */
export function FreeDeliveryBar() {
  const m = useMarket();
  const t = useT();
  const total = useBasket((s) => basketTotal(s.lines, m.currency));
  const left = Math.max(0, m.freeDeliveryFrom - total);
  const pct = Math.min(1, total / m.freeDeliveryFrom);
  const unlocked = left <= 0 && total > 0;
  const was = useRef(unlocked);
  const [sweep, setSweep] = useState(0);
  useEffect(() => {
    if (unlocked && !was.current) setSweep((s) => s + 1);
    was.current = unlocked;
  }, [unlocked]);
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-sm font-medium" aria-live="polite">
        {unlocked ? (
          <>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 text-cardamom" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m3 8.5 3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-cardamom">{t.freeDeliveryUnlocked}</span>
          </>
        ) : (
          <span className="tabular">{t.freeDeliveryLeft(money(left, m))}</span>
        )}
      </p>
      <div
        className="relative h-2 overflow-hidden rounded-full bg-stone"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct * 100)}
        aria-label={unlocked ? t.freeDeliveryUnlocked : t.freeDeliveryLeft(money(left, m))}
      >
        <div
          className={`absolute inset-y-0 left-0 w-full origin-left rounded-full ${unlocked ? "bg-cardamom" : "bg-turmeric"}`}
          style={{ transform: `scaleX(${pct})`, transition: "transform 400ms var(--ease-settle), background-color 200ms" }}
        />
        {sweep ? (
          <div key={sweep} aria-hidden="true" className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent" style={{ animation: "sweep 600ms ease-out both" }} />
        ) : null}
      </div>
    </div>
  );
}
