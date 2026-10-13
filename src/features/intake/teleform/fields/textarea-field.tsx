import { Textarea } from "@/components/ui/textarea";
import { FieldShell } from "@/features/intake/teleform/fields/field-shell";
import type { NormalizedTeleformField } from "@/features/intake/teleform/types";

type Props = {
  field: NormalizedTeleformField;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function TextareaField({ field, value, error, onChange }: Props) {
  return (
    <FieldShell
      id={field.id}
      label={field.label}
      required={field.required}
      description={field.description}
      error={error}
      fullWidth
    >
      <Textarea
        id={field.id}
        name={field.name}
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
