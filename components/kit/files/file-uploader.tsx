"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadFile } from "@/lib/api/files";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE_MB = 8;
const ACCEPTED_TYPES = ["image/", "application/pdf"];

type UploadEntry = {
  id: string;
  file: File;
  progress: number;
  status: "idle" | "uploading" | "done" | "error";
  error?: string;
  uploadedId?: string;
};

function formatBytes(bytes: number) {
  if (bytes === 0) return "0B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)}${sizes[i]}`;
}

export function FileUploader({
  maxFiles,
  accept,
  label = "آپلود فایل",
  onUploaded,
}: {
  maxFiles: number;
  accept: string;
  label?: string;
  onUploaded: (fileIds: string[]) => void;
}) {
  const [items, setItems] = useState<UploadEntry[]>([]);

  const uploadedIds = useMemo(() => items.flatMap((item) => (item.uploadedId ? [item.uploadedId] : [])), [items]);

  const updateItem = useCallback((id: string, patch: Partial<UploadEntry>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      const nextFiles = Array.from(files).slice(0, maxFiles - items.length);
      const prepared: UploadEntry[] = nextFiles.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(16).slice(2)}`,
        file,
        progress: 0,
        status: "idle",
      }));

      setItems((prev) => [...prev, ...prepared]);

      for (const entry of prepared) {
        const sizeMb = entry.file.size / (1024 * 1024);
        if (sizeMb > MAX_FILE_SIZE_MB) {
          updateItem(entry.id, { status: "error", error: "حجم فایل بیشتر از حد مجاز است." });
          continue;
        }
        const isAccepted = ACCEPTED_TYPES.some((type) => entry.file.type.startsWith(type));
        if (!isAccepted) {
          updateItem(entry.id, { status: "error", error: "نوع فایل مجاز نیست." });
          continue;
        }
        updateItem(entry.id, { status: "uploading", progress: 10 });
        let progress = 10;
        const interval = window.setInterval(() => {
          progress = Math.min(progress + 15, 90);
          updateItem(entry.id, { progress });
        }, 250);
        try {
          const uploaded = await uploadFile(entry.file, label);
          window.clearInterval(interval);
          updateItem(entry.id, { status: "done", progress: 100, uploadedId: uploaded.id });
        } catch (error) {
          window.clearInterval(interval);
          updateItem(entry.id, { status: "error", error: "آپلود ناموفق بود." });
        }
      }
    },
    [items.length, label, maxFiles, updateItem]
  );

  const canAddMore = items.length < maxFiles;

  useEffect(() => {
    onUploaded(uploadedIds);
  }, [uploadedIds, onUploaded]);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex flex-col gap-2 rounded-lg border border-dashed p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            فرمت‌های مجاز: {accept} • حداکثر {maxFiles} فایل • تا {MAX_FILE_SIZE_MB}MB
          </div>
          <Button type="button" variant="outline" size="sm" disabled={!canAddMore} asChild>
            <label className={cn("flex cursor-pointer items-center gap-2", !canAddMore && "cursor-not-allowed opacity-70")}>
              <Upload className="h-4 w-4" />
              انتخاب فایل
              <Input
                type="file"
                accept={accept}
                multiple={maxFiles > 1}
                onChange={(event) => handleFiles(event.target.files)}
                className="hidden"
                disabled={!canAddMore}
              />
            </label>
          </Button>
        </div>
        {items.length ? (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="rounded-md border px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{item.file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(item.file.size)}</p>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemove(item.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2">
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-2 rounded-full",
                        item.status === "error" ? "bg-destructive" : "bg-primary"
                      )}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {item.status === "uploading"
                        ? "در حال آپلود..."
                        : item.status === "done"
                        ? "آپلود شد"
                        : item.status === "error"
                        ? item.error
                        : "در انتظار"}
                    </span>
                    <span>{item.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">فایلی انتخاب نشده است.</p>
        )}
      </div>
      {uploadedIds.length ? (
        <p className="text-xs text-muted-foreground">فایل‌ها به درخواست اضافه شدند.</p>
      ) : null}
    </div>
  );
}
