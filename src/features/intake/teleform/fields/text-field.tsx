import { Input } from "@/components/ui/input";
import { FieldShell } from "@/features/intake/teleform/fields/field-shell";
import type { NormalizedTeleformField } from "@/features/intake/teleform/types";

type Props = {
  field: NormalizedTeleformField;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  inputType?: "text" | "email" | "tel" | "number" | "date";
};

export function TextField({
  field,
  value,
  error,
  onChange,
  inputType = "text",
}: Props) {
  const minLength = field.validation?.minLength;
  const maxLength = field.validation?.maxLength;
  const min =
    inputType === "number" ? field.validation?.minValue : undefined;
  const max =
    inputType === "number" ? field.validation?.maxValue : undefined;

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
      <Input
        id={field.id}
        name={field.name}
        type={inputType}
        value={value}
        placeholder={field.placeholder}
        required={field.required}
        minLength={minLength}
        maxLength={maxLength}
        min={min}
        max={max}
        step={inputType === "number" ? field.meta?.step : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${field.id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldShell>
  );
}
