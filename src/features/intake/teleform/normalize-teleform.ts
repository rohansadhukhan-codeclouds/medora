import { normalizeOptions } from "@/features/intake/teleform/options";
import type {
  NormalizedTeleform,
  NormalizedTeleformField,
  NormalizedTeleformSection,
  TeleformBmiSubfield,
  TeleformCondition,
  TeleformFieldType,
  TeleformFieldValidation,
  TeleformFormSettings,
  TeleformTermsLink,
} from "@/features/intake/teleform/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asNumberArray(value: unknown): number[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const nums = value.filter(
    (item): item is number => typeof item === "number" && Number.isFinite(item),
  );
  return nums.length ? nums : undefined;
}

function asConditions(value: unknown): TeleformCondition[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  return value.filter(isRecord);
}

export function mapFieldType(raw: string): TeleformFieldType {
  const t = raw.toLowerCase().trim();
  switch (t) {
    case "text":
    case "string":
    case "input":
      return "text";
    case "textarea":
    case "longtext":
      return "textarea";
    case "email":
      return "email";
    case "tel":
    case "phone":
    case "telephone":
    case "mobile":
      return "tel";
    case "number":
    case "integer":
    case "float":
      return "number";
    case "date":
    case "datetime":
      return "date";
    case "select":
    case "dropdown":
      return "select";
    case "radio":
    case "choice-single":
      return "choice_single";
    case "choice-multi":
      return "choice_multi";
    case "checkbox":
      return "checkbox";
    case "checkboxes":
    case "checkbox-group":
      return "checkbox_group";
    case "heading":
      return "heading";
    case "paragraph":
      return "paragraph";
    case "image":
      return "image";
    case "button":
      return "button";
    case "form-progress":
      return "form_progress";
    case "form-header":
      return "form_header";
    case "terms":
      return "terms";
    case "bmi":
      return "bmi";
    case "content":
    case "html":
      return "content";
    default:
      return "unknown";
  }
}

function readTermsLinks(
  properties: Record<string, unknown> | undefined,
): TeleformTermsLink[] {
  if (!properties || !Array.isArray(properties.termsLinks)) return [];
  return properties.termsLinks
    .filter(isRecord)
    .map((link, index) => ({
      id: asString(link.id, `link_${index}`),
      text: asString(link.text),
      url: asString(link.url) || undefined,
    }))
    .filter((link) => link.text);
}

function readValidation(
  node: Record<string, unknown>,
): TeleformFieldValidation | undefined {
  const validation = isRecord(node.validation) ? node.validation : undefined;
  if (!validation) return undefined;

  const errorMessages = isRecord(validation.errorMessages)
    ? Object.fromEntries(
        Object.entries(validation.errorMessages).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
      )
    : undefined;

  const result: TeleformFieldValidation = {
    required: validation.required === true ? true : undefined,
    minLength: asNumber(validation.minLength),
    maxLength: asNumber(validation.maxLength),
    minValue: asNumber(validation.minValue),
    maxValue: asNumber(validation.maxValue),
    errorMessages:
      errorMessages && Object.keys(errorMessages).length
        ? errorMessages
        : undefined,
  };

  if (
    result.required === undefined &&
    result.minLength === undefined &&
    result.maxLength === undefined &&
    result.minValue === undefined &&
    result.maxValue === undefined &&
    !result.errorMessages
  ) {
    return undefined;
  }

  return result;
}

function readBmiSubfields(node: Record<string, unknown>): TeleformBmiSubfield[] {
  if (!Array.isArray(node.subfields)) return [];
  return node.subfields.filter(isRecord).map((sub) => {
    const props = isRecord(sub.properties) ? sub.properties : undefined;
    const validation = isRecord(sub.validation) ? sub.validation : undefined;
    return {
      name: asString(sub.name),
      label: asString(sub.label ?? sub.name),
      type: asString(sub.type, "text"),
      required: sub.required === true,
      placeholder: asString(sub.placeholder) || undefined,
      options: normalizeOptions(props?.options),
      defaultValue: asString(props?.defaultValue) || undefined,
      min: asNumber(validation?.minValue),
      max: asNumber(validation?.maxValue),
      step: asNumber(props?.step),
    };
  });
}

