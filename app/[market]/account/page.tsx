import { getProducts } from "@/lib/catalog";
import { AccountView } from "@/components/account/account-views";

export const metadata = { title: "Account", robots: { index: false } };


export default function AccountPage() {
  return <AccountView demoProducts={getProducts([1483, 216, 1674, 1748, 488, 1120, 1911])} />;
}
