import { AccountCreateFlow } from "@/features/journey/components/account-create-flow";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Create account",
  description: "Create your Medora Health account to continue your care journey.",
  path: "/account/create",
});

export default function AccountCreatePage() {
  return <AccountCreateFlow />;
}
