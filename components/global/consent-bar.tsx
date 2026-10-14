"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useT } from "./market-context";

const KEY = "asianshop-consent";

/**
 * S3: asked gently, after the hero has settled (1.2 s), never a wall. Accept and Reject have the
 * same size and weight. No analytics would load before a choice.
 */
export function ConsentBar() {
  const t = useT();
  const [show, setShow] = useState(false);
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch {}
    if (stored) return;
    const id = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(id);
  }, []);
  const decide = (v: "accepted" | "rejected") => {
    try {
      localStorage.setItem(KEY, v);
    } catch {}
    setShow(false);
  };
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          role="region"
          aria-label="Cookies"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 bottom-3 z-[55] mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-line bg-warm p-4 shadow-lift sm:flex-row sm:items-center sm:gap-5 sm:p-5"
        >
          <p className="flex-1 text-sm leading-relaxed text-ink-soft">{t.cookieText}</p>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => decide("rejected")} className="h-11 flex-1 rounded-full border border-ink px-5 text-sm font-semibold sm:flex-none">
              {t.reject}
            </button>
            <button type="button" onClick={() => decide("accepted")} className="h-11 flex-1 rounded-full border border-ink bg-ink px-5 text-sm font-semibold text-linen sm:flex-none">
              {t.accept}
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
