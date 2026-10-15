export { DynamicFormRenderer, AsterMdFormBuilder } from "@/features/intake/teleform/dynamic-form-renderer";
export type { DynamicFormRendererProps } from "@/features/intake/teleform/dynamic-form-renderer";
export { DynamicPageRenderer } from "@/features/intake/teleform/dynamic-page-renderer";
export { DynamicFieldRenderer } from "@/features/intake/teleform/dynamic-field-renderer";
export { normalizeTeleformJson, mapFieldType } from "@/features/intake/teleform/normalize-teleform";
export { parseImageSources } from "@/features/intake/teleform/parse-image-sources";
export { normalizeOptions } from "@/features/intake/teleform/options";
export { shouldRenderField, shouldRenderPage } from "@/features/intake/teleform/conditions";
export { validateField, validateFields } from "@/features/intake/teleform/validation";
export { fieldRegistry } from "@/features/intake/teleform/registry";
export {
  INTAKE_DRAFT_KEY,
  INTAKE_DRAFT_TTL_MS,
  clearIntakeDraft,
  getIntakeDraft,
  isIntakeDraftExpired,
  mergeIntakePrefill,
  saveIntakeDraft,
} from "@/features/intake/teleform/intake-draft-storage";
export type { IntakeDraftRecord } from "@/features/intake/teleform/intake-draft-storage";
export type {
  NormalizedTeleform,
  NormalizedTeleformField,
  TeleformValues,
  TeleformFieldType,
} from "@/features/intake/teleform/types";
