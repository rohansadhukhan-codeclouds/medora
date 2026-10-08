"use client";

import { CheckboxQuestion } from "@/features/care-flow/components/intake/checkbox-question";
import { RadioQuestion } from "@/features/care-flow/components/intake/radio-question";
import { SelectQuestion } from "@/features/care-flow/components/intake/select-question";
import { TextQuestion } from "@/features/care-flow/components/intake/text-question";
import type { IntakeQuestion } from "@/features/care-flow/types";

type QuestionRendererProps = {
  question: IntakeQuestion;
  value: string | string[] | undefined;
  error?: string;
  onChange: (value: string | string[]) => void;
};

export function QuestionRenderer({
  question,
  value,
  error,
  onChange,
}: QuestionRendererProps) {
  switch (question.type) {
    case "select":
      return (
        <SelectQuestion
          id={question.id}
          label={question.label}
          value={typeof value === "string" ? value : ""}
          options={question.options ?? []}
          onChange={onChange}
          error={error}
          fullWidth={question.fullWidth}
        />
      );
    case "radio":
      return (
        <RadioQuestion
          id={question.id}
          label={question.label}
          value={typeof value === "string" ? value : ""}
          options={question.options ?? []}
          onChange={onChange}
          error={error}
          fullWidth={question.fullWidth}
        />
      );
    case "checkbox":
      return (
        <CheckboxQuestion
          id={question.id}
          label={question.label}
          value={Array.isArray(value) ? value : []}
          options={question.options ?? []}
          onChange={onChange}
          error={error}
          fullWidth={question.fullWidth}
        />
      );
    case "textarea":
      return (
        <TextQuestion
          id={question.id}
          label={question.label}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          error={error}
          placeholder={question.placeholder}
          type="textarea"
          fullWidth={question.fullWidth}
        />
      );
    case "number":
    case "date":
    case "text":
    default:
      return (
        <TextQuestion
          id={question.id}
          label={question.label}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          error={error}
          placeholder={question.placeholder}
          type={question.type === "number" || question.type === "date" ? question.type : "text"}
          fullWidth={question.fullWidth}
        />
      );
  }
}
