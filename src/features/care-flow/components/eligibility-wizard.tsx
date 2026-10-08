"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FlowProgress } from "@/features/care-flow/components/flow-progress";
import { useCareFlow } from "@/features/care-flow/context/care-flow-provider";
import {
  ELIGIBILITY_STEPS,
  evaluateEligibility,
} from "@/features/care-flow/data/eligibility";

export function EligibilityWizard() {
  const router = useRouter();
  const {
    state,
    selectedTreatment,
    setEligibilityAnswer,
    setEligibilityResult,
  } = useCareFlow();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const current = ELIGIBILITY_STEPS[step];
  const answer = current ? state.eligibilityAnswers[current.id] : undefined;

  const notice = useMemo(
    () =>
      "Final treatment eligibility is determined by a licensed healthcare provider.",
    [],
  );

  if (!selectedTreatment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Choose a treatment first</CardTitle>
          <CardDescription>
            Start by selecting a treatment category to begin eligibility screening.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/treatments">Browse treatments</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (state.eligibilityResult === "unavailable_state") {
    return (
      <ResultCard
        title="Currently unavailable in your state"
        description="Based on your selected state, this online pathway is not available in the demo right now."
        actionHref="/treatments"
        actionLabel="Back to treatments"
      />
    );
  }

  if (state.eligibilityResult === "not_suitable") {
    return (
      <ResultCard
        title="Online treatment may not be suitable at this time"
        description="Based on your answers, this preliminary demo screening suggests online treatment may not be appropriate. A licensed provider makes final determinations in real care."
        actionHref="/treatments"
        actionLabel="Back to treatments"
      />
    );
  }

  function handleContinue() {
    if (!current) return;
    if (!answer) {
      setError("Please select an answer to continue.");
      return;
    }
    setError(null);

    const nextAnswers = {
      ...state.eligibilityAnswers,
      [current.id]: answer,
    };

    if (step < ELIGIBILITY_STEPS.length - 1) {
      const early = evaluateEligibility(nextAnswers);
      if (early !== "eligible" && (current.id === "age" || current.id === "state" || current.id === "pregnant" || current.id === "conditions")) {
        // Evaluate fully only when we have enough signals; still allow step-by-step.
        if (
          (current.id === "state" && early === "unavailable_state") ||
          (current.id === "age" && nextAnswers.age === "under_18") ||
          (current.id === "pregnant" && nextAnswers.pregnant === "yes") ||
          (current.id === "conditions" && nextAnswers.conditions === "listed")
        ) {
          setEligibilityResult(early);
          return;
        }
      }
      setStep((value) => value + 1);
      return;
    }

    const result = evaluateEligibility(nextAnswers);
    setEligibilityResult(result);
    if (result === "eligible") {
      router.push("/products");
    }
  }

  return (
    <div className="space-y-8">
      <FlowProgress current="eligibility" />
      <Card>
        <CardHeader>
          <CardDescription>
            Preliminary screening for {selectedTreatment.name}
          </CardDescription>
          <CardTitle className="text-2xl">{current?.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{current?.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <fieldset className="space-y-3">
            <legend className="sr-only">{current?.title}</legend>
            {current?.type === "select" ? (
              <div className="space-y-2">
                <Label htmlFor={current.id}>Select an option</Label>
                <select
                  id={current.id}
                  className="flex h-11 w-full rounded-lg border border-input bg-card px-3 text-sm"
                  value={answer ?? ""}
                  onChange={(event) =>
                    setEligibilityAnswer(current.id, event.target.value)
                  }
                >
                  <option value="" disabled>
                    Choose one
                  </option>
                  {current.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                {current?.options.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 hover:bg-accent"
                  >
                    <input
                      type="radio"
                      name={current.id}
                      value={option.value}
                      checked={answer === option.value}
                      onChange={() =>
                        setEligibilityAnswer(current.id, option.value)
                      }
                      className="h-4 w-4 accent-[var(--primary)]"
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <p className="rounded-lg bg-primary-muted px-4 py-3 text-sm text-foreground">
            {notice}
          </p>

          <div className="flex flex-wrap justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep((value) => Math.max(0, value - 1))}
            >
              Previous
            </Button>
            <Button type="button" onClick={handleContinue}>
              {step === ELIGIBILITY_STEPS.length - 1 ? "Continue" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ResultCard({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
