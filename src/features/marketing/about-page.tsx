"use client";

import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/shared/section-heading";

export function AboutPageView() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <Reveal>
        <SectionHeading
          eyebrow="About Medora"
          title="Premium healthcare technology with a human pace"
          description="Medora Health is a patient-facing platform designed to feel calm, trustworthy, and clinically serious."
          as="h1"
        />
      </Reveal>
      <Reveal delayMs={90}>
        <div className="mt-10 space-y-5 text-base leading-relaxed text-muted-foreground">
          <p>
            We believe online care should be clear and respectful—never flashy,
            never overpromising. Patients deserve to understand each step:
            intake, provider review, care status, and follow-up.
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
      </Reveal>
    </div>
  );
}
