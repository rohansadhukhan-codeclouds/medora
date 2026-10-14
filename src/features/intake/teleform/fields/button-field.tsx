"use client";

import { Button } from "@/components/ui/button";
import { fieldLayoutClass } from "@/features/intake/teleform/layout";
import type { NormalizedTeleformField } from "@/features/intake/teleform/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  field: NormalizedTeleformField;
  accentColor?: string;
  disabled?: boolean;
  onAction: (action: string | undefined) => void;
};

export function ButtonField({
  field,
  accentColor = "var(--primary)",
  disabled,
  onAction,
}: Props) {
  const action = (field.meta?.buttonAction || "").toLowerCase();
  const isBack =
    action === "previous_page" ||
    action === "back" ||
    /back/i.test(field.label);
  const isOutline = isBack || action === "none";

  return (
    <div
      className={cn(
        fieldLayoutClass(field.meta?.cols, false),
        "flex items-center",
        isBack ? "justify-start" : "justify-end",
      )}
    >
      <Button
        type="button"
        variant={isOutline ? "outline" : "default"}
        disabled={disabled}
        onClick={() => onAction(field.meta?.buttonAction || action)}
        style={
          isOutline
            ? { borderColor: accentColor, color: accentColor }
            : {
                backgroundColor: accentColor,
                borderColor: accentColor,
                color: "#fff",
              }
        }
      >
        {field.label?.trim() || (isBack ? "← Back" : "Next step →")}
      </Button>
    </div>
  );
}
