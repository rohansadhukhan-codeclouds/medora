import type { NormalizedTeleformField } from "@/features/intake/teleform/types";
import { parseImageSources } from "@/features/intake/teleform/parse-image-sources";
import { cn } from "@/lib/utils/cn";

export function HeadingBlock({ field }: { field: NormalizedTeleformField }) {
  return (
    <div
      className={cn(
        "sm:col-span-2 rounded-xl px-4 py-3",
        field.meta?.headingFullWidth && "w-full",
      )}
      style={{
        backgroundColor: field.meta?.fieldBackgroundColor || "var(--primary)",
        color: field.meta?.titleColor || "#fff",
      }}
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
      className="sm:col-span-2 text-sm leading-relaxed text-muted-foreground"
      style={{
        textAlign: (field.meta?.paragraphAlign as "left" | "center" | "right") || "left",
      }}
    >
      {content}
    </p>
  );
}

export function ImageBlock({ field }: { field: NormalizedTeleformField }) {
  const meta = field.meta;
  const imageSources = parseImageSources(meta?.imageUrl);
  if (!imageSources.length) return null;

  const heading = meta?.imageHeading?.trim();
  const subheading = meta?.imageSubheading?.trim();
  const objectFit =
    meta?.imageResizeMode === "cover" ? ("cover" as const) : ("contain" as const);

  return (
    <div className="sm:col-span-2 space-y-2">
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
          flexWrap: (meta?.imageFlexWrap as "wrap" | "nowrap") || "wrap",
          justifyContent: meta?.imageJustifyContent || "center",
          gap: meta?.imageGap ?? 10,
          alignItems: "center",
        }}
      >
        {imageSources.map((src, index) => {
          const width =
            meta?.imageItemWidths?.[index] ?? meta?.imageWidth ?? 100;
          const height =
            meta?.imageItemHeights?.[index] ?? meta?.imageHeight ?? 100;
          const alt = heading
            ? `${heading} ${index + 1}`
            : field.label
              ? `${field.label} ${index + 1}`
              : `Image ${index + 1}`;

          return (
            // Native <img>: AsterMD often supplies inline data: URLs (incl. AVIF).
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${field.id || "image"}-${index}`}
              src={src}
              alt={alt}
              style={{
                width,
                height,
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

export function FormHeaderBlock({ field }: { field: NormalizedTeleformField }) {
  return (
    <div className="sm:col-span-2 border-b border-border pb-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        {field.label || "Intake"}
      </p>
    </div>
  );
}

export function FormProgressBlock({
  current,
  total,
}: {
  field?: NormalizedTeleformField;
  current: number;
  total: number;
}) {
  const safeTotal = Math.max(total, 1);
  const percent = Math.round(((current + 1) / safeTotal) * 100);
  return (
    <div className="sm:col-span-2 space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Step {current + 1} of {safeTotal}
        </span>
        <span className="font-medium text-foreground">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-[var(--motion-normal)]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
