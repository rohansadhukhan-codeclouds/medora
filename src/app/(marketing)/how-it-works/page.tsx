import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "How it works",
  description:
    "Learn how Medora Health guides patients from intake through provider review and follow-up care.",
  path: "/how-it-works",
});

const journey = [
  {
    title: "Choose a treatment area",
    body: "Browse care categories and start with the option that best matches your needs.",
  },
  {
    title: "Create your account",
    body: "Set up secure access so you can complete intake and track your care status.",
  },
  {
    title: "Complete your intake",
    body: "Share personal, contact, and health information through a guided multi-step form.",
  },
  {
    title: "Provider review",
    body: "A licensed healthcare professional reviews your submission. Additional details may be requested.",
  },
  {
    title: "Care plan & follow-up",
    body: "If appropriate, you may receive treatment information, appointment options, or messages from your care team.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="How it works"
        title="A transparent path from first visit to follow-up"
        description="Medora is designed around a realistic patient journey while staying flexible for AsterMD provider workflows."
        as="h1"
      />
      <ol className="mt-12 space-y-8">
        {journey.map((item, index) => (
          <li key={item.title} className="flex gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {index + 1}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-12">
        <Button asChild>
          <Link href="/register">Begin your intake</Link>
        </Button>
      </div>
    </div>
  );
}
