"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FlowStepper } from "@/features/journey/components/flow-stepper";
import { useJourney } from "@/features/journey/context/journey-provider";
import {
  formatUsdFromCents,
  getPlansForTreatment,
} from "@/features/storefront/data/treatments";

export function PlanSelectionFlow() {
  const router = useRouter();
  const { state, treatment, selectPlan } = useJourney();

  if (!treatment || state.eligibilityStatus !== "eligible") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Select a treatment first</h1>
        <Button onClick={() => router.push("/treatments")}>
          Browse treatments
        </Button>
      </div>
    );
  }

  const plans = getPlansForTreatment(treatment.id);

  return (
    <div className="space-y-6">
      <FlowStepper current="plan" />
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Choose your subscription plan
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          For {treatment.name}. Additional plan lengths (3-month, 6-month) can
          be added later without changing this architecture.
        </p>
      </div>

      <div className="space-y-4">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className="border border-border bg-card p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {plan.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.renewalLabel}
                </p>
              </div>
              <p className="text-3xl font-semibold text-foreground">
                {formatUsdFromCents(plan.priceCents)}
                <span className="text-base font-normal text-muted-foreground">
                  /mo
                </span>
              </p>
            </div>
            <ul className="mt-4 space-y-2">
              {plan.includes.map((item) => (
                <li key={item} className="text-sm text-muted-foreground">
                  · {item}
                </li>
              ))}
            </ul>
            <Button
              className="mt-6"
              type="button"
              onClick={() => {
                selectPlan(plan.id);
                router.push("/checkout");
              }}
            >
              Continue
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
