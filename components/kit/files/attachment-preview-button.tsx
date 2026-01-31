"use client";

import { Button } from "@/components/ui/button";

export function AttachmentPreviewButton({ onClick, label = "مشاهده" }: { onClick: () => void; label?: string }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      {label}
    </Button>
  );
}
