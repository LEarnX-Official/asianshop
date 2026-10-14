"use client";

import Link from "next/link";
import { ViewTransition } from "react";
import type { Product } from "@/lib/types";
import { useMarket } from "../global/market-context";
import { PackImage } from "./pack-image";
import { Price } from "./price";
import { FreshnessBadge } from "./badges";
import { AddToBasket } from "./add-to-basket";

export const productHref = (market: string, p: Pick<Product, "slug" | "id">) => `/${market}/p/${p.slug}-${p.id}`;

/**
 * B2 ProductCard: pack · brand · name · size · freshness · price with unit price · add.
 * `morph` names the image for the card -> page match cut; only one card per page may hold a name.
 */
export function ProductCard({ product, morph = true, priority = false }: { product: Product; morph?: boolean; priority?: boolean }) {
  const m = useMarket();
  const title = product.title[m.lang];
  const href = productHref(m.code, product);
  const image = <PackImage src={product.image} alt={`${product.brand} ${title}`} brand={product.brand} priority={priority} className="rounded-xl" />;
  return (
    <article className={`group relative flex flex-col rounded-[var(--radius-card)] bg-warm p-2.5 transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-lift ${product.stock === "out" ? "opacity-75" : ""}`}>
      <Link href={href} className="block rounded-xl focus-visible:outline-offset-4" aria-label={`${product.brand} ${title} ${product.size ?? ""}`}>
        {morph ? (
          <ViewTransition name={`pack-${product.id}`} share="morph" default="none">
            {image}
          </ViewTransition>
        ) : (
          image
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 px-1 pb-1 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-saffron-text">{product.brand}</p>
        <Link href={href} className="line-clamp-2 text-[15px] font-medium leading-snug text-ink hover:underline hover:underline-offset-4">
          {title}
        </Link>
        <p className="text-xs text-ink-muted">{product.size}</p>
        <div className="mt-0.5">
          <FreshnessBadge product={product} />
        </div>
        <div className="mt-auto flex flex-col gap-2.5 pt-2">
          <Price product={product} />
          <AddToBasket product={product} />
        </div>
      </div>
    </article>
  );
}
