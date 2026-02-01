"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface QuickTab {
  id: string;
  label: string;
  hint?: string;
}

/**
 * Simple quick tabs for ops buckets.
 */
export function QuickTabs({
  tabs,
  currentTabId,
  onTabChange,
  counts,
  disabled = false,
}: {
  tabs: QuickTab[];
  currentTabId?: string;
  onTabChange: (tabId: string) => void;
  counts?: Record<string, number>;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => {
        const isActive = tab.id === currentTabId;
        const count = counts?.[tab.id];
        return (
          <Button
            key={tab.id}
            type="button"
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            disabled={disabled}
          >
            <span>{tab.label}</span>
            {typeof count === "number" ? (
              <Badge variant={isActive ? "secondary" : "outline"} className="ml-2">
                {count}
              </Badge>
            ) : null}
          </Button>
        );
      })}
    </div>
  );
}
