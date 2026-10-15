"use client";

import type { ComponentType } from "react";
import { BmiField } from "@/features/intake/teleform/fields/bmi-field";
import { ButtonField } from "@/features/intake/teleform/fields/button-field";
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
import { DatePickerTeleformField } from "@/features/intake/teleform/fields/date-picker-teleform-field";
import { EmailVerifyField } from "@/features/intake/teleform/fields/email-verify-field";
import { PhoneCountryTeleformField } from "@/features/intake/teleform/fields/phone-country-teleform-field";
import { TextField } from "@/features/intake/teleform/fields/text-field";
import { TextareaField } from "@/features/intake/teleform/fields/textarea-field";
import { UnsupportedField } from "@/features/intake/teleform/fields/unsupported-field";
import { phoneCountryIsoKey } from "@/features/intake/teleform/field-meta";
import type {
  NormalizedTeleformField,
  TeleformFieldType,
  TeleformValues,
} from "@/features/intake/teleform/types";
import { DEFAULT_PHONE_COUNTRY_ISO } from "@/features/intake/data/country-dial-codes";

export type FieldRenderProps = {
  field: NormalizedTeleformField;
  values: TeleformValues;
  error?: string;
  pageIndex: number;
  pageCount: number;
  accentColor?: string;
  onChange: (name: string, value: TeleformValues[string]) => void;
  onButtonAction?: (action: string | undefined) => void;
};

export type FieldComponent = ComponentType<FieldRenderProps>;

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

function TextAdapter({ field, values, error, onChange }: FieldRenderProps) {
  return (
    <TextField
      field={field}
      value={asString(values[field.name])}
      error={error}
      onChange={(value) => onChange(field.name, value)}
    />
  );
}

function EmailAdapter(props: FieldRenderProps) {
  return (
    <EmailVerifyField
      field={props.field}
      value={asString(props.values[props.field.name])}
      error={props.error}
      onChange={props.onChange}
    />
  );
}

function PhoneAdapter(props: FieldRenderProps) {
  const countryKey = phoneCountryIsoKey(props.field.name);
  return (
    <PhoneCountryTeleformField
      field={props.field}
      value={asString(props.values[props.field.name])}
      countryIso={
        asString(props.values[countryKey]) || DEFAULT_PHONE_COUNTRY_ISO
      }
      error={props.error}
      onChange={props.onChange}
    />
  );
}

function NumberAdapter(props: FieldRenderProps) {
  return (
    <TextField
      field={props.field}
      inputType="number"
      value={asString(props.values[props.field.name])}
      error={props.error}
      onChange={(value) => props.onChange(props.field.name, value)}
    />
  );
}

function DateAdapter(props: FieldRenderProps) {
  return (
    <DatePickerTeleformField
      field={props.field}
      value={asString(props.values[props.field.name])}
      error={props.error}
      onChange={(value) => props.onChange(props.field.name, value)}
    />
  );
}

function TextareaAdapter(props: FieldRenderProps) {
  return (
    <TextareaField
      field={props.field}
      value={asString(props.values[props.field.name])}
      error={props.error}
      onChange={(value) => props.onChange(props.field.name, value)}
    />
  );
}

function SelectAdapter(props: FieldRenderProps) {
  return (
    <SelectField
      field={props.field}
      value={asString(props.values[props.field.name])}
      error={props.error}
      onChange={(value) => props.onChange(props.field.name, value)}
    />
  );
}

function ChoiceMultiAdapter(props: FieldRenderProps) {
  const multi = props.field.meta?.multiSelect === true;
  return (
    <ChoiceField
      field={props.field}
      multi={multi}
      value={
        multi
          ? asStringArray(props.values[props.field.name])
          : asString(props.values[props.field.name])
      }
      error={props.error}
      onChange={(value) => props.onChange(props.field.name, value)}
    />
  );
}

function ChoiceSingleAdapter(props: FieldRenderProps) {
  return (
    <ChoiceField
      field={props.field}
      multi={false}
      value={asString(props.values[props.field.name])}
      error={props.error}
      onChange={(value) => props.onChange(props.field.name, value)}
    />
  );
}

