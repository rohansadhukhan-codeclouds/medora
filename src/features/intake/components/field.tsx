"use client";

import type { FieldPath, FieldValues, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";

type FieldProps<T extends FieldValues> = {
  id: string;
  label: string;
  name: FieldPath<T>;
  register: UseFormRegister<T>;
  error?: string;
  type?: string;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  fullWidth?: boolean;
};

export function Field<T extends FieldValues>({
  id,
  label,
  name,
  register,
  error,
  type = "text",
  placeholder,
  className,
  multiline = false,
  fullWidth = false,
}: FieldProps<T>) {
  return (
    <div className={cn("space-y-2", fullWidth && "sm:col-span-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {multiline ? (
        <Textarea
          id={id}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...register(name)}
        />
      ) : (
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...register(name)}
        />
      )}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
