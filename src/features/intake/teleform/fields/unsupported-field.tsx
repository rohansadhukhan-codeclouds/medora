import type { NormalizedTeleformField } from "@/features/intake/teleform/types";
import { fieldLayoutClass } from "@/features/intake/teleform/layout";

export function UnsupportedField({ field }: { field: NormalizedTeleformField }) {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[teleform] Unsupported field type: ${field.rawType || field.type}`,
      field.name,
    );
  }

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div
      className={fieldLayoutClass(
        field.meta?.cols,
        field.fullWidth,
        "rounded-xl border border-dashed border-border px-3 py-2 text-xs text-muted-foreground",
      )}
    >
      Unsupported field type: {field.rawType || field.type}
    </div>
  );
}
