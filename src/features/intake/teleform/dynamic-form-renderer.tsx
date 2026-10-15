"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { shouldRenderPage } from "@/features/intake/teleform/conditions";
import { DynamicPageRenderer } from "@/features/intake/teleform/dynamic-page-renderer";
import { normalizeTeleformJson } from "@/features/intake/teleform/normalize-teleform";
import { getFormThemeStyle } from "@/features/intake/teleform/styles";
import { validateFields } from "@/features/intake/teleform/validation";
import { DEFAULT_PHONE_COUNTRY_ISO } from "@/features/intake/data/country-dial-codes";
import { phoneCountryIsoKey } from "@/features/intake/teleform/field-meta";
import {
  isAnswerField,
  type NormalizedTeleform,
  type NormalizedTeleformField,
  type TeleformValues,
} from "@/features/intake/teleform/types";
import { cn } from "@/lib/utils/cn";

export type DynamicFormRendererProps = {
  /** Raw AsterMD teleform JSON or already-normalized schema. */
  formDefinition?: unknown | NormalizedTeleform;
  /** @deprecated Prefer formDefinition */
  schema?: unknown | NormalizedTeleform;
  initialValues?: TeleformValues;
  className?: string;
  onChange?: (values: TeleformValues) => void;
  onPageChange?: (pageIndex: number, pageCount: number) => void;
  onValidationError?: (errors: Record<string, string>) => void;
  onSubmit?: (
    values: TeleformValues,
    metadata: { formId?: string; version?: number; title?: string },
  ) => void;
  /** @deprecated Prefer onSubmit */
  onComplete?: (values: TeleformValues) => void;
  /** When false, skip rendering formName/title inside the card (page owns the heading). */
  showFormTitle?: boolean;
};

function emptyValues(form: NormalizedTeleform): TeleformValues {
  const values: TeleformValues = {};
  for (const section of form.sections) {
    for (const field of section.fields) {
      if (!isAnswerField(field)) continue;
      if (field.type === "checkbox" || field.type === "terms") {
        values[field.name] = false;
      } else if (
        field.type === "checkbox_group" ||
        (field.type === "choice_multi" && field.meta?.multiSelect)
      ) {
        values[field.name] = [];
      } else if (field.type === "bmi") {
        const unit =
          field.meta?.bmiSubfields?.find((s) => s.name === "unit")
            ?.defaultValue || "Imperial (lbs/inches)";
        values[field.name] = { unit, height: "", weight: "" };
      } else {
        values[field.name] = "";
        if (field.type === "tel" || field.type === "phone") {
          values[phoneCountryIsoKey(field.name)] = DEFAULT_PHONE_COUNTRY_ISO;
        }
      }
    }
  }
  return values;
}

function buttonLabel(field: NormalizedTeleformField, fallback: string) {
  return field.label?.trim() || fallback;
}

