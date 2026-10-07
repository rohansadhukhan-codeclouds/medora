import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Treatments",
  description:
    "Explore Medora Health treatment categories. Care is provided when clinically appropriate after licensed provider review.",
  path: "/treatments",
});

const categories = [
  {
    title: "Primary care concerns",
    description:
      "Get started with common health questions through a guided online intake.",
  },
  {
    title: "Follow-up visits",
    description:
      "Continue care conversations after your initial provider review.",
  },
  {
    title: "Medication review",
    description:
      "Discuss existing treatment information with a licensed provider when relevant.",
  },
  {
    title: "Wellness check-ins",
    description:
      "Share updates with your care team and receive guidance when appropriate.",
  },
];

export default function TreatmentsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="Treatments"
        title="Find the right starting point"
        description="Categories below help you begin. Specific care recommendations are determined only after a licensed provider reviews your information."
        as="h1"
      />
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {categories.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="mt-10">
        <Button asChild>
          <Link href="/register">Get Started</Link>
        </Button>
      </div>
    </div>
  );
}
