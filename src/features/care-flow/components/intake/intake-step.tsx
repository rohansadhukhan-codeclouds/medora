import type { IntakeStepDefinition } from "@/features/care-flow/types";
import { QuestionRenderer } from "@/features/care-flow/components/intake/question-renderer";

type IntakeStepProps = {
  step: IntakeStepDefinition;
  answers: Record<string, string | string[]>;
  errors: Record<string, string>;
  onChange: (id: string, value: string | string[]) => void;
};

export function IntakeStep({
  step,
  answers,
  errors,
  onChange,
}: IntakeStepProps) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{step.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {step.questions.map((question) => (
          <QuestionRenderer
            key={question.id}
            question={question}
            value={answers[question.id]}
            error={errors[question.id]}
            onChange={(value) => onChange(question.id, value)}
          />
        ))}
      </div>
    </section>
  );
}
