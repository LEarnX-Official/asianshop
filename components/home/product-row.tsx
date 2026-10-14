"use client";

import type { Product } from "@/lib/types";
import { ProductCard } from "../product/product-card";

/** A horizontal shelf on mobile (snap, the next card half visible), a grid on desktop. */
export function ProductRow({ products, morph = true }: { products: Product[]; morph?: boolean }) {
  return (
    <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
      {products.map((p) => (
        <li key={p.id} className="w-[46%] shrink-0 snap-start sm:w-auto">
          <ProductCard product={p} morph={morph} />
        </li>
      ))}
    </ul>
  );
}
