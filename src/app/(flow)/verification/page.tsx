import { VerificationFlow } from "@/features/journey/components/verification-flow";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Identity verification",
  description: "Verify your identity before provider review.",
  path: "/verification",
});

export default function VerificationPage() {
  return <VerificationFlow />;
}
