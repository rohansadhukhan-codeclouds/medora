"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { FieldShell } from "@/features/intake/teleform/fields/field-shell";
import type {
  NormalizedTeleformField,
  TeleformBmiSubfield,
} from "@/features/intake/teleform/types";
import { cn } from "@/lib/utils/cn";

type BmiValue = Record<string, string>;

type Props = {
  field: NormalizedTeleformField;
  value: BmiValue;
  error?: string;
  onChange: (value: BmiValue) => void;
};

function calcBmi(unit: string, height: number, weight: number): number | null {
  if (!height || !weight || height <= 0 || weight <= 0) return null;
  const imperial = unit.toLowerCase().includes("imperial");
  if (imperial) {
    return (weight / (height * height)) * 703;
  }
  const meters = height / 100;
  return weight / (meters * meters);
}

function SubfieldControl({
  sub,
  value,
  onChange,
}: {
  sub: TeleformBmiSubfield;
  value: string;
  onChange: (next: string) => void;
}) {
  const type = sub.type.toLowerCase();

  if (type === "dropdown" || type === "select") {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">{sub.label}</p>
        <select
          className="flex h-11 w-full rounded-lg border border-input bg-card px-3 text-sm"
          value={value}
          required={sub.required}
          onChange={(event) => onChange(event.target.value)}
        >
          {(sub.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (type === "choice-single" || type === "radio") {
    return (
      <div className="space-y-2 sm:col-span-2">
        <p className="text-xs font-medium text-muted-foreground">{sub.label}</p>
        <div role="radiogroup" className="flex flex-wrap gap-2">
          {(sub.options ?? []).map((option) => {
            const selected = value === option.value;
            return (
              <label
                key={option.value}
                className={cn(
                  "cursor-pointer rounded-xl border px-3 py-2 text-sm",
                  selected
                    ? "border-primary bg-primary-muted"
                    : "border-border hover:bg-accent",
                )}
              >
                <input
                  type="radio"
                  className="sr-only"
                  name={sub.name}
                  value={option.value}
                  checked={selected}
                  onChange={() => onChange(option.value)}
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{sub.label}</p>
      <Input
        type="number"
        inputMode="decimal"
        placeholder={sub.placeholder}
        min={sub.min}
        max={sub.max}
        step={sub.step ?? 1}
        value={value}
        required={sub.required}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function BmiField({ field, value, error, onChange }: Props) {
  const subfields = field.meta?.bmiSubfields ?? [];
  const unitField = subfields.find((s) => s.name === "unit");
  const unit =
    value.unit ||
    unitField?.defaultValue ||
    unitField?.options?.[0]?.value ||
    "Imperial (lbs/inches)";

  const height = Number(value.height || 0);
  const weight = Number(value.weight || 0);
  const bmi = useMemo(
    () => calcBmi(unit, height, weight),
    [unit, height, weight],
  );

  const range =
    typeof bmi === "number"
      ? field.meta?.bmiScaleRanges?.find(
          (item) => bmi >= item.min && bmi <= item.max,
        )
      : undefined;

  return (
    <FieldShell
      id={field.id}
      label={field.label || "BMI"}
      required={field.required}
      error={error}
      fullWidth
      cols={field.meta?.cols}
    >
      <div className="space-y-4 rounded-2xl border border-border bg-accent/40 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {subfields.map((sub) => (
            <SubfieldControl
              key={sub.name}
              sub={sub}
              value={
                value[sub.name] ??
                (sub.name === "unit" ? unit : (sub.defaultValue ?? ""))
              }
              onChange={(next) => onChange({ ...value, [sub.name]: next })}
            />
          ))}
        </div>

        {(value.height || value.weight) && (
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">Calculated BMI</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {bmi ? bmi.toFixed(1) : "—"}
            </p>
            {range ? (
              <p
                className="mt-1 text-sm font-medium"
                style={{ color: range.color }}
              >
                {range.label}
              </p>
            ) : null}
          </div>
        )}

        {field.meta?.bmiShowScale && field.meta.bmiScaleRanges?.length ? (
          <div className="flex flex-wrap gap-2">
            {field.meta.bmiScaleRanges.map((item) => (
              <span
                key={item.label}
                className="rounded-full px-2.5 py-1 text-[11px] font-medium text-white"
                style={{ backgroundColor: item.color || "var(--primary)" }}
              >
                {item.label} ({item.min}–{item.max})
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}
