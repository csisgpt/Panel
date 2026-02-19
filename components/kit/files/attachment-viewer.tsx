"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFileLinksBatch } from "@/lib/api/files";
import type { FileMeta } from "@/lib/types/backend";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function AttachmentViewer({ files }: { files: FileMeta[] }) {
  const [active, setActive] = useState<FileMeta | null>(null);
  const ids = useMemo(() => files.map((f) => f.id), [files]);
  const linksQuery = useQuery({
    queryKey: ["file-links", ids],
    queryFn: () => getFileLinksBatch(ids),
    enabled: ids.length > 0,
  });

  if (!files.length) return <p className="text-sm text-muted-foreground">فایلی وجود ندارد.</p>;
  if (linksQuery.isError) return <p className="text-sm text-destructive">خطا در دریافت فایل‌ها</p>;

  const linkMap = new Map((linksQuery.data ?? []).map((item) => [item.id, item]));

  return (
    <>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {files.map((file) => {
          const link = linkMap.get(file.id);
          return (
            <div key={file.id} className="rounded-lg border p-3 text-sm">
              <p className="truncate font-medium">{file.fileName}</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setActive(file)} disabled={!link?.previewUrl}>پیش‌نمایش</Button>
                <Button size="sm" variant="outline" asChild disabled={!link?.downloadUrl}><a href={link?.downloadUrl ?? "#"} target="_blank">دانلود</a></Button>
              </div>
            </div>
          );
        })}
      </div>
      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{active?.fileName}</DialogTitle></DialogHeader>
          {active ? (
            active.mimeType.includes("image") ? <img src={linkMap.get(active.id)?.previewUrl} alt={active.fileName} className="max-h-[70vh] w-full object-contain" /> :
            <iframe src={linkMap.get(active.id)?.previewUrl} className="h-[70vh] w-full" />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
