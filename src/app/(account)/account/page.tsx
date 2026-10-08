import { AccountOverview } from "@/features/account/components/account-overview";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Account",
  description: "Medora Health account overview.",
  path: "/account",
});

export default function AccountPage() {
  return <AccountOverview />;
}
