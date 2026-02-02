import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shared loading skeleton for data-driven surfaces.
 */
export function LoadingState({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className="h-8 w-full" />
      ))}
    </div>
  );
}
