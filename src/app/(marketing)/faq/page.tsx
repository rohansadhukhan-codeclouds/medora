import { FaqPageView } from "@/features/marketing/faq-page";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "FAQ",
  description:
    "Frequently asked questions about Medora Health and the patient journey.",
  path: "/faq",
});

export default function FaqPage() {
  return <FaqPageView />;
}
