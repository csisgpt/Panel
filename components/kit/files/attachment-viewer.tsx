"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFileLinksBatch } from "@/lib/api/files";
import { apiGetBlob } from "@/lib/api/client";
import type { FileMeta } from "@/lib/types/backend";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingState } from "@/components/kit/common/LoadingState";
import { ErrorState } from "@/components/kit/common/ErrorState";
import { useFileObjectUrl } from "@/components/kit/files/data/use-file-object-url";
import { ImageViewer } from "@/components/kit/files/viewers/image-viewer";
import { PdfViewer } from "@/components/kit/files/viewers/pdf-viewer";
import { toast } from "@/hooks/use-toast";

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

export function AttachmentViewer({ files }: { files: FileMeta[] }) {
  const [active, setActive] = useState<FileMeta | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const ids = useMemo(() => files.map((f) => f.id), [files]);
  const linksQuery = useQuery({
    queryKey: ["file-links", ids],
    queryFn: () => getFileLinksBatch(ids),
    enabled: ids.length > 0,
  });

  const linkMap = useMemo(() => new Map((linksQuery.data ?? []).map((item) => [item.id, item])), [linksQuery.data]);
  const activeLink = active ? linkMap.get(active.id) : undefined;
  const shouldUseDirectPreview = activeLink?.method === "presigned";

  const objectPreview = useFileObjectUrl({
    url: activeLink?.previewUrl,
    enabled: Boolean(active && activeLink?.previewUrl && !shouldUseDirectPreview),
    cacheKey: active?.id ?? "",
  });

  const previewSrc = shouldUseDirectPreview ? activeLink?.previewUrl : objectPreview.objectUrl;

  const handleDownload = async (file: FileMeta) => {
    const link = linkMap.get(file.id);
    if (!link?.downloadUrl) return;
    try {
      setDownloadingId(file.id);
      const blob = await apiGetBlob(link.downloadUrl);
      triggerDownload(blob, file.fileName);
      toast({ title: "دانلود فایل انجام شد", variant: "success" } as any);
    } catch {
      toast({ title: "خطا در دانلود فایل", variant: "destructive" } as any);
    } finally {
      setDownloadingId(null);
    }
  };

  if (!files.length) return <p className="text-sm text-muted-foreground">فایلی وجود ندارد.</p>;
  if (linksQuery.isError) return <p className="text-sm text-destructive">خطا در دریافت لینک فایل‌ها</p>;

  return (
    <>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {files.map((file) => {
          const link = linkMap.get(file.id);
          return (
            <div key={file.id} className="rounded-lg border p-3 text-sm">
              <p className="truncate font-medium">{file.fileName}</p>
              <p className="text-xs text-muted-foreground mt-1">{file.mimeType} | {file.sizeBytes} bytes</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setActive(file)} disabled={!link?.previewUrl}>پیش‌نمایش</Button>
                <Button size="sm" variant="outline" onClick={() => handleDownload(file)} disabled={!link?.downloadUrl || downloadingId === file.id}>
                  {downloadingId === file.id ? "در حال دانلود..." : "دانلود"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{active?.fileName}</DialogTitle></DialogHeader>
          {active ? (
            objectPreview.error ? (
              <ErrorState description={objectPreview.error} onAction={objectPreview.refetch} actionLabel="تلاش مجدد" />
            ) : objectPreview.isLoading && !shouldUseDirectPreview ? (
              <div>
                <p className="mb-2 text-sm text-muted-foreground">در حال دریافت فایل…</p>
                <LoadingState lines={4} />
              </div>
            ) : previewSrc ? (
              active.mimeType.includes("image") ? (
                <ImageViewer src={previewSrc} alt={active.fileName} />
              ) : (
                <PdfViewer src={previewSrc} />
              )
            ) : (
              <ErrorState description="لینک پیش‌نمایش فایل در دسترس نیست." onAction={objectPreview.refetch} actionLabel="تلاش مجدد" />
            )
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
