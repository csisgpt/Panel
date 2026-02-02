import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/kit/ops/copy-button";
import type { ApiError } from "@/lib/contracts/errors";

/**
 * Shared error state block with optional retry and trace id copy.
 */
export function ErrorState({
  title = "خطایی رخ داد",
  description,
  error,
  actionLabel = "تلاش مجدد",
  onAction,
}: {
  title?: string;
  description?: string;
  error?: ApiError | null;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const message = description ?? error?.message;
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-card px-6 py-8 text-center">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-destructive">{title}</p>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {onAction ? (
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
        {error?.traceId ? <CopyButton value={error.traceId} label="کپی شناسه پیگیری" /> : null}
      </div>
    </div>
  );
}
