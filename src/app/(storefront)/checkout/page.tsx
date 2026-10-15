import { CheckoutPageView } from "@/features/checkout/components/checkout-page-view";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Checkout",
  description: "Review your Medora Health order and complete checkout.",
  path: "/checkout",
});

export default function CheckoutPage() {
  return <CheckoutPageView />;
}