function readSettings(raw: Record<string, unknown>): TeleformFormSettings | undefined {
  const settings = isRecord(raw.settings) ? raw.settings : undefined;
  if (!settings) return undefined;

  return {
    saveDraft: settings.saveDraft === true,
    draftExpiryDays: asNumber(settings.draftExpiryDays),
    autoSave: settings.autoSave === true,
    resumeMethod: asString(settings.resumeMethod) || undefined,
    submitButtonText: asString(settings.submitButtonText) || undefined,
    successMessage: asString(settings.successMessage) || undefined,
    successRedirectUrl:
      typeof settings.successRedirectUrl === "string"
        ? settings.successRedirectUrl
        : settings.successRedirectUrl === null
          ? null
          : undefined,
    showProgressBar: settings.showProgressBar !== false,
    pageColor: asString(settings.pageColor) || undefined,
    backgroundColor: asString(settings.backgroundColor) || undefined,
    accentColor: asString(settings.accentColor) || undefined,
    // Remote script/CSS injection is intentionally not exposed for execution.
    injectJsIgnored: true,
    injectCssIgnored: true,
  };
}

function toAsterMdField(
  node: Record<string, unknown>,
  index: number,
): NormalizedTeleformField | null {
  const rawType = asString(node.type);
  if (!rawType) return null;

  const type = mapFieldType(rawType);
  const properties = isRecord(node.properties) ? node.properties : undefined;
  const id =
    asString(node.fieldId ?? node.id ?? node.name) || `field_${index}`;
  const name = asString(node.name ?? node.fieldId ?? node.id) || id;
  const label = asString(node.label) || name;
  const validation = readValidation(node);
  const required = Boolean(
    node.required === true || validation?.required === true,
  );
  const options = normalizeOptions(properties?.options);
  const multiSelect = properties?.multiSelect === true;
  const cols = asNumber(properties?.cols);
  const order = asNumber(node.order) ?? index;

  const fullWidth =
    cols === 1 ||
    cols === undefined ||
    type === "textarea" ||
    type === "paragraph" ||
    type === "heading" ||
    type === "choice_multi" ||
    type === "choice_single" ||
    type === "bmi" ||
    type === "terms" ||
    type === "image" ||
    type === "form_progress" ||
    type === "form_header" ||
    properties?.headingFullWidth === true;

  return {
    id,
    name,
    label,
    type,
    required,
    order,
    placeholder: asString(node.placeholder) || undefined,
    options: options.length ? options : undefined,
    rawType,
    fullWidth,
    validation,
    conditions: asConditions(node.conditions),
    meta: {
      cols,
      buttonAction: asString(properties?.buttonAction) || undefined,
      buttonColor: asString(properties?.buttonColor) || undefined,
      buttonTextColor: asString(properties?.buttonTextColor) || undefined,
      multiSelect,
      layout: asString(properties?.layout) || undefined,
      choiceInputType: asString(properties?.choiceInputType) || undefined,
      countryCode: asString(properties?.countryCode) || undefined,
      step: asNumber(properties?.step),
      paragraphContent: asString(properties?.paragraphContent) || undefined,
      paragraphAlign: asString(properties?.paragraphAlign) || undefined,
      paragraphFontSize: asNumber(properties?.paragraphFontSize),
      paragraphTextColor: asString(properties?.paragraphTextColor) || undefined,
      imageUrl:
        typeof properties?.imageUrl === "string"
          ? properties.imageUrl
          : asString(properties?.imageUrl) || undefined,
      imageAlt: asString(properties?.imageAlt) || undefined,
      imageWidth: asNumber(properties?.imageWidth),
      imageHeight: asNumber(properties?.imageHeight),
      imageItemWidths: asNumberArray(properties?.imageItemWidths),
      imageItemHeights: asNumberArray(properties?.imageItemHeights),
      imageGap: asNumber(properties?.imageGap),
      imageFlexWrap: asString(properties?.imageFlexWrap) || undefined,
      imageFlexDirection: asString(properties?.imageFlexDirection) || undefined,
      imageJustifyContent:
        asString(properties?.imageJustifyContent) || undefined,
      imageAlignItems: asString(properties?.imageAlignItems) || undefined,
      imageResizeMode: asString(properties?.imageResizeMode) || undefined,
      imageHeading: asString(properties?.imageHeading) || undefined,
      imageSubheading: asString(properties?.imageSubheading) || undefined,
      imageFullWidth: properties?.imageFullWidth === true,
      imageFullHeight: properties?.imageFullHeight === true,
      formHeaderMode: asString(properties?.formHeaderMode) || undefined,
      formHeaderText: asString(properties?.formHeaderText) || undefined,
      formHeaderTextColor:
        asString(properties?.formHeaderTextColor) || undefined,
      formHeaderTextSize: asNumber(properties?.formHeaderTextSize),
      formHeaderAlign: asString(properties?.formHeaderAlign) || undefined,
      formHeaderBackgroundColor:
        asString(properties?.formHeaderBackgroundColor) || undefined,
      formHeaderHeight: asNumber(properties?.formHeaderHeight),
      formHeaderShadow: properties?.formHeaderShadow === true,
      formHeaderLogoUrl:
        typeof properties?.formHeaderLogoUrl === "string"
          ? properties.formHeaderLogoUrl
          : asString(properties?.formHeaderLogoUrl) || undefined,
      formHeaderLogoAlt: asString(properties?.formHeaderLogoAlt) || undefined,
      formHeaderLogoWidth: asNumber(properties?.formHeaderLogoWidth),
      formHeaderLogoHeight: asNumber(properties?.formHeaderLogoHeight),
      progressColor: asString(properties?.progressColor) || undefined,
      progressDisplayMode:
        asString(properties?.progressDisplayMode) || undefined,
      progressShowMeta: properties?.progressShowMeta === true,
      progressShowBorder: properties?.progressShowBorder === true,
      progressStepShape: asString(properties?.progressStepShape) || undefined,
      termsText: asString(properties?.termsText) || undefined,
      termsLinks: readTermsLinks(properties),
      headingFullWidth: properties?.headingFullWidth === true,
      headingBorderRadius: asNumber(properties?.headingBorderRadius),
      titleColor: asString(properties?.titleColor) || undefined,
      titleFontSize: asNumber(properties?.titleFontSize),
      titleFontWeight:
        typeof properties?.titleFontWeight === "number" ||
        typeof properties?.titleFontWeight === "string"
          ? properties.titleFontWeight
          : undefined,
      fieldBackgroundColor:
        asString(properties?.fieldBackgroundColor) || undefined,
      bmiShowScale: properties?.bmiShowScale === true,
      bmiScaleRanges: Array.isArray(properties?.bmiScaleRanges)
        ? properties.bmiScaleRanges.filter(isRecord).map((range) => ({
            label: asString(range.label),
            min: typeof range.min === "number" ? range.min : 0,
            max: typeof range.max === "number" ? range.max : 0,
            color: asString(range.color) || undefined,
          }))
        : undefined,
      bmiSubfields: readBmiSubfields(node),
      sendToProvider: node.sendToProvider === true,
      dbField: asString(node.db_field) || undefined,
    },
  };
}

