import { Suspense } from "react";
import { EligibilityFlow } from "@/features/journey/components/eligibility-flow";
import { buildMetadata } from "@/config/metadata";

export const instant = false;

export const metadata = buildMetadata({
  title: "Eligibility",
  description: "Complete a preliminary eligibility check for Medora Health.",
  path: "/eligibility",
});

export default function EligibilityPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <EligibilityFlow />
    </Suspense>
  );
}
