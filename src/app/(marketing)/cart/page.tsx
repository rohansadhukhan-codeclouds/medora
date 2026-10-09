import { CartPageView } from "@/features/cart/components/cart-page-view";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Cart",
  description: "Review the treatments you added before continuing your care journey.",
  path: "/cart",
});

export default function CartPage() {
  return <CartPageView />;
}
