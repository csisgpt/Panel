"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { FileLink, FileMeta } from "@/lib/types/backend";
import { useFileLinks } from "./data/use-file-links";
import { ImageViewer } from "./viewers/image-viewer";
import { PdfViewer } from "./viewers/pdf-viewer";
import { Button } from "@/components/ui/button";

export function AttachmentGalleryModal({
  open,
  onOpenChange,
  files,
  links,
  mode = "preview",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: FileMeta[];
  links?: FileLink[];
  mode?: "preview" | "download";
}) {
  const fileIds = files.map((file) => file.id);
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldFetch = !links;
  const { data = [], isLoading } = useFileLinks({ fileIds: shouldFetch ? fileIds : [], mode });
  const resolvedLinks = links ?? data;

  const activeFile = files[activeIndex];
  const activeLink = useMemo(
    () => resolvedLinks.find((link) => link.id === activeFile?.id),
    [resolvedLinks, activeFile]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>گالری پیوست‌ها</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto">
            {files.map((file, index) => (
              <Button
                key={file.id}
                variant={index === activeIndex ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveIndex(index)}
              >
                {file.fileName}
              </Button>
            ))}
          </div>
          {isLoading && !links ? (
            <p className="text-sm text-muted-foreground">در حال دریافت لینک‌ها...</p>
          ) : null}
          {activeLink?.previewUrl ? (
            activeFile?.mimeType.startsWith("image/") ? (
              <ImageViewer src={activeLink.previewUrl} alt={activeFile.fileName} />
            ) : activeFile?.mimeType === "application/pdf" ? (
              <PdfViewer src={activeLink.previewUrl} />
            ) : (
              <a className="text-sm text-primary underline" href={activeLink.previewUrl}>
                مشاهده فایل
              </a>
            )
          ) : (
            <p className="text-sm text-muted-foreground">لینکی برای نمایش موجود نیست.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
