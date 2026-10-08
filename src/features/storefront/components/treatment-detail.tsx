"use client";

import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useJourney } from "@/features/journey/context/journey-provider";
import {
  formatUsdFromCents,
  getPlansForTreatment,
} from "@/features/storefront/data/treatments";
import type { Treatment } from "@/lib/domain/types";

type TreatmentDetailProps = {
  treatment: Treatment;
};

export function TreatmentDetail({ treatment }: TreatmentDetailProps) {
  const router = useRouter();
  const { selectTreatment } = useJourney();
  const plans = getPlansForTreatment(treatment.id);
  const monthly = plans[0];

  function handleStart() {
    selectTreatment(treatment.slug);
    router.push(`/eligibility?treatment=${treatment.slug}`);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <section className="border-b border-border pb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
          {treatment.category}
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {treatment.name}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          {treatment.shortDescription}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button size="lg" type="button" onClick={handleStart}>
            Check Eligibility
          </Button>
          <p className="text-sm text-muted-foreground">
            From {formatUsdFromCents(treatment.startingPriceCents)}
            {monthly ? ` · ${monthly.renewalLabel}` : null}
          </p>
        </div>
      </section>

      <Section title="Treatment overview">
        <p className="max-w-3xl text-muted-foreground leading-relaxed">
          {treatment.overview}
        </p>
      </Section>

      <Section title="What’s included">
        <ul className="grid gap-2 sm:grid-cols-2">
          {treatment.included.map((item) => (
            <li key={item} className="text-sm text-muted-foreground">
              · {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Potential benefits">
        <ul className="grid gap-2 sm:grid-cols-2">
          {treatment.potentialBenefits.map((item) => (
            <li key={item} className="text-sm text-muted-foreground">
              · {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="How it works">
        <ol className="space-y-3">
          {treatment.howItWorks.map((item, index) => (
            <li key={item} className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {index + 1}.
              </span>{" "}
              {item}
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Eligibility overview">
        <ul className="space-y-2">
          {treatment.eligibilityOverview.map((item) => (
            <li key={item} className="text-sm text-muted-foreground">
              · {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Pricing / subscription">
        {monthly ? (
          <div className="max-w-md border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">
              {monthly.name}
            </h3>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {formatUsdFromCents(monthly.priceCents)}
              <span className="text-base font-normal text-muted-foreground">
                /month
              </span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {monthly.renewalLabel}
            </p>
            <ul className="mt-4 space-y-2">
              {monthly.includes.map((item) => (
                <li key={item} className="text-sm text-muted-foreground">
                  · {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Section>

      <Section title="FAQ">
        <Accordion type="single" collapsible className="max-w-3xl">
          {treatment.faq.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      <section className="border-t border-border py-10">
        <h2 className="text-lg font-semibold text-foreground">
          Medical disclaimer
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {treatment.disclaimer}
        </p>
        <div className="mt-8">
          <Button size="lg" type="button" onClick={handleStart}>
            Check Eligibility
          </Button>
        </div>
      </section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border py-10">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
