import { AboutPageView } from "@/features/marketing/about-page";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "About",
  description:
    "Learn about Medora Health — a modern patient experience powered by licensed provider workflows.",
  path: "/about",
});

export default function AboutPage() {
  return <AboutPageView />;
}
