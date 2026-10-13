import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

type FieldShellProps = {
  id: string;
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
  fullWidth?: boolean;
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
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={cn("space-y-2", fullWidth && "sm:col-span-2", className)}>
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
