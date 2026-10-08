import { IntakeFlow } from "@/features/journey/components/intake-flow";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Medical intake",
  description: "Complete your Medora Health medical intake for provider review.",
  path: "/intake",
});

export default function IntakePage() {
  return <IntakeFlow />;
}
