"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { FieldShell } from "@/features/intake/teleform/fields/field-shell";
import type { NormalizedTeleformField } from "@/features/intake/teleform/types";
import { cn } from "@/lib/utils/cn";

type BmiValue = {
  unit?: string;
  height?: string;
  weight?: string;
};

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
    // inches + lbs
    return (weight / (height * height)) * 703;
  }
  // cm + kg → m
  const meters = height / 100;
  return weight / (meters * meters);
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
    >
      <div className="space-y-4 rounded-2xl border border-border bg-accent/40 p-4">
        {unitField ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              {unitField.label}
            </p>
            <select
              className="flex h-11 w-full rounded-lg border border-input bg-card px-3 text-sm"
              value={unit}
              onChange={(event) =>
                onChange({ ...value, unit: event.target.value })
              }
            >
              {(unitField.options ?? []).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Height</p>
            <Input
              type="number"
              inputMode="decimal"
              placeholder={
                unit.toLowerCase().includes("imperial") ? "inches" : "cm"
              }
              value={value.height ?? ""}
              onChange={(event) =>
                onChange({ ...value, height: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Weight</p>
            <Input
              type="number"
              inputMode="decimal"
              placeholder={
                unit.toLowerCase().includes("imperial") ? "lbs" : "kg"
              }
              value={value.weight ?? ""}
              onChange={(event) =>
                onChange({ ...value, weight: event.target.value })
              }
            />
          </div>
        </div>

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

        {field.meta?.bmiShowScale && field.meta.bmiScaleRanges?.length ? (
          <div className="flex flex-wrap gap-2">
            {field.meta.bmiScaleRanges.map((item) => (
              <span
                key={item.label}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium text-white",
                )}
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
