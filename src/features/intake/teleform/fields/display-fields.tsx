import Image from "next/image";
import type { NormalizedTeleformField } from "@/features/intake/teleform/types";
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
  const src = field.meta?.imageUrl;
  if (!src) return null;

  // Huge base64 assets: cap display size for performance.
  const isData = src.startsWith("data:");
  return (
    <div className="sm:col-span-2 overflow-hidden rounded-2xl border border-border bg-muted">
      {isData ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={field.label || "Form image"}
          className="mx-auto max-h-56 w-auto object-contain"
        />
      ) : (
        <div className="relative mx-auto h-56 w-full max-w-md">
          <Image
            src={src}
            alt={field.label || "Form image"}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      )}
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
