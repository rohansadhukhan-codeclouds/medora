import { PlanSelectionFlow } from "@/features/journey/components/plan-selection-flow";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Choose plan",
  description: "Select a Medora Health subscription care plan.",
  path: "/plan",
});

export default function PlanPage() {
  return <PlanSelectionFlow />;
}
