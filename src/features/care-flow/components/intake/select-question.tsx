"use client";

import { Label } from "@/components/ui/label";
import type { QuestionOption } from "@/features/care-flow/types";
import { cn } from "@/lib/utils/cn";

type SelectQuestionProps = {
  id: string;
  label: string;
  value: string;
  options: QuestionOption[];
  onChange: (value: string) => void;
  error?: string;
  fullWidth?: boolean;
};

export function SelectQuestion({
  id,
  label,
  value,
  options,
  onChange,
  error,
  fullWidth,
}: SelectQuestionProps) {
  return (
    <div className={cn("space-y-2", fullWidth && "sm:col-span-2")}>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        className="flex h-11 w-full rounded-lg border border-input bg-card px-3 text-sm"
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="" disabled>
          Select an option
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
