import { Suspense } from "react";
import { recipes } from "@/lib/catalog";
import { OrderConfirmed } from "@/components/order/order-confirmed";

// Orders live on this device (prototype); nothing to prerender, so navigation may block.
export const instant = false;

export const metadata = { title: "Order confirmed", robots: { index: false } };

async function Confirmed({ params }: { params: PageProps<"/[market]/order/[id]">["params"] }) {
  const { id } = await params;
  return <OrderConfirmed id={id} recipes={recipes()} />;
}

export default function OrderPage({ params }: PageProps<"/[market]/order/[id]">) {
  // The order lives on this device (prototype), so the page renders in the browser.
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <Confirmed params={params} />
    </Suspense>
  );
}
