"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { QuestionOption } from "@/features/care-flow/types";
import { cn } from "@/lib/utils/cn";

type CheckboxQuestionProps = {
  id: string;
  label: string;
  value: string[];
  options: QuestionOption[];
  onChange: (value: string[]) => void;
  error?: string;
  fullWidth?: boolean;
};

export function CheckboxQuestion({
  id,
  label,
  value,
  options,
  onChange,
  error,
  fullWidth,
}: CheckboxQuestionProps) {
  function toggle(optionValue: string, checked: boolean) {
    if (checked) {
      onChange([...value, optionValue]);
      return;
    }
    onChange(value.filter((item) => item !== optionValue));
  }

  return (
    <fieldset className={cn("space-y-3", fullWidth && "sm:col-span-2")}>
      <legend className="text-sm font-medium text-foreground">{label}</legend>
      <div className="space-y-2">
        {options.map((option) => {
          const checked = value.includes(option.value);
          return (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 hover:bg-accent"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(state) =>
                  toggle(option.value, state === true)
                }
                aria-labelledby={`${id}-${option.value}`}
              />
              <span id={`${id}-${option.value}`} className="text-sm">
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
