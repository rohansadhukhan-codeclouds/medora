"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useCareFlow } from "@/features/care-flow/context/care-flow-provider";

const QUESTIONS = [
  {
    id: "sideEffects",
    title: "Have you experienced any new side effects?",
    options: [
      { value: "no", label: "No" },
      { value: "yes", label: "Yes" },
    ],
  },
  {
    id: "continue",
    title: "Would you like to continue your current plan?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "discuss", label: "I'd like to discuss options" },
    ],
  },
];

export function RenewalView() {
  const { state, setRenewalAnswer, submitRenewal } = useCareFlow();
  const [step, setStep] = useState(0);
  const isReview = step >= QUESTIONS.length;

  if (state.renewalSubmitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Renewal submitted for provider review</CardTitle>
          <CardDescription>
            Your renewal questionnaire is in mock review. No backend call was made.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/portal">Back to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const current = QUESTIONS[step];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Renewal / refill"
        description="Renewal due → short questionnaire → review → submit for provider review."
      />
      <Card>
        <CardHeader>
          <CardTitle>
            {isReview ? "Review renewal answers" : current?.title}
          </CardTitle>
          <CardDescription>
            {isReview
              ? "Confirm before submitting."
              : `Question ${step + 1} of ${QUESTIONS.length}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isReview && current ? (
            <div className="space-y-2">
              {current.options.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3"
                >
                  <input
                    type="radio"
                    name={current.id}
                    checked={state.renewalAnswers[current.id] === option.value}
                    onChange={() => setRenewalAnswer(current.id, option.value)}
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                  <Label>{option.label}</Label>
                </label>
              ))}
            </div>
          ) : (
            <dl className="space-y-3 text-sm">
              {QUESTIONS.map((question) => (
                <div key={question.id}>
                  <dt className="text-muted-foreground">{question.title}</dt>
                  <dd className="font-medium">
                    {state.renewalAnswers[question.id] ?? "—"}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <div className="flex flex-wrap justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep((value) => Math.max(0, value - 1))}
            >
              Previous
            </Button>
            {isReview ? (
              <Button type="button" onClick={submitRenewal}>
                Submit for provider review
              </Button>
            ) : (
              <Button
                type="button"
                disabled={!current || !state.renewalAnswers[current.id]}
                onClick={() => setStep((value) => value + 1)}
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
