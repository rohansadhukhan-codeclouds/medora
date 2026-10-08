"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FlowStepper } from "@/features/journey/components/flow-stepper";
import { useJourney } from "@/features/journey/context/journey-provider";
import { INTAKE_SCHEMA } from "@/features/journey/data/intake-schema";

export function IntakeFlow() {
  const router = useRouter();
  const { state, setIntakeAnswer, submitIntake } = useJourney();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const current = INTAKE_SCHEMA[step];
  const progress = useMemo(
    () => Math.round(((step + 1) / INTAKE_SCHEMA.length) * 100),
    [step],
  );

  if (state.paymentState !== "authorized" && state.paymentState !== "paid") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Complete checkout first</h1>
        <Button onClick={() => router.push("/checkout")}>Go to checkout</Button>
      </div>
    );
  }

  function validateStep(): boolean {
    if (!current) return false;
    for (const question of current.questions) {
      if (!question.required) continue;
      const value = state.intakeAnswers[question.id];
      if (
        value === undefined ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        setError(`Please complete: ${question.label}`);
        return false;
      }
    }
    if (current.id === "consent" && state.intakeAnswers.consent !== "agree") {
      setError("Consent is required to continue.");
      return false;
    }
    if (
      current.id === "review" &&
      state.intakeAnswers.confirmAccurate !== "yes"
    ) {
      setError("Please confirm your information is accurate.");
      return false;
    }
    setError(null);
    return true;
  }

  async function onNext() {
    if (!validateStep()) return;
    if (step < INTAKE_SCHEMA.length - 1) {
      setStep((value) => value + 1);
      return;
    }
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    submitIntake();
    setSubmitting(false);
    router.push("/verification");
  }

  return (
    <div className="space-y-6">
      <FlowStepper current="intake" />
      <div>
        <p className="text-sm text-muted-foreground">
          Medical intake · {progress}%
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          {current.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {current.description}
        </p>
      </div>

      <div className="space-y-4">
        {current.questions.map((question) => {
          const value = state.intakeAnswers[question.id];
          if (question.type === "textarea") {
            return (
              <div key={question.id} className="space-y-2">
                <Label htmlFor={question.id}>{question.label}</Label>
                <Textarea
                  id={question.id}
                  placeholder={question.placeholder}
                  value={typeof value === "string" ? value : ""}
                  onChange={(event) =>
                    setIntakeAnswer(question.id, event.target.value)
                  }
                />
              </div>
            );
          }
          if (question.type === "radio" && question.options) {
            return (
              <fieldset key={question.id} className="space-y-2">
                <legend className="text-sm font-medium text-foreground">
                  {question.label}
                </legend>
                {question.options.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 border border-border px-3 py-2"
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.value}
                      checked={value === option.value}
                      onChange={() =>
                        setIntakeAnswer(question.id, option.value)
                      }
                      className="h-4 w-4 accent-[var(--primary)]"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </fieldset>
            );
          }
          return (
            <div key={question.id} className="space-y-2">
              <Label htmlFor={question.id}>{question.label}</Label>
              <Input
                id={question.id}
                placeholder={question.placeholder}
                value={typeof value === "string" ? value : ""}
                onChange={(event) =>
                  setIntakeAnswer(question.id, event.target.value)
                }
              />
            </div>
          );
        })}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((value) => Math.max(0, value - 1))}
        >
          Back
        </Button>
        <Button type="button" onClick={() => void onNext()} disabled={submitting}>
          {submitting
            ? "Submitting…"
            : step === INTAKE_SCHEMA.length - 1
              ? "Submit intake"
              : "Next"}
        </Button>
      </div>
    </div>
  );
}
