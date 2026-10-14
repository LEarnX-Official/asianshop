import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata = { title: "Checkout", robots: { index: false } };

export default function Checkout() {
  return (
    <div className="min-h-[70vh] bg-stone/50">
      <CheckoutView />
    </div>
  );
}
