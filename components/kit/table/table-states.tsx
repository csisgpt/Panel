import type { ApiError } from "@/lib/contracts/errors";
import { EmptyState } from "@/components/kit/common/EmptyState";
import { ErrorState } from "@/components/kit/common/ErrorState";
import { LoadingState } from "@/components/kit/common/LoadingState";

/**
 * @deprecated Use LoadingState/EmptyState/ErrorState directly.
 */
export function TableStates({
  isLoading,
  isEmpty,
  error,
}: {
  isLoading?: boolean;
  isEmpty?: boolean;
  error?: ApiError | string | null;
}) {
  if (isLoading) {
    return <LoadingState />;
  }
  if (error) {
    return <ErrorState description={typeof error === "string" ? error : undefined} error={typeof error === "string" ? null : error} />;
  }
  if (isEmpty) {
    return <EmptyState />;
  }
  return null;
}
