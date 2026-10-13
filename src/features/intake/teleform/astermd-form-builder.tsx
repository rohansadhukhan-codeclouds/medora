"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldRenderer } from "@/features/intake/teleform/field-renderer";
import { normalizeTeleformJson } from "@/features/intake/teleform/normalize-teleform";
import type {
  NormalizedTeleform,
  NormalizedTeleformField,
  TeleformValues,
} from "@/features/intake/teleform/types";
import { cn } from "@/lib/utils/cn";

type AsterMdFormBuilderProps = {
  /** Raw AsterMD teleform JSON or already-normalized schema. */
  schema: unknown | NormalizedTeleform;
  className?: string;
  onComplete?: (values: TeleformValues) => void;
};

function isInputField(field: NormalizedTeleformField): boolean {
  return ![
    "button",
    "heading",
    "paragraph",
    "image",
    "form_progress",
    "form_header",
    "content",
  ].includes(field.type);
}

function emptyValues(form: NormalizedTeleform): TeleformValues {
  const values: TeleformValues = {};
  for (const section of form.sections) {
    for (const field of section.fields) {
      if (!isInputField(field)) continue;
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
      }
    }
  }
  return values;
}

function buttonLabel(field: NormalizedTeleformField, fallback: string) {
  return field.label?.trim() || fallback;
}

/**
 * Reusable AsterMD FormBuilder.
 * Pass teleform JSON → multi-page form UI with BACK / NEXT handling.
 */
export function AsterMdFormBuilder({
  schema,
  className,
  onComplete,
}: AsterMdFormBuilderProps) {
  const form = useMemo(() => normalizeTeleformJson(schema), [schema]);
  const [pageIndex, setPageIndex] = useState(0);
  const [values, setValues] = useState<TeleformValues>(() => emptyValues(form));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const page = form.sections[pageIndex];
  const pageCount = form.sections.length;

  const navButtons = (page?.fields ?? []).filter((f) => f.type === "button");
  const contentFields = (page?.fields ?? []).filter((f) => f.type !== "button");

  const backButton =
    navButtons.find((b) => b.meta?.buttonAction === "previous_page") ||
    navButtons.find((b) => /back/i.test(b.label));
  const nextButton =
    navButtons.find((b) => b.meta?.buttonAction === "next_page") ||
    navButtons.find((b) => /next|continue|submit/i.test(b.label));

  const onChange = (name: string, value: TeleformValues[string]) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validatePage = () => {
    if (!page) return true;
    const next: Record<string, string> = {};
    for (const field of page.fields) {
      if (!field.required || !isInputField(field)) continue;
      const value = values[field.name];
      const missing =
        value === undefined ||
        value === "" ||
        value === false ||
        (Array.isArray(value) && value.length === 0) ||
        (field.type === "bmi" &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          (!value.height || !value.weight));
      if (missing) next[field.name] = "This field is required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validatePage()) return;
    if (pageIndex >= pageCount - 1) {
      setDone(true);
      onComplete?.(values);
      console.log("[intake] AsterMdFormBuilder complete", values);
      return;
    }
    setPageIndex((index) => Math.min(index + 1, pageCount - 1));
  };

  const goBack = () => {
    setErrors({});
    setPageIndex((index) => Math.max(index - 1, 0));
  };

  if (!pageCount || !page) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
        No teleform pages to render.
      </p>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {form.title ? (
        <div>
          <h2 className="text-xl font-semibold text-foreground">{form.title}</h2>
          {form.description ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {form.description}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {contentFields.map((field) => (
          <FieldRenderer
            key={field.id}
            field={field}
            values={values}
            error={errors[field.name]}
            pageIndex={pageIndex}
            pageCount={pageCount}
            onChange={onChange}
          />
        ))}
      </div>

      {done ? (
        <p
          className="rounded-xl border border-success/20 bg-success-muted px-4 py-3 text-sm text-success"
          role="status"
        >
          Intake answers captured locally. Submit API will be wired next.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        <div>
          {pageIndex > 0 || backButton ? (
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={pageIndex === 0}
              style={
                backButton?.meta?.buttonColor
                  ? {
                      borderColor: backButton.meta.buttonColor,
                      color: backButton.meta.buttonColor,
                    }
                  : undefined
              }
            >
              {backButton
                ? buttonLabel(backButton, "← Back")
                : "← Back"}
            </Button>
          ) : (
            <span />
          )}
        </div>
        <Button
          type="button"
          onClick={goNext}
          style={
            nextButton?.meta?.buttonColor
              ? {
                  backgroundColor: nextButton.meta.buttonColor,
                  color: nextButton.meta.buttonTextColor || "#fff",
                }
              : undefined
          }
        >
          {pageIndex >= pageCount - 1
            ? nextButton
              ? buttonLabel(nextButton, "Submit")
              : "Submit"
            : nextButton
              ? buttonLabel(nextButton, "Next step →")
              : "Next step →"}
        </Button>
      </div>
    </div>
  );
}
