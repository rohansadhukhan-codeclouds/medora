import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { fieldLayoutClass } from "@/features/intake/teleform/layout";
import { cn } from "@/lib/utils/cn";

type FieldShellProps = {
  id: string;
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
  fullWidth?: boolean;
  cols?: number;
  className?: string;
  children: ReactNode;
};

export function FieldShell({
  id,
  label,
  required,
  description,
  error,
  fullWidth,
  cols,
  className,
  children,
}: FieldShellProps) {
  return (
    <div
      className={cn(
        "space-y-2",
        fieldLayoutClass(cols, fullWidth),
        className,
      )}
    >
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
