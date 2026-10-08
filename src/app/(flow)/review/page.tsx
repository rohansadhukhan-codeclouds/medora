import { ReviewStatusFlow } from "@/features/journey/components/review-status-flow";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Provider review",
  description: "Track provider review and treatment determination status.",
  path: "/review",
});

export default function ReviewPage() {
  return <ReviewStatusFlow />;
}
