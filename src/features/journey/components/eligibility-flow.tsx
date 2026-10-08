"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FlowStepper } from "@/features/journey/components/flow-stepper";
import { useJourney } from "@/features/journey/context/journey-provider";
import {
  ELIGIBILITY_STEPS,
  evaluateEligibility,
} from "@/features/care-flow/data/eligibility";
import { getTreatmentBySlug } from "@/features/storefront/data/treatments";

export function EligibilityFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    state,
    treatment,
    selectTreatment,
    setEligibilityAnswer,
    completeEligibility,
  } = useJourney();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const slug = searchParams.get("treatment");
    if (slug && slug !== state.treatmentSlug) {
      selectTreatment(slug);
    }
  }, [searchParams, selectTreatment, state.treatmentSlug]);

  const current = ELIGIBILITY_STEPS[step];
  const answer = current ? state.eligibilityAnswers[current.id] : undefined;
  const selected =
    treatment ??
    (state.treatmentSlug ? getTreatmentBySlug(state.treatmentSlug) : null);

  if (!selected) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Choose a treatment first</h1>
        <p className="text-sm text-muted-foreground">
          Eligibility screening starts after you select a treatment pathway.
        </p>
        <Button asChild>
          <Link href="/treatments">Browse treatments</Link>
        </Button>
      </div>
    );
  }

  if (state.eligibilityStatus === "unavailable_state") {
    return (
      <Outcome
        title="Currently unavailable in your state"
        description="Based on your selected state, this online pathway is not available in the demo right now."
      />
    );
  }

  if (state.eligibilityStatus === "ineligible") {
    return (
      <Outcome
        title="Online treatment may not be suitable at this time"
        description="Based on your answers, this preliminary screening suggests this pathway may not be appropriate. A licensed provider makes final determinations in real care."
      />
    );
  }

  if (state.eligibilityStatus === "eligible") {
    return (
      <div className="space-y-6">
        <FlowStepper current="eligibility" />
        <h1 className="text-2xl font-semibold text-foreground">
          You may continue
        </h1>
        <p className="text-sm text-muted-foreground">
          Preliminary screening looks good for {selected.name}. Final
          eligibility is always determined by a licensed provider after intake.
        </p>
        <Button onClick={() => router.push("/account/create")}>
          Create Account
        </Button>
      </div>
    );
  }

  function onNext() {
    if (!current || !answer) {
      setError("Please select an option to continue.");
      return;
    }
    setError(null);
    if (step < ELIGIBILITY_STEPS.length - 1) {
      setStep((value) => value + 1);
      return;
    }
    const mapped = evaluateEligibility({
      ...state.eligibilityAnswers,
      [current.id]: answer,
    });
    completeEligibility(
      mapped === "eligible"
        ? "eligible"
        : mapped === "unavailable_state"
          ? "unavailable_state"
          : "ineligible",
    );
  }

  return (
    <div className="space-y-6">
      <FlowStepper current="eligibility" />
      <div>
        <p className="text-sm text-muted-foreground">
          Pre-qualification · {selected.name}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          {current.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {current.description}
        </p>
      </div>

      <div className="space-y-3" role="group" aria-labelledby="eligibility-q">
        <p id="eligibility-q" className="sr-only">
          {current.title}
        </p>
        {current.options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-3 border border-border bg-card px-4 py-3"
          >
            <input
              type="radio"
              name={current.id}
              value={option.value}
              checked={answer === option.value}
              onChange={() => setEligibilityAnswer(current.id, option.value)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            <span className="text-sm text-foreground">{option.label}</span>
          </label>
        ))}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Final treatment eligibility is determined by a licensed healthcare
        provider.
      </p>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((value) => Math.max(0, value - 1))}
        >
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          {step === ELIGIBILITY_STEPS.length - 1 ? "See results" : "Next"}
        </Button>
      </div>

      <div className="pt-2">
        <Label className="text-xs text-muted-foreground">
          Progress: {step + 1} / {ELIGIBILITY_STEPS.length}
        </Label>
      </div>
    </div>
  );
}

function Outcome({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Button asChild variant="outline">
        <Link href="/treatments">Back to treatments</Link>
      </Button>
    </div>
  );
}
