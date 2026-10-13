import type {
  NormalizedTeleform,
  NormalizedTeleformField,
  NormalizedTeleformSection,
  TeleformBmiSubfield,
  TeleformFieldType,
  TeleformOption,
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

function mapFieldType(raw: string): TeleformFieldType {
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

function readOptionsFromProperties(
  properties: Record<string, unknown> | undefined,
): TeleformOption[] {
  if (!properties) return [];
  const raw = properties.options;
  if (!Array.isArray(raw)) return [];

  const out: TeleformOption[] = [];
  for (const item of raw) {
    if (typeof item === "string" || typeof item === "number") {
      const value = String(item);
      out.push({ value, label: value });
      continue;
    }
    if (!isRecord(item)) continue;
    const value = asString(item.value ?? item.id ?? item.key ?? item.label);
    const label = asString(item.label ?? item.text ?? item.title ?? value);
    if (!value) continue;
    out.push({ value, label: label || value });
  }
  return out;
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
      options: readOptionsFromProperties(props),
      defaultValue: asString(props?.defaultValue) || undefined,
      min:
        typeof validation?.minValue === "number"
          ? validation.minValue
          : undefined,
      max:
        typeof validation?.maxValue === "number"
          ? validation.maxValue
          : undefined,
    };
  });
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
  const required = Boolean(
    node.required === true ||
      (isRecord(node.validation) && node.validation.required === true),
  );
  const options = readOptionsFromProperties(properties);
  const multiSelect = properties?.multiSelect === true;

  const fullWidth =
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
    properties?.headingFullWidth === true ||
    properties?.cols === 1;

  return {
    id,
    name,
    label,
    type,
    required,
    placeholder: asString(node.placeholder) || undefined,
    options: options.length ? options : undefined,
    rawType,
    fullWidth,
    meta: {
      buttonAction: asString(properties?.buttonAction) || undefined,
      buttonColor: asString(properties?.buttonColor) || undefined,
      buttonTextColor: asString(properties?.buttonTextColor) || undefined,
      multiSelect,
      paragraphContent: asString(properties?.paragraphContent) || undefined,
      paragraphAlign: asString(properties?.paragraphAlign) || undefined,
      // Preserve raw imageUrl (may contain multiple data URLs); do not trim
      // mid-string newlines — asString only trims ends.
      imageUrl:
        typeof properties?.imageUrl === "string"
          ? properties.imageUrl
          : asString(properties?.imageUrl) || undefined,
      imageWidth: asNumber(properties?.imageWidth),
      imageHeight: asNumber(properties?.imageHeight),
      imageItemWidths: asNumberArray(properties?.imageItemWidths),
      imageItemHeights: asNumberArray(properties?.imageItemHeights),
      imageGap: asNumber(properties?.imageGap),
      imageFlexWrap: asString(properties?.imageFlexWrap) || undefined,
      imageJustifyContent:
        asString(properties?.imageJustifyContent) || undefined,
      imageResizeMode: asString(properties?.imageResizeMode) || undefined,
      imageHeading: asString(properties?.imageHeading) || undefined,
      imageSubheading: asString(properties?.imageSubheading) || undefined,
      termsText: asString(properties?.termsText) || undefined,
      termsLinks: readTermsLinks(properties),
      headingFullWidth: properties?.headingFullWidth === true,
      titleColor: asString(properties?.titleColor) || undefined,
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
    },
  };
}

/**
 * Primary path: AsterMD teleform builder JSON
 * `{ formName, pages: [{ pageId, title, fields: [...] }] }`
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

    // Sort by order when present.
    fields.sort((a, b) => {
      const ao = fieldsRaw.findIndex(
        (f) => isRecord(f) && asString(f.name) === a.name,
      );
      const bo = fieldsRaw.findIndex(
        (f) => isRecord(f) && asString(f.name) === b.name,
      );
      const aOrder =
        isRecord(fieldsRaw[ao]) && typeof fieldsRaw[ao].order === "number"
          ? (fieldsRaw[ao].order as number)
          : ao;
      const bOrder =
        isRecord(fieldsRaw[bo]) && typeof fieldsRaw[bo].order === "number"
          ? (fieldsRaw[bo].order as number)
          : bo;
      return aOrder - bOrder;
    });

    sections.push({
      id: asString(page.pageId ?? page.id, `section_${pageIndex}`),
      title: asString(page.title, `Page ${pageIndex + 1}`),
      description: asString(page.description) || undefined,
      fields,
    });
  });

  if (!sections.length) return null;

  return {
    title: asString(raw.formName ?? raw.title) || undefined,
    description: asString(raw.description) || undefined,
    sections,
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
      fields: Array.isArray(section.fields)
        ? section.fields.filter(isRecord).map((field, fieldIndex) => {
            const rawType = asString(field.rawType ?? field.type, "text");
            return {
              id: asString(field.id, `field_${fieldIndex}`),
              name: asString(field.name, `field_${fieldIndex}`),
              label: asString(field.label, asString(field.name)),
              type: mapFieldType(rawType),
              required: field.required === true,
              placeholder: asString(field.placeholder) || undefined,
              description: asString(field.description) || undefined,
              options: Array.isArray(field.options)
                ? (field.options as TeleformOption[])
                : undefined,
              rawType,
              fullWidth: field.fullWidth === true,
              meta: isRecord(field.meta) ? (field.meta as NormalizedTeleformField["meta"]) : undefined,
            } satisfies NormalizedTeleformField;
          })
        : [],
    }));
    // If sections came from old normalize without options, prefer empty — caller should pass raw formJson.
    return {
      title: asString(raw.title) || undefined,
      description: asString(raw.description) || undefined,
      sections,
      fieldCount: sections.reduce((sum, s) => sum + s.fields.length, 0),
    };
  }

  if (isRecord(raw)) {
    const aster = normalizeAsterMdPages(raw);
    if (aster) return aster;
  }

  return { sections: [], fieldCount: 0 };
}
