import * as React from "react";
import { cn } from "@/lib/utils";
import type { AttachmentItem } from "./use-attachment-gallery";

export interface AttachmentStripProps extends React.HTMLAttributes<HTMLDivElement> {
  items: AttachmentItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
}

export function AttachmentStrip({ items, activeId, onSelect, className, ...props }: AttachmentStripProps) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto", className)} {...props}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect?.(item.id)}
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-lg border bg-muted text-xs",
            activeId === item.id ? "border-primary" : "border-border"
          )}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}
