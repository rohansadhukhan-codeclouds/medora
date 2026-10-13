import { CartPageView } from "@/features/cart/components/cart-page-view";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Cart",
  description:
    "Review selected treatments, then continue to medical intake.",
  path: "/cart",
});

export default function CartPage() {
  return <CartPageView />;
}
