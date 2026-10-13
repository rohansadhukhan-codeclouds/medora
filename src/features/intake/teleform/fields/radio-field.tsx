import { FieldShell } from "@/features/intake/teleform/fields/field-shell";
import type { NormalizedTeleformField } from "@/features/intake/teleform/types";

type Props = {
  field: NormalizedTeleformField;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function RadioField({ field, value, error, onChange }: Props) {
  const options =
    field.options && field.options.length > 0
      ? field.options
      : [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ];

  return (
    <FieldShell
      id={field.id}
      label={field.label}
      required={field.required}
      description={field.description}
      error={error}
      fullWidth
      cols={field.meta?.cols}
    >
      <div
        role="radiogroup"
        aria-labelledby={field.id}
        className="space-y-2"
      >
        {options.map((option) => {
          const optionId = `${field.id}_${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 hover:bg-accent"
            >
              <input
                id={optionId}
                type="radio"
                name={field.name}
                value={option.value}
                checked={value === option.value}
                required={field.required}
                className="h-4 w-4 accent-[var(--primary)]"
                onChange={() => onChange(option.value)}
              />
              <span className="text-sm text-foreground">{option.label}</span>
            </label>
          );
        })}
      </div>
    </FieldShell>
  );
}
