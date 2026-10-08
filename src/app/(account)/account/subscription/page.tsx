import { SubscriptionManagement } from "@/features/account/components/subscription-management";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Subscription",
  description: "Manage your Medora Health subscription and refill preferences.",
  path: "/account/subscription",
});

export default function AccountSubscriptionPage() {
  return <SubscriptionManagement />;
}
