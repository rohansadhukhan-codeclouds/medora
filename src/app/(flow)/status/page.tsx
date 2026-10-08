import { StatusPageView } from "@/features/journey/components/status-page-view";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Treatment status",
  description: "View Medora Health treatment, pharmacy, and shipment status.",
  path: "/status",
});

export default function StatusPage() {
  return <StatusPageView />;
}
