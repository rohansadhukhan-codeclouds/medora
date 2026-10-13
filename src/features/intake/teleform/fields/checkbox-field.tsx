import { Checkbox } from "@/components/ui/checkbox";
import { FieldShell } from "@/features/intake/teleform/fields/field-shell";
import type { NormalizedTeleformField } from "@/features/intake/teleform/types";

type SingleProps = {
  field: NormalizedTeleformField;
  mode: "single";
  value: boolean;
  error?: string;
  onChange: (value: boolean) => void;
};

type GroupProps = {
  field: NormalizedTeleformField;
  mode: "group";
  value: string[];
  error?: string;
  onChange: (value: string[]) => void;
};

type Props = SingleProps | GroupProps;

export function CheckboxField(props: Props) {
  const { field, error } = props;

  if (props.mode === "single") {
    return (
      <FieldShell
        id={field.id}
        label={field.label}
        required={field.required}
        description={field.description}
        error={error}
        fullWidth={field.fullWidth}
      >
        <label
          htmlFor={field.id}
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 hover:bg-accent"
        >
          <Checkbox
            id={field.id}
            checked={props.value}
            onCheckedChange={(checked) => props.onChange(checked === true)}
          />
          <span className="text-sm text-foreground">
            {field.placeholder || "Yes"}
          </span>
        </label>
      </FieldShell>
    );
  }

  const selected = new Set(props.value);

  return (
    <FieldShell
      id={field.id}
      label={field.label}
      required={field.required}
      description={field.description}
      error={error}
      fullWidth
    >
      <div className="space-y-2">
        {(field.options ?? []).map((option) => {
          const optionId = `${field.id}_${option.value}`;
          const checked = selected.has(option.value);
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 hover:bg-accent"
            >
              <Checkbox
                id={optionId}
                checked={checked}
                onCheckedChange={(next) => {
                  const copy = new Set(selected);
                  if (next === true) copy.add(option.value);
                  else copy.delete(option.value);
                  props.onChange([...copy]);
                }}
              />
              <span className="text-sm text-foreground">{option.label}</span>
            </label>
          );
        })}
      </div>
    </FieldShell>
  );
}
