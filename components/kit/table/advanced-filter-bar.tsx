import * as React from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
  accordionLabel?: string;
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
  accordionLabel = "بیشتر",
  className,
  ...props
}: AdvancedFilterBarProps) {
  return (
    <div className={cn("space-y-3 rounded-xl border bg-card p-4", className)} {...props}>
      <div className="flex flex-wrap items-center gap-2">
        {primaryFilters}
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
      {secondaryFilters ? (
        <Accordion
          type="single"
          collapsible
          value={collapsed ? undefined : "advanced"}
          onValueChange={(value) => {
            if (!onToggleSecondary) return;
            onToggleSecondary();
          }}
        >
          <AccordionItem value="advanced" className="border-none">
            <AccordionTrigger className="py-0 text-sm">
              {accordionLabel} {secondaryCount > 0 ? `(+${secondaryCount})` : ""}
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2 pt-3">{secondaryFilters}</div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : null}
    </div>
  );
}
