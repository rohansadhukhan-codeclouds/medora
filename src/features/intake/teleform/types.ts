/** Canonical field types the schema-driven renderer understands. */
export type TeleformFieldType =
  | "text"
  | "textarea"
  | "email"
  | "tel"
  | "phone"
  | "number"
  | "date"
  | "select"
  | "dropdown"
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
  step?: number;
};

/** Opaque condition entries — operators PENDING until AsterMD docs confirm. */
export type TeleformCondition = Record<string, unknown>;

export type TeleformFieldValidation = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  errorMessages?: Record<string, string>;
};

export type TeleformFormSettings = {
  saveDraft?: boolean;
  draftExpiryDays?: number;
  autoSave?: boolean;
  resumeMethod?: string;
  submitButtonText?: string;
  successMessage?: string;
  successRedirectUrl?: string | null;
  showProgressBar?: boolean;
  pageColor?: string;
  backgroundColor?: string;
  accentColor?: string;
  /** Intentionally ignored — do not execute remote JS. */
  injectJsIgnored?: true;
  /** Intentionally ignored unless a trusted CSS sanitizer exists. */
  injectCssIgnored?: true;
};

export type TeleformFieldMeta = {
  cols?: number;
  buttonAction?: TeleformButtonAction;
  buttonColor?: string;
  buttonTextColor?: string;
  multiSelect?: boolean;
  layout?: string;
  choiceInputType?: string;
  countryCode?: string;
  step?: number;
  paragraphContent?: string;
  paragraphAlign?: "left" | "center" | "right" | string;
  paragraphFontSize?: number;
  paragraphTextColor?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageItemWidths?: number[];
  imageItemHeights?: number[];
  imageGap?: number;
  imageFlexWrap?: string;
  imageFlexDirection?: string;
  imageJustifyContent?: string;
  imageAlignItems?: string;
  imageResizeMode?: string;
  imageHeading?: string;
  imageSubheading?: string;
  imageFullWidth?: boolean;
  imageFullHeight?: boolean;
  formHeaderMode?: string;
  formHeaderText?: string;
  formHeaderTextColor?: string;
  formHeaderTextSize?: number;
  formHeaderAlign?: string;
  formHeaderBackgroundColor?: string;
  formHeaderHeight?: number;
  formHeaderShadow?: boolean;
  formHeaderLogoUrl?: string;
  formHeaderLogoAlt?: string;
  formHeaderLogoWidth?: number;
  formHeaderLogoHeight?: number;
  progressColor?: string;
  progressDisplayMode?: string;
  progressShowMeta?: boolean;
  progressShowBorder?: boolean;
  progressStepShape?: string;
  termsText?: string;
  termsLinks?: TeleformTermsLink[];
  headingFullWidth?: boolean;
  headingBorderRadius?: number;
  titleColor?: string;
  titleFontSize?: number;
  titleFontWeight?: number | string;
  fieldBackgroundColor?: string;
  bmiShowScale?: boolean;
  bmiScaleRanges?: TeleformBmiRange[];
  bmiSubfields?: TeleformBmiSubfield[];
  sendToProvider?: boolean;
  dbField?: string;
};

export type NormalizedTeleformField = {
  id: string;
  name: string;
  label: string;
  type: TeleformFieldType;
  required: boolean;
  order: number;
  placeholder?: string;
  description?: string;
  options?: TeleformOption[];
  /** Raw AsterMD builder type string (e.g. choice-multi). */
  rawType?: string;
  fullWidth?: boolean;
  validation?: TeleformFieldValidation;
  conditions?: TeleformCondition[];
  meta?: TeleformFieldMeta;
};

export type NormalizedTeleformSection = {
  id: string;
  title: string;
  description?: string;
  order: number;
  conditions?: TeleformCondition[];
  fields: NormalizedTeleformField[];
};

export type NormalizedTeleform = {
  formId?: string;
  title?: string;
  description?: string;
  version?: number;
  formType?: string;
  settings?: TeleformFormSettings;
  sections: NormalizedTeleformSection[];
  fieldCount: number;
};

export type TeleformValues = Record<
  string,
  string | boolean | string[] | number | Record<string, string | number>
>;

/** Presentation-only types — excluded from answer state. */
export const PRESENTATION_FIELD_TYPES: ReadonlySet<TeleformFieldType> = new Set([
  "button",
  "heading",
  "paragraph",
  "image",
  "form_progress",
  "form_header",
  "content",
]);

export function isAnswerField(field: NormalizedTeleformField): boolean {
  return !PRESENTATION_FIELD_TYPES.has(field.type) && field.type !== "unknown";
}
