"use client";

import { useEffect, useMemo, useState } from "react";
import { getFiles, getAttachments } from "@/lib/api/files";
import { getUsers } from "@/lib/api/users";
import {
  Attachment,
  AttachmentEntityType,
  BackendUser,
  FileMeta,
} from "@/lib/types/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetHeader } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

function formatBytes(bytes: number) {
  if (!bytes) return "-";
  const sizes = ["بایت", "کیلوبایت", "مگابایت"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(1)} ${sizes[i]}`;
}

function entityLabel(entity: AttachmentEntityType) {
  switch (entity) {
    case AttachmentEntityType.DEPOSIT:
      return "واریز";
    case AttachmentEntityType.WITHDRAW:
      return "برداشت";
    case AttachmentEntityType.TRADE:
      return "معامله";
    default:
      return entity;
  }
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<AttachmentEntityType | "all">("all");
  const [selectedFile, setSelectedFile] = useState<FileMeta | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fileData, attachmentData, userData] = await Promise.all([
        getFiles(),
        getAttachments(),
        getUsers(),
      ]);
      setFiles(fileData);
      setAttachments(attachmentData);
      setUsers(userData);
      setError(null);
    } catch (err) {
      setError("خطا در دریافت فایل‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchSearch = file.fileName.toLowerCase().includes(search.toLowerCase());
      const matchLabel = typeFilter === "all" || file.label === typeFilter;
      const matchEntity =
        entityFilter === "all" ||
        attachments.some((a) => a.fileId === file.id && a.entityType === entityFilter);
      return matchSearch && matchLabel && matchEntity;
    });
  }, [files, search, typeFilter, entityFilter, attachments]);

  const selectedAttachments = useMemo(
    () => attachments.filter((a) => a.fileId === selectedFile?.id),
    [attachments, selectedFile?.id]
  );

  const labelOptions = useMemo(() => {
    const labels = new Set(files.map((f) => f.label).filter(Boolean) as string[]);
    return Array.from(labels);
  }, [files]);

  const findUploader = (userId: string) => users.find((u) => u.id === userId)?.fullName || "-";

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/40 bg-destructive/10">
        <CardContent className="flex items-center justify-between gap-3 p-4 text-destructive">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={loadData}>
            تلاش مجدد
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">مدیریت فایل‌ها و پیوست‌ها</h1>
        <p className="text-sm text-muted-foreground">مشاهده فایل‌های بارگذاری شده و ارتباط آنها با درخواست‌ها</p>
      </div>

      <Card className="shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap gap-3">
            <Input
              placeholder="جستجوی نام فایل"
              className="w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="نوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه نوع‌ها</SelectItem>
                {labelOptions.map((label) => (
                  <SelectItem key={label} value={label}>
                    {label}
                  </SelectItem>
                ))}
                {labelOptions.length === 0 && <SelectItem value="" disabled>بدون برچسب</SelectItem>}
              </SelectContent>
            </Select>
            <Select
              value={entityFilter}
              onValueChange={(v) => setEntityFilter(v as AttachmentEntityType | "all")}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="نوع موجودیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه موجودیت‌ها</SelectItem>
                <SelectItem value={AttachmentEntityType.DEPOSIT}>واریز</SelectItem>
                <SelectItem value={AttachmentEntityType.WITHDRAW}>برداشت</SelectItem>
                <SelectItem value={AttachmentEntityType.TRADE}>معامله</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>فایل‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>نام فایل</TableHead>
                  <TableHead>برچسب</TableHead>
                  <TableHead>حجم</TableHead>
                  <TableHead>بارگذاری توسط</TableHead>
                  <TableHead>تاریخ</TableHead>
                  <TableHead>پیوست</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => {
                  const attachmentCount = attachments.filter((a) => a.fileId === file.id).length;
                  return (
                    <TableRow
                      key={file.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedFile(file)}
                    >
                      <TableCell className="font-semibold">{file.fileName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{file.label || "بدون برچسب"}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatBytes(file.sizeBytes)}</TableCell>
                      <TableCell>{findUploader(file.uploadedById)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(file.createdAt).toLocaleString("fa-IR")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={attachmentCount ? "success" : "secondary"}>
                          {attachmentCount ? `${attachmentCount} پیوست` : "بدون پیوست"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredFiles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                      موردی یافت نشد.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b p-4">
            <div className="space-y-1">
              <h3 className="font-bold">جزئیات فایل</h3>
              <p className="text-xs text-muted-foreground">{selectedFile?.fileName}</p>
            </div>
          </SheetHeader>
          <div className="flex-1 space-y-4 overflow-y-auto p-4 text-sm">
            {selectedFile && (
              <div className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">برچسب</span>
                  <Badge variant="secondary">{selectedFile.label || "بدون برچسب"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">حجم</span>
                  <span className="font-semibold">{formatBytes(selectedFile.sizeBytes)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">آپلودر</span>
                  <span>{findUploader(selectedFile.uploadedById)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">تاریخ</span>
                  <span>{new Date(selectedFile.createdAt).toLocaleString("fa-IR")}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">پیوست‌ها</h4>
                <Badge variant="outline">{selectedAttachments.length}</Badge>
              </div>
              {selectedAttachments.length === 0 && (
                <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                  پیوستی برای این فایل ثبت نشده است.
                </div>
              )}
              <div className="space-y-2">
                {selectedAttachments.map((att) => (
                  <div key={att.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{entityLabel(att.entityType)}</div>
                      <Badge variant="secondary">{att.entityId}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{att.purpose || "بدون توضیح"}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
