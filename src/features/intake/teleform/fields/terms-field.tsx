"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { FieldShell } from "@/features/intake/teleform/fields/field-shell";
import type { NormalizedTeleformField } from "@/features/intake/teleform/types";

type Props = {
  field: NormalizedTeleformField;
  value: boolean;
  error?: string;
  onChange: (value: boolean) => void;
};

export function TermsField({ field, value, error, onChange }: Props) {
  const text = field.meta?.termsText || field.label || "I agree to the terms";
  const links = field.meta?.termsLinks ?? [];

  return (
    <FieldShell
      id={field.id}
      label="Consent"
      required={field.required}
      error={error}
      fullWidth
      cols={field.meta?.cols}
    >
      <label
        htmlFor={field.id}
        className="flex cursor-pointer items-start gap-3 rounded-xl border border-border px-3 py-3 hover:bg-accent"
      >
        <Checkbox
          id={field.id}
          checked={value}
          className="mt-0.5"
          onCheckedChange={(checked) => onChange(checked === true)}
        />
        <span className="text-sm leading-relaxed text-foreground">
          {links.length === 0
            ? text
            : text.split(/,\s*/).map((chunk, index) => {
                const link = links.find((item) =>
                  chunk.toLowerCase().includes(item.text.toLowerCase()),
                );
                if (!link) {
                  return (
                    <span key={`${chunk}-${index}`}>
                      {index > 0 ? ", " : null}
                      {chunk}
                    </span>
                  );
                }
                return (
                  <span key={link.id}>
                    {index > 0 ? ", " : null}
                    {link.url ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-primary underline-offset-2 hover:underline"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {link.text}
                      </a>
                    ) : (
                      <span className="font-medium text-primary">
                        {link.text}
                      </span>
                    )}
                  </span>
                );
              })}
        </span>
      </label>
    </FieldShell>
  );
}
