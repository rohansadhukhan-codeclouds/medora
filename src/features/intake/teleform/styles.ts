import type { CSSProperties } from "react";
import type { NormalizedTeleformField } from "@/features/intake/teleform/types";

function isCssColor(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length < 64;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Whitelist-only style mapper — never spread raw API properties into style.
 */
export function getHeadingStyles(
  field: NormalizedTeleformField,
): CSSProperties {
  const meta = field.meta;
  const style: CSSProperties = {};
  if (isCssColor(meta?.fieldBackgroundColor)) {
    style.backgroundColor = meta.fieldBackgroundColor;
  } else {
    style.backgroundColor = "var(--primary)";
  }
  if (isCssColor(meta?.titleColor)) {
    style.color = meta.titleColor;
  } else {
    style.color = "#fff";
  }
  if (isFiniteNumber(meta?.headingBorderRadius)) {
    style.borderRadius = meta.headingBorderRadius;
  }
  if (isFiniteNumber(meta?.titleFontSize)) {
    style.fontSize = meta.titleFontSize;
  }
  return style;
}

export function getParagraphStyles(
  field: NormalizedTeleformField,
): CSSProperties {
  const meta = field.meta;
  const style: CSSProperties = {};
  const align = meta?.paragraphAlign;
  if (align === "left" || align === "center" || align === "right") {
    style.textAlign = align;
  }
  if (isFiniteNumber(meta?.paragraphFontSize)) {
    style.fontSize = meta.paragraphFontSize;
  }
  if (isCssColor(meta?.paragraphTextColor)) {
    style.color = meta.paragraphTextColor;
  }
  return style;
}

export function getFormThemeStyle(settings?: {
  backgroundColor?: string;
  pageColor?: string;
  accentColor?: string;
}): CSSProperties {
  const style: CSSProperties = {};
  if (isCssColor(settings?.backgroundColor)) {
    style.backgroundColor = settings.backgroundColor;
  } else if (isCssColor(settings?.pageColor)) {
    style.backgroundColor = settings.pageColor;
  }
  if (isCssColor(settings?.accentColor)) {
    (style as CSSProperties & { ["--teleform-accent"]?: string })[
      "--teleform-accent"
    ] = settings.accentColor;
  }
  return style;
}
