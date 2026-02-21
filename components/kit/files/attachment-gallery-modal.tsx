"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import { Thumbs } from "swiper/modules";
import { FileText, ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { FileLink, FileMeta } from "@/lib/types/backend";
import { useFileLinks } from "./data/use-file-links";
import { ImageViewer } from "./viewers/image-viewer";
import { PdfViewer } from "./viewers/pdf-viewer";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/kit/common/ErrorState";
import { EmptyState } from "@/components/kit/common/EmptyState";
import { LoadingState } from "@/components/kit/common/LoadingState";
import { useFileObjectUrl } from "./data/use-file-object-url";
import { apiGetBlob } from "@/lib/api/client";
import { toast } from "@/hooks/use-toast";
import "swiper/css";
import "swiper/css/thumbs";

function triggerDownload(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

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
  const [zoom, setZoom] = useState(1);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCounts, setRetryCounts] = useState<Record<string, number>>({});
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [downloading, setDownloading] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const mainSwiperRef = useRef<SwiperClass | null>(null);

  const shouldFetch = !links;
  const { data = [], isLoading, refetch, isFetching } = useFileLinks({ fileIds: shouldFetch ? fileIds : [], mode });
  const resolvedLinks = links ?? data;

  const activeFile = files[activeIndex];
  const activeLink = useMemo(
    () => resolvedLinks.find((link: FileLink) => link.id === activeFile?.id),
    [resolvedLinks, activeFile]
  );

  const shouldUseDirectPreview = activeLink?.method === "presigned";
  const activeObjectPreview = useFileObjectUrl({
    url: activeLink?.previewUrl,
    enabled: Boolean(open && activeFile && activeLink?.previewUrl && !shouldUseDirectPreview),
    cacheKey: activeFile?.id ?? "",
  });

  const activePreviewSrc = shouldUseDirectPreview ? activeLink?.previewUrl : activeObjectPreview.objectUrl;

  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < files.length - 1;

  const goPrev = useCallback(() => {
    if (mainSwiperRef.current) {
      mainSwiperRef.current.slidePrev();
      return;
    }
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);
  const goNext = useCallback(() => {
    if (mainSwiperRef.current) {
      mainSwiperRef.current.slideNext();
      return;
    }
    setActiveIndex((prev) => (prev < files.length - 1 ? prev + 1 : prev));
  }, [files.length]);

  useEffect(() => {
    setLoadError(null);
    setZoom(1);
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
      if (!shouldUseDirectPreview) {
        activeObjectPreview.refetch();
      } else {
        refetch();
      }
      return;
    }
    setLoadError("لینک پیش‌نمایش منقضی شده است.");
  };

  const handlePreviewLoad = () => {
    setLoadError(null);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const diff = touchStartX.current - endX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  const handleDownload = async () => {
    if (!activeFile || !activeLink?.downloadUrl) return;
    try {
      setDownloading(true);
      if (activeLink.method === "presigned") {
        window.open(activeLink.downloadUrl, "_blank", "noopener,noreferrer");
      } else {
        const blob = await apiGetBlob(activeLink.downloadUrl);
        triggerDownload(blob, activeFile.fileName);
      }
      toast({ title: "دانلود فایل انجام شد", variant: "success" } as any);
    } catch {
      toast({ title: "خطا در دانلود فایل", variant: "destructive" } as any);
    } finally {
      setDownloading(false);
    }
  };

  const canZoomIn = zoom < 3;
  const canZoomOut = zoom > 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>گالری پیوست‌ها</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">{activeFile?.fileName ?? "فایل"}</p>
              <Button size="sm" variant="outline" onClick={handleDownload} disabled={!activeLink?.downloadUrl || downloading}>
                {downloading ? "در حال دانلود..." : "دانلود فایل"}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {activeFile?.mimeType?.startsWith("image/") ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setZoom(1)} disabled={zoom === 1}>
                    ۱۰۰٪
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setZoom((prev) => Math.min(prev + 0.5, 3))} disabled={!canZoomIn}>
                    بزرگ‌نمایی
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setZoom((prev) => Math.max(prev - 0.5, 1))} disabled={!canZoomOut}>
                    کوچک‌نمایی
                  </Button>
                </>
              ) : null}
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
          {isFetching && !isLoading ? <p className="text-xs text-muted-foreground">در حال تازه‌سازی لینک‌ها...</p> : null}

          {files.length === 0 ? (
            <EmptyState description="فایلی برای نمایش وجود ندارد." />
          ) : loadError ? (
            <ErrorState description={loadError} onAction={() => (shouldUseDirectPreview ? refetch() : activeObjectPreview.refetch())} />
          ) : (
            <div className="space-y-3">
              <Swiper
                modules={[Thumbs]}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                onSwiper={(swiper) => {
                  mainSwiperRef.current = swiper;
                }}
                onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="rounded-md"
              >
                {files.map((file, index) => {
                  const link = resolvedLinks.find((item: FileLink) => item.id === file.id);
                  const isImage = file.mimeType?.startsWith("image/");
                  const isPdf = file.mimeType === "application/pdf";
                  const isActiveSlide = index === activeIndex;
                  const slideSrc = isActiveSlide
                    ? activePreviewSrc
                    : link?.method === "presigned"
                      ? link.previewUrl
                      : undefined;

                  return (
                    <SwiperSlide key={file.id} className="rounded-md">
                      {isActiveSlide && activeObjectPreview.isLoading && !shouldUseDirectPreview ? (
                        <div>
                          <p className="mb-2 text-sm text-muted-foreground">در حال دریافت فایل…</p>
                          <LoadingState lines={4} />
                        </div>
                      ) : activeObjectPreview.error && isActiveSlide ? (
                        <ErrorState description={activeObjectPreview.error} onAction={activeObjectPreview.refetch} actionLabel="تلاش مجدد" />
                      ) : slideSrc ? (
                        isImage ? (
                          <ImageViewer
                            src={slideSrc}
                            alt={file.fileName}
                            fit={fit}
                            zoom={zoom}
                            onError={handlePreviewError}
                            onLoad={handlePreviewLoad}
                          />
                        ) : isPdf ? (
                          <PdfViewer src={slideSrc} fit={fit} onError={handlePreviewError} onLoad={handlePreviewLoad} />
                        ) : (
                          <Button variant="outline" onClick={handleDownload}>دانلود / مشاهده فایل</Button>
                        )
                      ) : (
                        <EmptyState description="در حال دریافت فایل…" />
                      )}
                    </SwiperSlide>
                  );
                })}
              </Swiper>

              <Swiper
                slidesPerView="auto"
                spaceBetween={8}
                watchSlidesProgress
                onSwiper={setThumbsSwiper}
              >
                {files.map((file, index) => {
                  const isImage = file.mimeType?.startsWith("image/");
                  const isActive = index === activeIndex;
                  return (
                    <SwiperSlide key={file.id} className="!w-20">
                      <button
                        type="button"
                        onClick={() => mainSwiperRef.current?.slideTo(index)}
                        className={[
                          "flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border bg-muted/60 text-[10px]",
                          isActive ? "border-primary" : "border-border",
                        ].join(" ")}
                      >
                        {isImage ? (
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="mt-1 line-clamp-2 text-center">{file.fileName}</span>
                      </button>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
