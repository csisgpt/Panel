import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface AppliedFilter {
  key: string;
  label: string;
  value: string;
}

export interface AppliedFiltersBarProps extends React.HTMLAttributes<HTMLDivElement> {
  filters: AppliedFilter[];
  onRemove?: (key: string) => void;
  onClear?: () => void;
}

export function AppliedFiltersBar({ filters, onRemove, onClear, className, ...props }: AppliedFiltersBarProps) {
  if (!filters.length) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-xs text-muted-foreground", className)} {...props}>
      <span>فیلترهای اعمال‌شده:</span>
      {filters.map((filter) => (
        <Badge key={filter.key} variant="secondary" className="gap-2">
          <span>{filter.label}: {filter.value}</span>
          {onRemove ? (
            <Button type="button" variant="ghost" size="sm" className="h-5 px-1 text-xs" onClick={() => onRemove(filter.key)}>
              حذف
            </Button>
          ) : null}
        </Badge>
      ))}
      {onClear ? (
        <Button type="button" variant="ghost" size="sm" className="h-5 px-2 text-xs" onClick={onClear}>
          پاک کردن همه
        </Button>
      ) : null}
    </div>
  );
}
