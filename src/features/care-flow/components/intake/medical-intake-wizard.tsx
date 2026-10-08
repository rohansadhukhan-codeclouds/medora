"use client";

import { useState } from "react";
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
import { FlowProgress } from "@/features/care-flow/components/flow-progress";
import { IntakeStep } from "@/features/care-flow/components/intake/intake-step";
import { useCareFlow } from "@/features/care-flow/context/care-flow-provider";
import { MEDICAL_INTAKE_STEPS } from "@/features/care-flow/data/intake-schema";

export function MedicalIntakeWizard() {
  const router = useRouter();
  const {
    selectedProduct,
    state,
    setIntakeAnswer,
    updatePatientFromIntake,
  } = useCareFlow();
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isReview = stepIndex >= MEDICAL_INTAKE_STEPS.length;
  const currentStep = MEDICAL_INTAKE_STEPS[stepIndex];

  if (!selectedProduct) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select a product first</CardTitle>
          <CardDescription>
            Choose a product plan before completing medical intake.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/products">Choose product</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  function validateStep(): boolean {
    if (!currentStep) return true;
    const nextErrors: Record<string, string> = {};
    for (const question of currentStep.questions) {
      if (!question.required) continue;
      const value = state.intakeAnswers[question.id];
      const empty =
        value === undefined ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);
      if (empty) {
        nextErrors[question.id] = "This field is required.";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleNext() {
    if (!validateStep()) return;
    if (stepIndex === MEDICAL_INTAKE_STEPS.length - 1) {
      updatePatientFromIntake();
      setStepIndex((value) => value + 1);
      return;
    }
    setStepIndex((value) => value + 1);
  }

  return (
    <div className="space-y-8">
      <FlowProgress current="intake" />
      <Card>
        <CardHeader>
          <CardDescription>
            Medical intake for {selectedProduct.name}
          </CardDescription>
          <CardTitle>
            {isReview ? "Review your answers" : currentStep?.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {!isReview && currentStep ? (
            <IntakeStep
              step={currentStep}
              answers={state.intakeAnswers}
              errors={errors}
              onChange={setIntakeAnswer}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Confirm your information before continuing to checkout. You can
                go back to edit any section.
              </p>
              <dl className="divide-y divide-border rounded-xl border border-border">
                {Object.entries(state.intakeAnswers).map(([key, value]) => (
                  <div
                    key={key}
                    className="grid gap-1 px-4 py-3 sm:grid-cols-[12rem_1fr]"
                  >
                    <dt className="text-sm font-medium text-muted-foreground">
                      {key}
                    </dt>
                    <dd className="text-sm text-foreground">
                      {Array.isArray(value) ? value.join(", ") : value || "—"}
                    </dd>
                  </div>
                ))}
              </dl>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStepIndex(0)}
              >
                Edit answers
              </Button>
            </div>
          )}

          <div className="flex flex-wrap justify-between gap-3 border-t border-border pt-6">
            <Button
              type="button"
              variant="outline"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((value) => Math.max(0, value - 1))}
            >
              Previous
            </Button>
            {isReview ? (
              <Button type="button" onClick={() => router.push("/checkout")}>
                Continue to checkout
              </Button>
            ) : (
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
