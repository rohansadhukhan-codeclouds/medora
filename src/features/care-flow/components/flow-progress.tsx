import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils/cn";

const STEPS = [
  { id: "treatment", label: "Treatment" },
  { id: "eligibility", label: "Eligibility" },
  { id: "product", label: "Product" },
  { id: "intake", label: "Intake" },
  { id: "checkout", label: "Checkout" },
  { id: "review", label: "Review" },
] as const;

type FlowProgressProps = {
  current: (typeof STEPS)[number]["id"];
  className?: string;
};

export function FlowProgress({ current, className }: FlowProgressProps) {
  const index = STEPS.findIndex((step) => step.id === current);
  const value = ((index + 1) / STEPS.length) * 100;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">
          Step {index + 1} of {STEPS.length}
        </p>
        <p className="text-sm text-muted-foreground">{STEPS[index]?.label}</p>
      </div>
      <Progress value={value} aria-label="Care journey progress" />
      <ol className="hidden gap-2 sm:grid sm:grid-cols-6">
        {STEPS.map((step, stepIndex) => (
          <li
            key={step.id}
            className={cn(
              "rounded-md border px-2 py-1.5 text-center text-[11px] font-medium",
              stepIndex <= index
                ? "border-primary/30 bg-primary-muted text-primary"
                : "border-border text-muted-foreground",
            )}
          >
            {step.label}
          </li>
        ))}
      </ol>
    </div>
  );
}
