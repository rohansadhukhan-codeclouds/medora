import { PageHeader } from "@/components/shared/page-header";
import { IntakeWizard } from "@/features/intake/components/intake-wizard";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Patient intake",
  description: "Complete your Medora Health intake for provider review.",
  path: "/intake",
  noIndex: true,
});

export default function IntakePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient intake"
        description="Share your information in guided steps. Fields are architectural placeholders until final clinical requirements are provided."
      />
      <IntakeWizard />
    </div>
  );
}
