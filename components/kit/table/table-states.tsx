import { Skeleton } from "@/components/ui/skeleton";

export function TableStates({
  isLoading,
  isEmpty,
  error,
}: {
  isLoading?: boolean;
  isEmpty?: boolean;
  error?: string | null;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }
  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }
  if (isEmpty) {
    return <p className="text-sm text-muted-foreground">داده‌ای یافت نشد.</p>;
  }
  return null;
}
