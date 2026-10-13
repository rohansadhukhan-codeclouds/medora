"use client";

import { useMemo } from "react";
import type { NormalizedTeleformField } from "@/features/intake/teleform/types";
import { fieldLayoutClass } from "@/features/intake/teleform/layout";
import { parseImageSources } from "@/features/intake/teleform/parse-image-sources";
import {
  getHeadingStyles,
  getParagraphStyles,
} from "@/features/intake/teleform/styles";
import { cn } from "@/lib/utils/cn";

export function HeadingBlock({ field }: { field: NormalizedTeleformField }) {
  return (
    <div
      className={cn(
        fieldLayoutClass(field.meta?.cols, true),
        "rounded-xl px-4 py-3",
        field.meta?.headingFullWidth && "w-full",
      )}
      style={getHeadingStyles(field)}
    >
      <h3 className="text-base font-bold tracking-wide sm:text-lg">
        {field.label}
      </h3>
    </div>
  );
}

export function ParagraphBlock({ field }: { field: NormalizedTeleformField }) {
  const content = field.meta?.paragraphContent || field.description || "";
  if (!content) return null;
  return (
    <p
      className={cn(
        fieldLayoutClass(field.meta?.cols, true),
        "text-sm leading-relaxed text-muted-foreground",
      )}
      style={getParagraphStyles(field)}
    >
      {content}
    </p>
  );
}

export function ImageBlock({ field }: { field: NormalizedTeleformField }) {
  const meta = field.meta;
  const imageSources = useMemo(
    () => parseImageSources(meta?.imageUrl),
    [meta?.imageUrl],
  );
  if (!imageSources.length) return null;

  const heading = meta?.imageHeading?.trim();
  const subheading = meta?.imageSubheading?.trim();
  const objectFit =
    meta?.imageResizeMode === "cover" ? ("cover" as const) : ("contain" as const);
  const altBase = meta?.imageAlt?.trim() || heading || field.label || "Image";

  return (
    <div className={cn(fieldLayoutClass(meta?.cols, true), "space-y-2")}>
      {heading ? (
        <p className="text-sm font-semibold text-foreground">{heading}</p>
      ) : null}
      {subheading ? (
        <p className="text-sm text-muted-foreground">{subheading}</p>
      ) : null}
      <div
        className="overflow-hidden rounded-2xl border border-border bg-muted p-3"
        style={{
          display: "flex",
          flexDirection:
            meta?.imageFlexDirection === "column" ? "column" : "row",
          flexWrap: (meta?.imageFlexWrap as "wrap" | "nowrap") || "wrap",
          justifyContent: meta?.imageJustifyContent || "center",
          alignItems: meta?.imageAlignItems || "center",
          gap: meta?.imageGap ?? 10,
        }}
      >
        {imageSources.map((src, index) => {
          const width =
            meta?.imageItemWidths?.[index] ?? meta?.imageWidth ?? 100;
          const height =
            meta?.imageItemHeights?.[index] ?? meta?.imageHeight ?? 100;

          return (
            // Native <img> for inline data URLs (AVIF/PNG/etc.)
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${field.id || "image"}-${index}`}
              src={src}
              alt={`${altBase} ${index + 1}`}
              style={{
                width: meta?.imageFullWidth ? "100%" : width,
                height: meta?.imageFullHeight ? "100%" : height,
                objectFit,
                flexShrink: 0,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function headerJustify(
  align?: string,
): "flex-start" | "center" | "flex-end" {
  if (align === "left" || align === "flex-start" || align === "start") {
    return "flex-start";
  }
  if (align === "right" || align === "flex-end" || align === "end") {
    return "flex-end";
  }
  return "center";
}

export function FormHeaderBlock({ field }: { field: NormalizedTeleformField }) {
  const meta = field.meta;
  const mode = (meta?.formHeaderMode || "logo").toLowerCase();
  const logoSources = useMemo(
    () => parseImageSources(meta?.formHeaderLogoUrl),
    [meta?.formHeaderLogoUrl],
  );
  const logoSrc = logoSources[0];
  const text = meta?.formHeaderText?.trim();
  const genericLabel =
    !field.label?.trim() || /^form\s*header$/i.test(field.label.trim());

  const showLogo =
    Boolean(logoSrc) &&
    (mode === "logo" || mode === "both" || mode === "image");
  const showText =
    Boolean(text) &&
    (mode === "text" || mode === "both" || (!showLogo && Boolean(text)));

  if (!showLogo && !showText && genericLabel) return null;

  return (
    <div
      className={cn(
        fieldLayoutClass(meta?.cols, true),
        "flex w-full items-center px-3",
        meta?.formHeaderShadow && "shadow-sm",
        !meta?.formHeaderBackgroundColor && "border-b border-border",
      )}
      style={{
        backgroundColor: meta?.formHeaderBackgroundColor || undefined,
        minHeight: meta?.formHeaderHeight ?? 68,
        justifyContent: headerJustify(meta?.formHeaderAlign),
      }}
    >
      {showLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoSrc}
          alt={meta?.formHeaderLogoAlt || text || field.label || "Form logo"}
          style={{
            width: meta?.formHeaderLogoWidth ?? 180,
            height: meta?.formHeaderLogoHeight ?? 44,
            objectFit: "contain",
          }}
        />
      ) : null}
      {showText ? (
        <span
          className="font-semibold tracking-wide"
          style={{
            color: meta?.formHeaderTextColor || undefined,
            fontSize: meta?.formHeaderTextSize
              ? `${meta.formHeaderTextSize}px`
              : undefined,
            marginLeft: showLogo ? 12 : undefined,
          }}
        >
          {text}
        </span>
      ) : !showLogo && !genericLabel ? (
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          {field.label}
        </p>
      ) : null}
    </div>
  );
}

export function FormProgressBlock({
  field,
  current,
  total,
}: {
  field?: NormalizedTeleformField;
  current: number;
  total: number;
}) {
  const meta = field?.meta;
  const safeTotal = Math.max(total, 1);
  const percent = Math.round(((current + 1) / safeTotal) * 100);
  const showMeta = meta?.progressShowMeta !== false;
  const barColor = meta?.progressColor || "var(--primary)";
  const mode = (meta?.progressDisplayMode || "percentage").toLowerCase();

  return (
    <div
      className={cn(
        fieldLayoutClass(meta?.cols, true),
        "space-y-2 rounded-xl px-3 py-2",
        meta?.progressShowBorder && "border border-border",
      )}
      style={{
        backgroundColor: meta?.fieldBackgroundColor || undefined,
      }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label={`Form progress ${percent}%`}
    >
      {showMeta ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {mode === "steps" || mode === "step"
              ? `Step ${current + 1} of ${safeTotal}`
              : "Progress"}
          </span>
          <span className="font-medium text-foreground">
            {mode === "steps" || mode === "step"
              ? `${current + 1}/${safeTotal}`
              : `${percent}%`}
          </span>
        </div>
      ) : null}
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-[var(--motion-normal)]"
          style={{ width: `${percent}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}
