"use client";

import { DynamicFieldRenderer } from "@/features/intake/teleform/dynamic-field-renderer";
import { shouldRenderField } from "@/features/intake/teleform/conditions";
import type {
  NormalizedTeleformField,
  TeleformValues,
} from "@/features/intake/teleform/types";

type Props = {
  fields: NormalizedTeleformField[];
  values: TeleformValues;
  errors: Record<string, string>;
  pageIndex: number;
  pageCount: number;
  onChange: (name: string, value: TeleformValues[string]) => void;
};

export function DynamicPageRenderer({
  fields,
  values,
  errors,
  pageIndex,
  pageCount,
  onChange,
}: Props) {
  const visibleFields = fields
    .filter((field) => field.type !== "button")
    .filter((field) => shouldRenderField(field, values));

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {visibleFields.map((field) => (
        <DynamicFieldRenderer
          key={field.id}
          field={field}
          values={values}
          error={errors[field.name]}
          pageIndex={pageIndex}
          pageCount={pageCount}
          onChange={onChange}
        />
      ))}
    </div>
  );
}
