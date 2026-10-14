"use client";

import { fieldRegistry } from "@/features/intake/teleform/registry";
import type {
  NormalizedTeleformField,
  TeleformValues,
} from "@/features/intake/teleform/types";

type Props = {
  field: NormalizedTeleformField;
  values: TeleformValues;
  error?: string;
  pageIndex: number;
  pageCount: number;
  accentColor?: string;
  onChange: (name: string, value: TeleformValues[string]) => void;
  onButtonAction?: (action: string | undefined) => void;
};

export function DynamicFieldRenderer({
  field,
  values,
  error,
  pageIndex,
  pageCount,
  accentColor,
  onChange,
  onButtonAction,
}: Props) {
  const Renderer = fieldRegistry[field.type] ?? fieldRegistry.unknown;

  return (
    <Renderer
      field={field}
      values={values}
      error={error}
      pageIndex={pageIndex}
      pageCount={pageCount}
      accentColor={accentColor}
      onChange={onChange}
      onButtonAction={onButtonAction}
    />
  );
}

/** @deprecated Prefer DynamicFieldRenderer */
export const FieldRenderer = DynamicFieldRenderer;
