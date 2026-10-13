import type { NormalizedTeleformField } from "@/features/intake/teleform/types";
import { fieldLayoutClass } from "@/features/intake/teleform/layout";
import { cn } from "@/lib/utils/cn";

type Props = {
  field: NormalizedTeleformField;
};

export function ContentBlock({ field }: Props) {
  return (
    <div
      className={cn(
        fieldLayoutClass(field.meta?.cols, true),
        "rounded-xl border border-dashed border-border bg-accent/50 px-4 py-3",
      )}
    >
      <p className="text-sm font-medium text-foreground">{field.label}</p>
      {field.description ? (
        <p className="mt-1 text-sm text-muted-foreground">{field.description}</p>
      ) : null}
    </div>
  );
}
