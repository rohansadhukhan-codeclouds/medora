import { FieldShell } from "@/features/intake/teleform/fields/field-shell";
import type { NormalizedTeleformField } from "@/features/intake/teleform/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  field: NormalizedTeleformField;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function SelectField({ field, value, error, onChange }: Props) {
  return (
    <FieldShell
      id={field.id}
      label={field.label}
      required={field.required}
      description={field.description}
      error={error}
      fullWidth={field.fullWidth}
      cols={field.meta?.cols}
    >
      <select
        id={field.id}
        name={field.name}
        value={value}
        required={field.required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${field.id}-error` : undefined}
        className={cn(
          "flex h-11 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        )}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{field.placeholder || "Select an option"}</option>
        {(field.options ?? []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
