"use client";

import { useEffect, useRef, useState } from "react";

/**
 * B1 ProductTile image: the trimmed pack photo on a stone tile, white background blended away.
 * Falls back to a brand-coloured tile with the name when a photo is missing.
 */
export function PackImage({
  src,
  alt,
  brand,
  sizes = "(min-width: 1024px) 220px, 45vw",
  priority = false,
  className = "",
  large = false,
}: {
  src: string;
  alt: string;
  brand?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  large?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    // The image may finish (or fail) before React attaches its handlers.
    const img = ref.current;
    if (img?.complete) {
      if (img.naturalWidth > 0) setLoaded(true);
      else setFailed(true);
    }
  }, []);
  const small = src.replace(/\.webp$/, "-400.webp");
  if (failed) {
    return (
      <div className={`pack-tile flex aspect-square items-center justify-center p-4 text-center ${className}`}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-saffron-text">{brand}</p>
          <p className="mt-1 text-sm text-ink-soft">{alt}</p>
        </div>
      </div>
    );
  }
  return (
    <div className={`pack-tile aspect-square overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- photos are pre-sized WebP from our pipeline */}
      <img
        ref={ref}
        src={large ? src : small}
        srcSet={`${small} 400w, ${src} 800w`}
        sizes={sizes}
        alt={alt}
        width={800}
        height={800}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`pack-img h-full w-full object-contain transition-opacity duration-150 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
