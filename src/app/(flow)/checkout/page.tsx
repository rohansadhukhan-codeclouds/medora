import { CheckoutFlow } from "@/features/journey/components/checkout-flow";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Checkout",
  description: "Review your plan and authorize payment to continue to medical intake.",
  path: "/checkout",
});

export default function CheckoutPage() {
  return <CheckoutFlow />;
}
