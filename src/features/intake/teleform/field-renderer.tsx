"use client";

import { BmiField } from "@/features/intake/teleform/fields/bmi-field";
import { CheckboxField } from "@/features/intake/teleform/fields/checkbox-field";
import { ChoiceField } from "@/features/intake/teleform/fields/choice-field";
import { ContentBlock } from "@/features/intake/teleform/fields/content-block";
import {
  FormHeaderBlock,
  FormProgressBlock,
  HeadingBlock,
  ImageBlock,
  ParagraphBlock,
} from "@/features/intake/teleform/fields/display-fields";
import { RadioField } from "@/features/intake/teleform/fields/radio-field";
import { SelectField } from "@/features/intake/teleform/fields/select-field";
import { TermsField } from "@/features/intake/teleform/fields/terms-field";
import { TextField } from "@/features/intake/teleform/fields/text-field";
import { TextareaField } from "@/features/intake/teleform/fields/textarea-field";
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
  onChange: (name: string, value: TeleformValues[string]) => void;
};

function asString(value: TeleformValues[string] | undefined): string {
  return typeof value === "string" ? value : "";
}

function asBool(value: TeleformValues[string] | undefined): boolean {
  return value === true;
}

function asStringArray(value: TeleformValues[string] | undefined): string[] {
  return Array.isArray(value) ? value : [];
}

function asBmi(
  value: TeleformValues[string] | undefined,
): Record<string, string> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record: Record<string, string> = {};
    for (const [key, item] of Object.entries(value)) {
      record[key] = String(item ?? "");
    }
    return record;
  }
  return {};
}

export function FieldRenderer({
  field,
  values,
  error,
  pageIndex,
  pageCount,
  onChange,
}: Props) {
  const current = values[field.name];

  switch (field.type) {
    case "heading":
      return <HeadingBlock field={field} />;
    case "paragraph":
      return <ParagraphBlock field={field} />;
    case "image":
      return <ImageBlock field={field} />;
    case "form_header":
      return <FormHeaderBlock field={field} />;
    case "form_progress":
      return (
        <FormProgressBlock
          field={field}
          current={pageIndex}
          total={pageCount}
        />
      );
    case "button":
      // Buttons are rendered by AsterMdFormBuilder navigation chrome.
      return null;
    case "terms":
      return (
        <TermsField
          field={field}
          value={asBool(current)}
          error={error}
          onChange={(value) => onChange(field.name, value)}
        />
      );
    case "bmi":
      return (
        <BmiField
          field={field}
          value={asBmi(current)}
          error={error}
          onChange={(value) => onChange(field.name, value)}
        />
      );
    case "choice_multi":
      return (
        <ChoiceField
          field={field}
          multi={field.meta?.multiSelect === true}
          value={
            field.meta?.multiSelect
              ? asStringArray(current)
              : asString(current)
          }
          error={error}
          onChange={(value) => onChange(field.name, value)}
        />
      );
    case "choice_single":
      return (
        <ChoiceField
          field={field}
          multi={false}
          value={asString(current)}
          error={error}
          onChange={(value) => onChange(field.name, value)}
        />
      );
    case "textarea":
      return (
        <TextareaField
          field={field}
          value={asString(current)}
          error={error}
          onChange={(value) => onChange(field.name, value)}
        />
      );
    case "email":
      return (
        <TextField
          field={field}
          inputType="email"
          value={asString(current)}
          error={error}
          onChange={(value) => onChange(field.name, value)}
        />
      );
    case "tel":
      return (
        <TextField
          field={field}
          inputType="tel"
          value={asString(current)}
          error={error}
          onChange={(value) => onChange(field.name, value)}
        />
      );
    case "number":
      return (
        <TextField
          field={field}
          inputType="number"
          value={asString(current)}
          error={error}
          onChange={(value) => onChange(field.name, value)}
        />
      );
    case "date":
      return (
        <TextField
          field={field}
          inputType="date"
          value={asString(current)}
          error={error}
          onChange={(value) => onChange(field.name, value)}
        />
      );
    case "select":
      return (
        <SelectField
          field={field}
          value={asString(current)}
          error={error}
          onChange={(value) => onChange(field.name, value)}
        />
      );
    case "radio":
      return (
        <RadioField
          field={field}
          value={asString(current)}
          error={error}
          onChange={(value) => onChange(field.name, value)}
        />
      );
    case "checkbox":
      return (
        <CheckboxField
          field={field}
          mode="single"
          value={asBool(current)}
          error={error}
          onChange={(value) => onChange(field.name, value)}
        />
      );
    case "checkbox_group":
      return (
        <CheckboxField
          field={field}
          mode="group"
          value={asStringArray(current)}
          error={error}
          onChange={(value) => onChange(field.name, value)}
        />
      );
    case "content":
      return <ContentBlock field={field} />;
    case "unknown":
    case "text":
    default:
      return (
        <TextField
          field={field}
          value={asString(current)}
          error={error}
          onChange={(value) => onChange(field.name, value)}
        />
      );
  }
}
