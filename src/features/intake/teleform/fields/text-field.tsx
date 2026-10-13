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
  return (
    <FieldShell
      id={field.id}
      label={field.label}
      required={field.required}
      description={field.description}
      error={error}
      fullWidth={field.fullWidth}
    >
      <Input
        id={field.id}
        name={field.name}
        type={inputType}
        value={value}
        placeholder={field.placeholder}
        required={field.required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${field.id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldShell>
  );
}
