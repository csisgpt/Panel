import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/kit/ops/copy-button";

/**
 * Shared empty state block with optional action and trace id copy.
 */
export function EmptyState({
  title = "داده‌ای یافت نشد",
  description,
  actionLabel,
  onAction,
  traceId,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  traceId?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-card px-6 py-8 text-center">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {actionLabel && onAction ? (
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
        {traceId ? <CopyButton value={traceId} label="کپی شناسه پیگیری" /> : null}
      </div>
    </div>
  );
}
