"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/kit/ops/status-badge";
import { ConfirmDialog } from "@/components/kit/ops/confirm-dialog";
import { AttachmentGalleryModal } from "@/components/kit/files/attachment-gallery-modal";
import { AttachmentPreviewButton } from "@/components/kit/files/attachment-preview-button";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { createAdminP2PAllocationsListConfig } from "@/lib/screens/admin/p2p-allocations.list";
import { finalizeAllocation, verifyAllocation } from "@/lib/api/p2p";
import type { P2PAllocation } from "@/lib/contracts/p2p";
import { hasPermission } from "@/lib/contracts/permissions";
import { useToast } from "@/hooks/use-toast";

export default function AdminP2PAllocationsPage() {
  const config = useMemo(() => createAdminP2PAllocationsListConfig(), []);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selected, setSelected] = useState<P2PAllocation | null>(null);
  const [approved, setApproved] = useState(true);
  const [note, setNote] = useState("");

  const columns = config.columns as ColumnDef<P2PAllocation>[];

  const handleVerify = async () => {
    if (!selected) return;
    try {
      await verifyAllocation(selected.id, { approved, note: note || undefined });
      toast({ title: "بررسی ثبت شد" });
      queryClient.invalidateQueries({ queryKey: ["admin", "p2p", "allocations"] });
      setVerifyOpen(false);
      setSelected(null);
      setNote("");
    } catch (error) {
      toast({ title: "خطا", description: "ثبت بررسی ناموفق بود", variant: "destructive" });
    }
  };

  const handleFinalize = async (allocationId: string) => {
    try {
      await finalizeAllocation(allocationId);
      toast({ title: "نهایی شد" });
      queryClient.invalidateQueries({ queryKey: ["admin", "p2p", "allocations"] });
    } catch (error) {
      toast({ title: "خطا", description: "نهایی‌سازی ناموفق بود", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <ServerTableView<P2PAllocation>
        {...config}
        columns={columns}
        renderCard={(row) => (
          <div className="rounded-lg border p-4 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">مبلغ: {row.amount}</p>
                <p className="text-xs text-muted-foreground">پرداخت‌کننده: {row.payerName ?? "-"}</p>
                <p className="text-xs text-muted-foreground">گیرنده: {row.receiverName ?? "-"}</p>
              </div>
              <StatusBadge status={row.status} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => {
                setSelected(row);
                setDetailsOpen(true);
              }}>
                جزئیات
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!hasPermission(row.actions ?? {}, "canAdminVerify")}
                onClick={() => {
                  setSelected(row);
                  setVerifyOpen(true);
                }}
              >
                بررسی
              </Button>
              {hasPermission(row.actions ?? {}, "canFinalize") ? (
                <ConfirmDialog
                  triggerLabel="نهایی‌سازی"
                  title="نهایی‌سازی تخصیص"
                  description="پس از نهایی‌سازی امکان ویرایش وجود ندارد."
                  onConfirm={() => handleFinalize(row.id)}
                />
              ) : (
                <Button size="sm" variant="outline" disabled>
                  نهایی‌سازی
                </Button>
              )}
            </div>
          </div>
        )}
        rowActions={(row) => (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => {
              setSelected(row);
              setDetailsOpen(true);
            }}>
              جزئیات
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!hasPermission(row.actions ?? {}, "canAdminVerify")}
              onClick={() => {
                setSelected(row);
                setVerifyOpen(true);
              }}
            >
              بررسی
            </Button>
            {hasPermission(row.actions ?? {}, "canFinalize") ? (
              <ConfirmDialog
                triggerLabel="نهایی‌سازی"
                title="نهایی‌سازی تخصیص"
                description="پس از نهایی‌سازی امکان ویرایش وجود ندارد."
                onConfirm={() => handleFinalize(row.id)}
              />
            ) : (
              <Button size="sm" variant="outline" disabled>
                نهایی‌سازی
              </Button>
            )}
          </div>
        )}
      />

      <Sheet open={verifyOpen} onOpenChange={setVerifyOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-4 sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>بررسی تخصیص</SheetTitle>
          </SheetHeader>
          <div className="space-y-2">
            <label className="text-sm">نتیجه</label>
            <div className="flex gap-2">
              <Button type="button" variant={approved ? "default" : "outline"} onClick={() => setApproved(true)}>
                تایید
              </Button>
              <Button type="button" variant={!approved ? "default" : "outline"} onClick={() => setApproved(false)}>
                رد
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm">یادداشت</label>
            <Input value={note} onChange={(event) => setNote(event.target.value)} />
          </div>
          <SheetFooter className="mt-auto">
            <Button onClick={handleVerify}>ثبت بررسی</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-4 sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>جزئیات تخصیص</SheetTitle>
          </SheetHeader>
          {selected ? (
            <div className="space-y-3 text-sm">
              <p>شناسه: {selected.id}</p>
              <p>مبلغ: {selected.amount}</p>
              <p>وضعیت: <StatusBadge status={selected.status} /></p>
              {selected.attachments?.length ? (
                <div className="space-y-2">
                  <AttachmentPreviewButton onClick={() => setGalleryOpen(true)} label="مشاهده پیوست‌ها" />
                  <AttachmentGalleryModal open={galleryOpen} onOpenChange={setGalleryOpen} files={selected.attachments} />
                </div>
              ) : (
                <p className="text-muted-foreground">فایل ضمیمه ندارد.</p>
              )}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
