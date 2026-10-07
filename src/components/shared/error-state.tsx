import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-start gap-3 rounded-xl border border-destructive/20 bg-destructive-muted p-6",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-5 w-5" aria-hidden="true" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-foreground/80">{message}</p>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
