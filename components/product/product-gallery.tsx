"use client";

import { useEffect, useState, ViewTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useT } from "../global/market-context";

/** B11 ProductGallery: the receiving end of the card -> page match cut (Script S7.1, S7.3). */
export function ProductGallery({ id, images, alt }: { id: number; images: string[]; alt: string }) {
  const t = useT();
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  useEffect(() => {
    if (!zoom) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setZoom(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [zoom]);
  const src = images[active] ?? images[0];
  return (
    <div className="lg:sticky lg:top-32">
      <button type="button" onClick={() => setZoom(true)} className="block w-full cursor-zoom-in rounded-[28px] focus-visible:outline-offset-4" aria-label={alt}>
        <ViewTransition name={`pack-${id}`} share="morph" default="none">
          <div className="pack-tile relative aspect-square overflow-hidden rounded-[28px]">
            <AnimatePresence initial={false}>
              <motion.img
                key={src}
                src={src}
                alt={alt}
                width={800}
                height={800}
                fetchPriority="high"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="pack-img absolute inset-0 h-full w-full object-contain p-6"
              />
            </AnimatePresence>
          </div>
        </ViewTransition>
      </button>
      {images.length > 1 ? (
        <div className="mt-3 flex gap-2">
          {images.map((im, i) => (
            <button
              key={im}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${alt} ${i + 1}`}
              aria-pressed={i === active}
              className={`pack-tile h-20 w-20 overflow-hidden rounded-xl border-2 ${i === active ? "border-ink" : "border-transparent"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.replace(".webp", "-400.webp")} alt="" className="pack-img h-full w-full object-contain" />
            </button>
          ))}
        </div>
      ) : null}
      <AnimatePresence>
        {zoom ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-linen p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setZoom(false)}
          >
            <motion.img src={src} alt={alt} initial={{ scale: 0.94 }} animate={{ scale: 1 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="max-h-full max-w-full object-contain" />
            <button type="button" onClick={() => setZoom(false)} className="absolute right-4 top-4 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-linen">
              {t.close}
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
