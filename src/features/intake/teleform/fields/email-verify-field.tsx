"use client";

import { useEffect } from "react";
import { Check, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEmailVerify } from "@/features/intake/hooks/use-email-verify";
import { emailVerifyStatusKey } from "@/features/intake/teleform/field-meta";
import { FieldShell } from "@/features/intake/teleform/fields/field-shell";
import type { NormalizedTeleformField } from "@/features/intake/teleform/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  field: NormalizedTeleformField;
  value: string;
  error?: string;
  onChange: (name: string, value: string | boolean | string[]) => void;
};

export function EmailVerifyField({ field, value, error, onChange }: Props) {
  const verify = useEmailVerify(value);
  const statusKey = emailVerifyStatusKey(field.name);
  const showInvalidMessage =
    verify.message &&
    verify.status !== "checking" &&
    (verify.status === "invalid" ||
      verify.status === "failed" ||
      verify.status === "unknown");

  useEffect(() => {
    onChange(statusKey, verify.status);
    // Only sync status companion value when verify status changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid re-firing on onChange identity
  }, [verify.status, statusKey]);

  const displayError =
    error || (showInvalidMessage ? verify.message ?? undefined : undefined);

  return (
    <FieldShell
      id={field.id}
      label={field.label}
      required={field.required}
      description={field.description}
      error={displayError}
      fullWidth={field.fullWidth}
      cols={field.meta?.cols}
    >
      <div className="relative">
        <Input
          id={field.id}
          name={field.name}
          type="email"
          autoComplete="email"
          value={value}
          placeholder={field.placeholder || "you@example.com"}
          required={field.required}
          aria-invalid={
            verify.status === "invalid" ||
            verify.status === "failed" ||
            Boolean(error)
          }
          aria-busy={verify.status === "checking"}
          aria-describedby={displayError ? `${field.id}-error` : undefined}
          className={cn(
            "pr-10",
            verify.status === "valid" && "border-success",
            (verify.status === "invalid" || verify.status === "failed") &&
              "border-destructive",
          )}
          onChange={(event) => onChange(field.name, event.target.value)}
        />
        {verify.status === "checking" ? (
          <Loader2
            className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-label="Verifying email"
          />
        ) : null}
        {verify.status === "valid" ? (
          <Check
            className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-success"
            strokeWidth={2.5}
            aria-label="Email verified"
          />
        ) : null}
        {verify.status === "invalid" || verify.status === "failed" ? (
          <X
            className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-destructive"
            strokeWidth={2.5}
            aria-label="Invalid email"
          />
        ) : null}
      </div>
    </FieldShell>
  );
}
