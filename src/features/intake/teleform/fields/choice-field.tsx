"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { FieldShell } from "@/features/intake/teleform/fields/field-shell";
import type { NormalizedTeleformField } from "@/features/intake/teleform/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  field: NormalizedTeleformField;
  /** Multi = string[]; single = string — driven by properties.multiSelect */
  multi: boolean;
  value: string | string[];
  error?: string;
  onChange: (value: string | string[]) => void;
};

export function ChoiceField({ field, multi, value, error, onChange }: Props) {
  const options = field.options ?? [];
  const horizontal =
    (field.meta?.layout || "").toLowerCase() === "horizontal";

  if (!options.length) {
    return (
      <FieldShell
        id={field.id}
        label={field.label}
        required={field.required}
        error={error || "No choices configured for this question."}
        fullWidth
        cols={field.meta?.cols}
      >
        <p className="text-sm text-muted-foreground">Waiting for options…</p>
      </FieldShell>
    );
  }

  if (!multi) {
    const current = typeof value === "string" ? value : "";
    return (
      <FieldShell
        id={field.id}
        label={field.label}
        required={field.required}
        error={error}
        fullWidth
        cols={field.meta?.cols}
      >
        <div
          role="radiogroup"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${field.id}-error` : undefined}
          className={cn(
            horizontal ? "flex flex-wrap gap-2" : "space-y-2",
          )}
        >
          {options.map((option) => {
            const optionId = `${field.id}_${option.value}`;
            const selected = current === option.value;
            return (
              <label
                key={option.value}
                htmlFor={optionId}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition-colors",
                  selected
                    ? "border-primary bg-primary-muted"
                    : "border-border hover:bg-accent",
                )}
              >
                <input
                  id={optionId}
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={selected}
                  className="h-4 w-4 accent-[var(--primary)]"
                  onChange={() => onChange(option.value)}
                />
                <span className="text-sm font-medium text-foreground">
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
      </FieldShell>
    );
  }

  const selected = new Set(Array.isArray(value) ? value : []);

  return (
    <FieldShell
      id={field.id}
      label={field.label}
      required={field.required}
      error={error}
      fullWidth
      cols={field.meta?.cols}
    >
      <div
        className={cn(horizontal ? "flex flex-wrap gap-2" : "space-y-2")}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${field.id}-error` : undefined}
      >
        {options.map((option) => {
          const optionId = `${field.id}_${option.value}`;
          const checked = selected.has(option.value);
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition-colors",
                checked
                  ? "border-primary bg-primary-muted"
                  : "border-border hover:bg-accent",
              )}
            >
              <Checkbox
                id={optionId}
                checked={checked}
                onCheckedChange={(next) => {
                  const copy = new Set(selected);
                  if (next === true) copy.add(option.value);
                  else copy.delete(option.value);
                  onChange([...copy]);
                }}
              />
              <span className="text-sm font-medium text-foreground">
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </FieldShell>
  );
}
