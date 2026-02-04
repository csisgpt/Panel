import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AdvancedFilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  primaryFilters?: React.ReactNode;
  secondaryFilters?: React.ReactNode;
  secondaryCount?: number;
  collapsed?: boolean;
  onToggleSecondary?: () => void;
  onReset?: () => void;
  onApply?: () => void;
  autoApply?: boolean;
}

export function AdvancedFilterBar({
  primaryFilters,
  secondaryFilters,
  secondaryCount = 0,
  collapsed = true,
  onToggleSecondary,
  onReset,
  onApply,
  autoApply = true,
  className,
  ...props
}: AdvancedFilterBarProps) {
  return (
    <div className={cn("space-y-3 rounded-xl border bg-card p-4", className)} {...props}>
      <div className="flex flex-wrap items-center gap-2">
        {primaryFilters}
        {secondaryFilters ? (
          <Button type="button" variant="ghost" size="sm" onClick={onToggleSecondary}>
            فیلترهای بیشتر {secondaryCount > 0 ? `(+${secondaryCount})` : ""}
          </Button>
        ) : null}
        {onReset ? (
          <Button type="button" variant="outline" size="sm" onClick={onReset}>
            بازنشانی
          </Button>
        ) : null}
        {!autoApply && onApply ? (
          <Button type="button" size="sm" onClick={onApply}>
            اعمال
          </Button>
        ) : null}
      </div>
      {!collapsed && secondaryFilters ? <div className="flex flex-wrap gap-2">{secondaryFilters}</div> : null}
    </div>
  );
}
