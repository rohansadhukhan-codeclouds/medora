"use client";

import type { QuestionOption } from "@/features/care-flow/types";
import { cn } from "@/lib/utils/cn";

type RadioQuestionProps = {
  id: string;
  label: string;
  value: string;
  options: QuestionOption[];
  onChange: (value: string) => void;
  error?: string;
  fullWidth?: boolean;
};

export function RadioQuestion({
  id,
  label,
  value,
  options,
  onChange,
  error,
  fullWidth,
}: RadioQuestionProps) {
  return (
    <fieldset className={cn("space-y-3", fullWidth && "sm:col-span-2")}>
      <legend className="text-sm font-medium text-foreground">{label}</legend>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 hover:bg-accent"
          >
            <input
              type="radio"
              name={id}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
