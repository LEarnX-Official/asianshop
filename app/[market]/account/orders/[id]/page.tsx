import { Suspense } from "react";
import { TrackingView } from "@/components/account/account-views";

// Orders live on this device (prototype); nothing to prerender, so navigation may block.
export const instant = false;

export const metadata = { title: "Tracking", robots: { index: false } };

async function Tracking({ params }: { params: PageProps<"/[market]/account/orders/[id]">["params"] }) {
  const { id } = await params;
  return <TrackingView id={id} />;
}

export default function TrackingPage({ params }: PageProps<"/[market]/account/orders/[id]">) {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <Tracking params={params} />
    </Suspense>
  );
}
