"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
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

export type TeleformStepAdvanceInfo = {
  values: TeleformValues;
  /** 0-based page just completed */
  fromPageIndex: number;
  /** 0-based page navigating to */
  toPageIndex: number;
  pageCount: number;
  /** 1-based progress page after this step (AsterMD progress.meta) */
  progressPage: number;
};

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
  /**
   * Optional hook after a mid-form page validates, before advancing.
   * Prefer client-only use — do not call Intake Update here.
   * Return false to block navigation; awaitable.
   */
  onStepAdvance?: (
    info: TeleformStepAdvanceInfo,
  ) => boolean | void | Promise<boolean | void>;
  onSubmit?: (
    values: TeleformValues,
    metadata: {
      formId?: string;
      version?: number;
      title?: string;
      pageCount: number;
      progressPage: number;
    },
  ) => void | Promise<void>;
  /** @deprecated Prefer onSubmit */
  onComplete?: (values: TeleformValues) => void;
  /** When false, skip rendering formName/title inside the card (page owns the heading). */
  showFormTitle?: boolean;
  /** True while final Intake Update / opportunity APIs run. */
  syncing?: boolean;
  /** Status / CTA copy while syncing (e.g. Submitting…). */
  syncingLabel?: string;
};

function resolveOptionValue(
  raw: string,
  options: NormalizedTeleformField["options"],
): string {
  const trimmed = raw.trim();
  if (!trimmed || !options?.length) return trimmed;
  const exactValue = options.find((option) => option.value === trimmed);
  if (exactValue) return exactValue.value;
  const exactLabel = options.find((option) => option.label === trimmed);
  if (exactLabel) return exactLabel.value;
  const lower = trimmed.toLowerCase();
  const fuzzy = options.find(
    (option) =>
      option.value.toLowerCase() === lower ||
      option.label.toLowerCase() === lower,
  );
  return fuzzy?.value ?? trimmed;
}

/**
 * Align resume/view payloads with field shape (string vs string[]) so
 * visual prefill and required validation agree without re-selecting.
 */
function coerceInitialValues(
  form: NormalizedTeleform,
  initial: TeleformValues | undefined,
): TeleformValues {
  if (!initial || Object.keys(initial).length === 0) return {};

  const byName = new Map<string, NormalizedTeleformField>();
  for (const section of form.sections) {
    for (const field of section.fields) {
      if (isAnswerField(field)) byName.set(field.name, field);
    }
  }

  const out: TeleformValues = { ...initial };
  for (const [name, value] of Object.entries(initial)) {
    const field = byName.get(name);
    if (!field) continue;

    if (field.type === "checkbox_group") {
      const arr = Array.isArray(value)
        ? value.map(String)
        : typeof value === "string" && value
          ? [value]
          : [];
      out[name] = arr
        .map((item) => resolveOptionValue(item, field.options))
        .filter(Boolean);
      continue;
    }

    if (field.type === "choice_multi") {
      const multi = field.meta?.multiSelect === true;
      if (multi) {
        const arr = Array.isArray(value)
          ? value.map(String)
          : typeof value === "string" && value
            ? [value]
            : [];
        out[name] = arr
          .map((item) => resolveOptionValue(item, field.options))
          .filter(Boolean);
      } else {
        const raw = Array.isArray(value)
          ? String(value[0] ?? "")
          : typeof value === "string" ||
              typeof value === "number" ||
              typeof value === "boolean"
            ? String(value)
            : "";
        out[name] = resolveOptionValue(raw, field.options);
      }
    }
  }

  return out;
}

