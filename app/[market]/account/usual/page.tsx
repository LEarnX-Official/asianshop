import { getProducts } from "@/lib/catalog";
import { UsualView } from "@/components/account/account-views";

export const metadata = { title: "Your usual", robots: { index: false } };

export default function UsualPage() {
  return <UsualView demoProducts={getProducts([1483, 216, 1674, 1748, 488, 1120, 1911])} />;
}
