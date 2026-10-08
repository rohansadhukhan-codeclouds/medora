import { cn } from "@/lib/utils/cn";

const STEPS = [
  { id: "eligibility", label: "Eligibility" },
  { id: "account", label: "Account" },
  { id: "plan", label: "Plan" },
  { id: "checkout", label: "Checkout" },
  { id: "intake", label: "Intake" },
  { id: "verification", label: "Verify" },
  { id: "review", label: "Review" },
] as const;

export type FlowStepId = (typeof STEPS)[number]["id"];

export function FlowStepper({ current }: { current: FlowStepId }) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <nav aria-label="Care journey progress" className="mb-10">
      <ol className="flex flex-wrap gap-2">
        {STEPS.map((step, index) => {
          const active = index === currentIndex;
          const complete = index < currentIndex;
          return (
            <li
              key={step.id}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                active && "bg-primary text-primary-foreground",
                complete && !active && "bg-primary-muted text-primary",
                !active && !complete && "bg-muted text-muted-foreground",
              )}
            >
              {step.label}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
