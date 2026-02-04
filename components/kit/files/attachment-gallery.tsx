import * as React from "react";
import { cn } from "@/lib/utils";
import type { AttachmentItem } from "./use-attachment-gallery";
import { AttachmentStrip } from "./attachment-strip";

export interface AttachmentGalleryProps extends React.HTMLAttributes<HTMLDivElement> {
  items: AttachmentItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
}

export function AttachmentGallery({ items, activeId, onSelect, className, ...props }: AttachmentGalleryProps) {
  const active = items.find((item) => item.id === activeId) ?? items[0];

  return (
    <div className={cn("space-y-3", className)} {...props}>
      <div className="flex h-64 items-center justify-center rounded-xl border bg-muted/40">
        {active ? <img src={active.url} alt={active.name} className="max-h-full max-w-full object-contain" /> : null}
      </div>
      <AttachmentStrip items={items} activeId={active?.id} onSelect={onSelect} />
    </div>
  );
}
