"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { FileLink, FileMeta } from "@/lib/types/backend";
import { useFileLinks } from "./data/use-file-links";
import { ImageViewer } from "./viewers/image-viewer";
import { PdfViewer } from "./viewers/pdf-viewer";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/kit/common/ErrorState";
import { EmptyState } from "@/components/kit/common/EmptyState";

/**
 * Attachment gallery with navigation, keyboard controls, and retry handling.
 */
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
  const fileIds = useMemo(() => files.map((file) => file.id), [files]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fit, setFit] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCounts, setRetryCounts] = useState<Record<string, number>>({});

  const shouldFetch = !links;
  const { data = [], isLoading, refetch, isFetching } = useFileLinks({ fileIds: shouldFetch ? fileIds : [], mode });
  const resolvedLinks = links ?? data;

  const activeFile = files[activeIndex];
  const activeLink = useMemo(
    () => resolvedLinks.find((link) => link.id === activeFile?.id),
    [resolvedLinks, activeFile]
  );

  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < files.length - 1;

  const goPrev = useCallback(
    () => setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev)),
    []
  );
  const goNext = useCallback(
    () => setActiveIndex((prev) => (prev < files.length - 1 ? prev + 1 : prev)),
    [files.length]
  );

  useEffect(() => {
    setLoadError(null);
  }, [activeIndex]);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange, goPrev, goNext]);

  const handlePreviewError = () => {
    if (!activeFile) return;
    const count = retryCounts[activeFile.id] ?? 0;
    if (count < 1) {
      setRetryCounts((prev) => ({ ...prev, [activeFile.id]: count + 1 }));
      refetch();
      return;
    }
    setLoadError("لینک پیش‌نمایش منقضی شده است.");
  };

  const handlePreviewLoad = () => {
    setLoadError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>گالری پیوست‌ها</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
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
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setFit((prev) => !prev)}>
                {fit ? "نمایش ۱۰۰٪" : "نمایش فیت"}
              </Button>
              <Button variant="outline" size="sm" disabled={!hasPrev} onClick={goPrev}>
                قبلی
              </Button>
              <Button variant="outline" size="sm" disabled={!hasNext} onClick={goNext}>
                بعدی
              </Button>
            </div>
          </div>

          {isLoading && !links ? <p className="text-sm text-muted-foreground">در حال دریافت لینک‌ها...</p> : null}
          {isFetching && !isLoading ? (
            <p className="text-xs text-muted-foreground">در حال تازه‌سازی لینک‌ها...</p>
          ) : null}

          {loadError ? (
            <ErrorState description={loadError} onAction={() => refetch()} />
          ) : activeLink?.previewUrl ? (
            activeFile?.mimeType.startsWith("image/") ? (
              <ImageViewer src={activeLink.previewUrl} alt={activeFile.fileName} fit={fit} onError={handlePreviewError} onLoad={handlePreviewLoad} />
            ) : activeFile?.mimeType === "application/pdf" ? (
              <PdfViewer src={activeLink.previewUrl} fit={fit} onError={handlePreviewError} onLoad={handlePreviewLoad} />
            ) : (
              <a className="text-sm text-primary underline" href={activeLink.previewUrl}>
                مشاهده فایل
              </a>
            )
          ) : (
            <EmptyState description="لینکی برای نمایش موجود نیست." />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
