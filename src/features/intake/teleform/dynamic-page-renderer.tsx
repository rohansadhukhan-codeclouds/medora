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
  accentColor?: string;
  onChange: (name: string, value: TeleformValues[string]) => void;
  onButtonAction?: (action: string | undefined) => void;
};

export function DynamicPageRenderer({
  fields,
  values,
  errors,
  pageIndex,
  pageCount,
  accentColor,
  onChange,
  onButtonAction,
}: Props) {
  // Keep API field.order. Only pin form-header above siblings.
  // Buttons stay in-stream so later fields (e.g. image order 5) render after them.
  const visibleFields = fields
    .filter((field) => shouldRenderField(field, values))
    .slice()
    .sort((a, b) => {
      const aHeader = a.type === "form_header" ? 0 : 1;
      const bHeader = b.type === "form_header" ? 0 : 1;
      if (aHeader !== bHeader) return aHeader - bHeader;
      return a.order - b.order;
    });

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
          accentColor={accentColor}
          onChange={onChange}
          onButtonAction={onButtonAction}
        />
      ))}
    </div>
  );
}
