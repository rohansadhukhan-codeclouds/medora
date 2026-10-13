/** Canonical field types the AsterMD FormBuilder understands. */
export type TeleformFieldType =
  | "text"
  | "textarea"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "select"
  | "radio"
  | "checkbox"
  | "checkbox_group"
  | "choice_multi"
  | "choice_single"
  | "heading"
  | "paragraph"
  | "image"
  | "button"
  | "form_progress"
  | "form_header"
  | "terms"
  | "bmi"
  | "content"
  | "unknown";

export type TeleformOption = {
  value: string;
  label: string;
};

export type TeleformButtonAction =
  | "previous_page"
  | "next_page"
  | "submit"
  | "none"
  | string;

export type TeleformTermsLink = {
  id: string;
  text: string;
  url?: string;
};

export type TeleformBmiRange = {
  label: string;
  min: number;
  max: number;
  color?: string;
};

export type TeleformBmiSubfield = {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: TeleformOption[];
  defaultValue?: string;
  min?: number;
  max?: number;
};

export type NormalizedTeleformField = {
  id: string;
  name: string;
  label: string;
  type: TeleformFieldType;
  required: boolean;
  placeholder?: string;
  description?: string;
  options?: TeleformOption[];
  /** Raw AsterMD builder type string. */
  rawType?: string;
  fullWidth?: boolean;
  /** Extra AsterMD properties kept for rendering. */
  meta?: {
    buttonAction?: TeleformButtonAction;
    buttonColor?: string;
    buttonTextColor?: string;
    multiSelect?: boolean;
    paragraphContent?: string;
    paragraphAlign?: "left" | "center" | "right" | string;
    imageUrl?: string;
    termsText?: string;
    termsLinks?: TeleformTermsLink[];
    headingFullWidth?: boolean;
    titleColor?: string;
    fieldBackgroundColor?: string;
    bmiShowScale?: boolean;
    bmiScaleRanges?: TeleformBmiRange[];
    bmiSubfields?: TeleformBmiSubfield[];
  };
};

export type NormalizedTeleformSection = {
  id: string;
  title: string;
  description?: string;
  fields: NormalizedTeleformField[];
};

export type NormalizedTeleform = {
  title?: string;
  description?: string;
  sections: NormalizedTeleformSection[];
  fieldCount: number;
};

export type TeleformValues = Record<
  string,
  string | boolean | string[] | number | Record<string, string | number>
>;