function RadioAdapter(props: FieldRenderProps) {
  return (
    <RadioField
      field={props.field}
      value={asString(props.values[props.field.name])}
      error={props.error}
      onChange={(value) => props.onChange(props.field.name, value)}
    />
  );
}

function CheckboxAdapter(props: FieldRenderProps) {
  return (
    <CheckboxField
      field={props.field}
      mode="single"
      value={asBool(props.values[props.field.name])}
      error={props.error}
      onChange={(value) => props.onChange(props.field.name, value)}
    />
  );
}

function CheckboxGroupAdapter(props: FieldRenderProps) {
  return (
    <CheckboxField
      field={props.field}
      mode="group"
      value={asStringArray(props.values[props.field.name])}
      error={props.error}
      onChange={(value) => props.onChange(props.field.name, value)}
    />
  );
}

function TermsAdapter(props: FieldRenderProps) {
  return (
    <TermsField
      field={props.field}
      value={asBool(props.values[props.field.name])}
      error={props.error}
      onChange={(value) => props.onChange(props.field.name, value)}
    />
  );
}

function BmiAdapter(props: FieldRenderProps) {
  return (
    <BmiField
      field={props.field}
      value={asBmi(props.values[props.field.name])}
      error={props.error}
      onChange={(value) => props.onChange(props.field.name, value)}
    />
  );
}

function HeadingAdapter({ field }: FieldRenderProps) {
  return <HeadingBlock field={field} />;
}

function ParagraphAdapter({ field }: FieldRenderProps) {
  return <ParagraphBlock field={field} />;
}

function ImageAdapter({ field }: FieldRenderProps) {
  return <ImageBlock field={field} />;
}

function FormHeaderAdapter({ field }: FieldRenderProps) {
  return <FormHeaderBlock field={field} />;
}

function FormProgressAdapter({
  field,
  pageIndex,
  pageCount,
}: FieldRenderProps) {
  return (
    <FormProgressBlock field={field} current={pageIndex} total={pageCount} />
  );
}

function ContentAdapter({ field }: FieldRenderProps) {
  return <ContentBlock field={field} />;
}

function ButtonAdapter({
  field,
  pageIndex,
  accentColor,
  onButtonAction,
}: FieldRenderProps) {
  return (
    <ButtonField
      field={field}
      accentColor={accentColor}
      disabled={
        (/back|previous/i.test(field.label || "") ||
          field.meta?.buttonAction === "previous_page") &&
        pageIndex === 0
      }
      onAction={(nextAction) => onButtonAction?.(nextAction)}
    />
  );
}

function UnsupportedAdapter({ field }: FieldRenderProps) {
  return <UnsupportedField field={field} />;
}

/**
 * Field component registry — add new AsterMD types here without growing a switch.
 */
export const fieldRegistry: Record<TeleformFieldType, FieldComponent> = {
  text: TextAdapter,
  email: EmailAdapter,
  tel: PhoneAdapter,
  phone: PhoneAdapter,
  number: NumberAdapter,
  date: DateAdapter,
  textarea: TextareaAdapter,
  select: SelectAdapter,
  dropdown: SelectAdapter,
  choice_multi: ChoiceMultiAdapter,
  choice_single: ChoiceSingleAdapter,
  radio: RadioAdapter,
  checkbox: CheckboxAdapter,
  checkbox_group: CheckboxGroupAdapter,
  terms: TermsAdapter,
  bmi: BmiAdapter,
  heading: HeadingAdapter,
  paragraph: ParagraphAdapter,
  image: ImageAdapter,
  form_header: FormHeaderAdapter,
  form_progress: FormProgressAdapter,
  content: ContentAdapter,
  button: ButtonAdapter,
  unknown: UnsupportedAdapter,
};

export function resolveFieldComponent(
  type: TeleformFieldType,
): FieldComponent {
  return fieldRegistry[type] ?? UnsupportedAdapter;
}