function emptyValues(form: NormalizedTeleform): TeleformValues {
  const values: TeleformValues = {};
  for (const section of form.sections) {
    for (const field of section.fields) {
      if (!isAnswerField(field)) continue;
      if (field.type === "checkbox" || field.type === "terms") {
        values[field.name] = false;
      } else if (field.type === "checkbox_group") {
        values[field.name] = [];
      } else if (field.type === "choice_multi") {
        // AsterMD choice-multi may render as radios when multiSelect is false.
        values[field.name] = field.meta?.multiSelect === true ? [] : "";
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
  onStepAdvance,
  onSubmit,
  onComplete,
  showFormTitle = true,
  syncing = false,
  syncingLabel = "Saving…",
}: DynamicFormRendererProps) {
  const form = useMemo(
    () => normalizeTeleformJson(formDefinition ?? schema),
    [formDefinition, schema],
  );

  const coercedInitial = useMemo(
    () => coerceInitialValues(form, initialValues),
    [form, initialValues],
  );

  const [pageIndex, setPageIndex] = useState(0);
  const [values, setValues] = useState<TeleformValues>(() => ({
    ...emptyValues(form),
    ...coercedInitial,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [stepBusy, setStepBusy] = useState(false);

  // Apply resume prefills after mount / when view payload arrives.
  useEffect(() => {
    if (!coercedInitial || Object.keys(coercedInitial).length === 0) return;
    setValues((prev) => ({
      ...prev,
      ...coercedInitial,
    }));
  }, [coercedInitial]);

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

  const onFieldChange = (name: string, value: TeleformValues[string]) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      onChange?.(next);
      return next;
    });
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

  const goNext = async (forceSubmit = false) => {
    if (!page || stepBusy || syncing) return;
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
        pageCount,
        progressPage: pageCount,
      };
      setStepBusy(true);
      try {
        await onSubmit?.(values, metadata);
        onComplete?.(values);
        if (!onSubmit) setDone(true);
      } finally {
        setStepBusy(false);
      }
      return;
    }

    const toPageIndex = safePageIndex + 1;
    setStepBusy(true);
    try {
      const allowed = await onStepAdvance?.({
        values,
        fromPageIndex: safePageIndex,
        toPageIndex,
        pageCount,
        progressPage: toPageIndex + 1,
      });
      if (allowed === false) return;
      goToPage(toPageIndex);
    } finally {
      setStepBusy(false);
    }
  };

  const handleButtonAction = (action: string | undefined) => {
    if (stepBusy || syncing) return;
    const normalized = (action || "").toLowerCase().replace(/[\s-]+/g, "_");
    const onLastPage = pageCount > 0 && safePageIndex >= pageCount - 1;
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
      !normalized ||
      // Last page often ships buttonAction "none" on the forward button.
      (normalized === "none" && onLastPage)
    ) {
      void goNext(normalized === "submit" || onLastPage);
      return;
    }
    if (normalized === "none") return;

    if (process.env.NODE_ENV === "development") {
      console.warn(`[teleform] Unknown buttonAction: ${action}`);
    }
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
  const navDisabled = stepBusy || syncing;
  const isLastPage = safePageIndex >= pageCount - 1;

  return (
    <div
      className={cn(
        "space-y-6 rounded-2xl",
        syncing && "pointer-events-none opacity-70",
        className,
      )}
      style={getFormThemeStyle(form.settings)}
      aria-busy={syncing || undefined}
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

      {syncing ? (
        <div
          className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground"
          role="status"
          aria-live="polite"
        >
          <Loader2
            className="h-4 w-4 shrink-0 animate-spin text-primary"
            aria-hidden="true"
          />
          <span>{syncingLabel}</span>
        </div>
      ) : null}

      <DynamicPageRenderer
        fields={page.fields}
        values={values}
        errors={errors}
        pageIndex={safePageIndex}
        pageCount={pageCount}
        accentColor={accentColor}
        navDisabled={navDisabled}
        submitLoading={syncing && isLastPage}
        submitLoadingLabel={syncingLabel}
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
                disabled={navDisabled}
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
            disabled={navDisabled}
            aria-busy={syncing && isLastPage ? true : undefined}
            onClick={() =>
              handleButtonAction(isLastPage ? "submit" : "next_page")
            }
            style={{
              backgroundColor: accentColor,
              borderColor: accentColor,
              color: "#fff",
            }}
          >
            {syncing && isLastPage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                {syncingLabel}
              </>
            ) : isLastPage ? (
              submitLabel
            ) : (
              "Next step →"
            )}
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
