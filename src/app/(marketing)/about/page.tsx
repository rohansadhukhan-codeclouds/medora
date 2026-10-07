import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "About",
  description:
    "Learn about Medora Health — a modern patient experience powered by licensed provider workflows.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="About Medora"
        title="Premium healthcare technology with a human pace"
        description="Medora Health is a patient-facing platform designed to feel calm, trustworthy, and clinically serious."
        as="h1"
      />
      <div className="mt-10 space-y-5 text-base leading-relaxed text-muted-foreground">
        <p>
          We believe online care should be clear and respectful—never flashy,
          never overpromising. Patients deserve to understand each step: intake,
          provider review, care status, and follow-up.
        </p>
        <p>
          Medora’s frontend is purpose-built for healthcare workflows, while
          clinical provider operations are powered through AsterMD APIs via a
          secure Next.js server layer. That separation keeps the patient
          experience stable as provider integrations evolve.
        </p>
        <p>
          Medora does not claim outcomes. Care decisions belong to licensed
          professionals after reviewing patient information.
        </p>
      </div>
    </div>
  );
}