function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

/**
 * Primary path: AsterMD teleform builder JSON
 * `{ formName, pages: [{ pageId, title, order, fields: [...] }] }`
 */
function normalizeAsterMdPages(raw: Record<string, unknown>): NormalizedTeleform | null {
  if (!Array.isArray(raw.pages) || raw.pages.length === 0) return null;

  const sections: NormalizedTeleformSection[] = [];

  raw.pages.forEach((page, pageIndex) => {
    if (!isRecord(page)) return;
    const fieldsRaw = Array.isArray(page.fields) ? page.fields : [];
    const fields: NormalizedTeleformField[] = [];

    fieldsRaw.forEach((field, fieldIndex) => {
      if (!isRecord(field)) return;
      const normalized = toAsterMdField(field, fieldIndex);
      if (normalized) fields.push(normalized);
    });

    sections.push({
      id: asString(page.pageId ?? page.id, `section_${pageIndex}`),
      title: asString(page.title, `Page ${pageIndex + 1}`),
      description: asString(page.description) || undefined,
      order: asNumber(page.order) ?? pageIndex,
      conditions: asConditions(page.conditions),
      fields: sortByOrder(fields),
    });
  });

  if (!sections.length) return null;

  return {
    formId: asString(raw.formId) || undefined,
    title: asString(raw.formName ?? raw.title) || undefined,
    description: asString(raw.description) || undefined,
    version: asNumber(raw.version),
    formType: asString(raw.formType) || undefined,
    settings: readSettings(raw),
    sections: sortByOrder(sections),
    fieldCount: sections.reduce((sum, s) => sum + s.fields.length, 0),
  };
}

