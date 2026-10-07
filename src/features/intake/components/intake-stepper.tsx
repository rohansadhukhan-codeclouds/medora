import { Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { INTAKE_STEPS } from "@/features/intake/schemas/intake-schema";
import { cn } from "@/lib/utils/cn";

type IntakeStepperProps = {
  currentStep: number;
};

export function IntakeStepper({ currentStep }: IntakeStepperProps) {
  const progress = ((currentStep + 1) / INTAKE_STEPS.length) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-foreground">
          Step {currentStep + 1} of {INTAKE_STEPS.length}
        </p>
        <p className="text-sm text-muted-foreground">
          {INTAKE_STEPS[currentStep]?.title}
        </p>
      </div>
      <Progress value={progress} aria-label="Intake progress" />
      <ol className="hidden gap-2 md:grid md:grid-cols-4 lg:grid-cols-8">
        {INTAKE_STEPS.map((step, index) => {
          const complete = index < currentStep;
          const active = index === currentStep;
          return (
            <li
              key={step.id}
              className={cn(
                "rounded-lg border px-2 py-2 text-center text-[11px] font-medium",
                complete && "border-primary/30 bg-primary-muted text-primary",
                active && "border-primary bg-card text-foreground",
                !complete && !active && "border-border text-muted-foreground",
              )}
            >
              <span className="mb-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-background text-[10px]">
                {complete ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              <span className="block leading-tight">{step.title}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
