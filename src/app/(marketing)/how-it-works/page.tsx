import { HowItWorksPageView } from "@/features/marketing/how-it-works-page";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "How it works",
  description:
    "Learn how Medora Health guides patients from intake through provider review and follow-up care.",
  path: "/how-it-works",
});

export default function HowItWorksPage() {
  return <HowItWorksPageView />;
}
