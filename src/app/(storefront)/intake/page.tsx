import { IntakePageView } from "@/features/intake/components/intake-page-view";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Medical intake",
  description:
    "Complete your Medora Health medical intake before clinician review.",
  path: "/intake",
});

export default function IntakePage() {
  return <IntakePageView />;
}