/**
 * Convert AsterMD teleform JSON (or already-normalized shape) into a stable UI model.
 */
export function normalizeTeleformJson(raw: unknown): NormalizedTeleform {
  if (!raw) {
    return { sections: [], fieldCount: 0 };
  }

  // Already normalized client/server payload
  if (isRecord(raw) && Array.isArray(raw.sections)) {
    const sections = raw.sections.filter(isRecord).map((section, index) => ({
      id: asString(section.id, `section_${index}`),
      title: asString(section.title, `Page ${index + 1}`),
      description: asString(section.description) || undefined,
      order: asNumber(section.order) ?? index,
      conditions: asConditions(section.conditions),
      fields: Array.isArray(section.fields)
        ? sortByOrder(
            section.fields.filter(isRecord).map((field, fieldIndex) => {
              const rawType = asString(field.rawType ?? field.type, "text");
              return {
                id: asString(field.id, `field_${fieldIndex}`),
                name: asString(field.name, `field_${fieldIndex}`),
                label: asString(field.label, asString(field.name)),
                type: mapFieldType(rawType),
                required: field.required === true,
                order: asNumber(field.order) ?? fieldIndex,
                placeholder: asString(field.placeholder) || undefined,
                description: asString(field.description) || undefined,
                options: Array.isArray(field.options)
                  ? normalizeOptions(field.options)
                  : undefined,
                rawType,
                fullWidth: field.fullWidth === true,
                validation: isRecord(field.validation)
                  ? (field.validation as TeleformFieldValidation)
                  : undefined,
                conditions: asConditions(field.conditions),
                meta: isRecord(field.meta)
                  ? (field.meta as NormalizedTeleformField["meta"])
                  : undefined,
              } satisfies NormalizedTeleformField;
            }),
          )
        : [],
    }));

    return {
      formId: asString(raw.formId) || undefined,
      title: asString(raw.title) || undefined,
      description: asString(raw.description) || undefined,
      version: asNumber(raw.version),
      formType: asString(raw.formType) || undefined,
      settings: isRecord(raw.settings)
        ? (raw.settings as TeleformFormSettings)
        : undefined,
      sections: sortByOrder(sections),
      fieldCount: sections.reduce((sum, s) => sum + s.fields.length, 0),
    };
  }

  if (isRecord(raw)) {
    const aster = normalizeAsterMdPages(raw);
    if (aster) return aster;
  }

  return { sections: [], fieldCount: 0 };
}