function focusFirstError(errors: Record<string, string>, fields: NormalizedTeleformField[]) {
  const firstName = fields.find((field) => errors[field.name])?.name;
  if (!firstName) return;
  const field = fields.find((item) => item.name === firstName);
  const el = field
    ? document.getElementById(field.id)
    : document.querySelector(`[name="${firstName}"]`);
  if (el && "focus" in el) {
    (el as HTMLElement).focus();
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

/**
 * Schema-driven multi-step form renderer.
 * AsterMD form JSON is the presentation source of truth.
 */
export function DynamicFormRenderer({
  formDefinition,
  schema,
  initialValues,
  className,
  onChange,
  onPageChange,
  onValidationError,
  onSubmit,
  onComplete,
  showFormTitle = true,
}: DynamicFormRendererProps) {
  const form = useMemo(
    () => normalizeTeleformJson(formDefinition ?? schema),
    [formDefinition, schema],
  );

  const [pageIndex, setPageIndex] = useState(0);
  const [values, setValues] = useState<TeleformValues>(() => ({
    ...emptyValues(form),
    ...initialValues,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const visiblePages = useMemo(
    () => form.sections.filter((page) => shouldRenderPage(page, values)),
    [form.sections, values],
  );

  const safePageIndex = Math.min(
    pageIndex,
    Math.max(visiblePages.length - 1, 0),
  );
  const page = visiblePages[safePageIndex];
  const pageCount = visiblePages.length;

  const navButtons = (page?.fields ?? []).filter((f) => f.type === "button");
  const hasSchemaButtons = navButtons.length > 0;
  const nextButton =
    navButtons.find((b) => b.meta?.buttonAction === "next_page") ||
    navButtons.find((b) => /next|continue|submit/i.test(b.label));

  const updateValues = (next: TeleformValues) => {
    setValues(next);
    onChange?.(next);
  };

  const onFieldChange = (name: string, value: TeleformValues[string]) => {
    updateValues({ ...values, [name]: value });
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const goToPage = (index: number) => {
    const clamped = Math.max(0, Math.min(index, pageCount - 1));
    setPageIndex(clamped);
    onPageChange?.(clamped, pageCount);
  };

  const handleButtonAction = (action: string | undefined) => {
    const normalized = (action || "").toLowerCase().replace(/[\s-]+/g, "_");
    if (
      normalized === "previous_page" ||
      normalized === "previouspage" ||
      normalized === "back" ||
      normalized === "prev"
    ) {
      setErrors({});
      goToPage(safePageIndex - 1);
      return;
    }
    if (
      normalized === "next_page" ||
      normalized === "nextpage" ||
      normalized === "next" ||
      normalized === "continue" ||
      normalized === "submit" ||
      !normalized
    ) {
      // Last page Next often has schema action "none" but still means finish.
      goNext(normalized === "submit" || safePageIndex >= pageCount - 1);
      return;
    }
    if (normalized === "none") return;

    if (process.env.NODE_ENV === "development") {
      console.warn(`[teleform] Unknown buttonAction: ${action}`);
    }
  };

  const goNext = (forceSubmit = false) => {
    if (!page) return;
    const answerFields = page.fields.filter(isAnswerField);
    const nextErrors = validateFields(answerFields, values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      onValidationError?.(nextErrors);
      focusFirstError(nextErrors, answerFields);
      return;
    }

    const isLast = forceSubmit || safePageIndex >= pageCount - 1;
    if (isLast) {
      const metadata = {
        formId: form.formId,
        version: form.version,
        title: form.title,
      };
      onSubmit?.(values, metadata);
      onComplete?.(values);
      // Parent owns navigation when onSubmit is provided (e.g. → information page).
      if (!onSubmit) setDone(true);
      return;
    }
    goToPage(safePageIndex + 1);
  };

  const goBack = () => {
    handleButtonAction("previous_page");
  };

  if (!pageCount || !page) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
        No teleform pages to render.
      </p>
    );
  }

  const submitLabel =
    form.settings?.submitButtonText ||
    (nextButton ? buttonLabel(nextButton, "Submit") : "Submit");
  const accentColor = form.settings?.accentColor || "var(--primary)";

  return (
    <div
      className={cn("space-y-6 rounded-2xl", className)}
      style={getFormThemeStyle(form.settings)}
    >
      {showFormTitle && form.title ? (
        <div>
          <h2 className="text-xl font-semibold text-foreground">{form.title}</h2>
          {form.description ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {form.description}
            </p>
          ) : null}
        </div>
      ) : null}

      <DynamicPageRenderer
        fields={page.fields}
        values={values}
        errors={errors}
        pageIndex={safePageIndex}
        pageCount={pageCount}
        accentColor={accentColor}
        onChange={onFieldChange}
        onButtonAction={handleButtonAction}
      />

      {done && form.settings?.successMessage ? (
        <p
          className="rounded-xl border border-success/20 bg-success-muted px-4 py-3 text-sm text-success"
          role="status"
        >
          {form.settings.successMessage}
        </p>
      ) : done ? (
        <p
          className="rounded-xl border border-success/20 bg-success-muted px-4 py-3 text-sm text-success"
          role="status"
        >
          Intake answers captured. Submit API will be wired next.
        </p>
      ) : null}

      {/* Fallback chrome only when the schema page has no button fields. */}
      {!hasSchemaButtons ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          <div>
            {safePageIndex > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                style={{
                  borderColor: accentColor,
                  color: accentColor,
                }}
              >
                ← Back
              </Button>
            ) : (
              <span />
            )}
          </div>
          <Button
            type="button"
            onClick={() =>
              handleButtonAction(
                safePageIndex >= pageCount - 1 ? "submit" : "next_page",
              )
            }
            style={{
              backgroundColor: accentColor,
              borderColor: accentColor,
              color: "#fff",
            }}
          >
            {safePageIndex >= pageCount - 1 ? submitLabel : "Next step →"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/** Backward-compatible alias used by earlier intake wiring. */
export function AsterMdFormBuilder(
  props: DynamicFormRendererProps & { schema?: unknown },
) {
  return <DynamicFormRenderer {...props} formDefinition={props.formDefinition ?? props.schema} />;
}
