import type { NormalizedTeleformField } from "@/features/intake/teleform/types";

type Props = {
  field: NormalizedTeleformField;
};

export function ContentBlock({ field }: Props) {
  return (
    <div className="sm:col-span-2 rounded-xl border border-dashed border-border bg-accent/50 px-4 py-3">
      <p className="text-sm font-medium text-foreground">{field.label}</p>
      {field.description ? (
        <p className="mt-1 text-sm text-muted-foreground">{field.description}</p>
      ) : null}
    </div>
  );
}
