"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AttachmentViewer } from "@/components/kit/files/attachment-viewer";
import { StickyFormFooter } from "@/components/kit/forms/sticky-form-footer";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { ConfirmActionDialog } from "@/components/kit/dialogs/confirm-action-dialog";
import { cancelAllocation, finalizeAllocation, verifyAllocation } from "@/lib/api/p2p";
import type { P2PAllocation } from "@/lib/contracts/p2p";
import { formatMoney } from "@/lib/format/money";
import { createAdminP2PAllocationsListConfig } from "@/lib/screens/admin/p2p-allocations.list";

function formatPersianDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

type PendingAction = { type: "finalize" | "cancel" | "verify"; allocationId?: string } | null;

export default function AdminP2PAllocationsPage() {
  const config = useMemo(() => createAdminP2PAllocationsListConfig(), []);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<P2PAllocation | null>(null);
  const [approved, setApproved] = useState(true);
  const [note, setNote] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const submitVerify = async () => {
    if (!selected || !selected.actions?.canAdminVerify) return;
    await verifyAllocation(selected.id, { approved, note: note || undefined });
    await qc.invalidateQueries({ queryKey: ["admin", "p2p", "allocations"] });
    setPendingAction(null);
    setOpen(false);
  };

  const runFinalize = async (allocationId: string) => {
    await finalizeAllocation(allocationId);
    await qc.invalidateQueries({ queryKey: ["admin", "p2p", "allocations"] });
    setPendingAction(null);
  };

  const runCancel = async (allocationId: string) => {
    await cancelAllocation(allocationId);
    await qc.invalidateQueries({ queryKey: ["admin", "p2p", "allocations"] });
    setPendingAction(null);
  };

  return (
    <div className="space-y-4 pb-24">
      <ServerTableView<P2PAllocation>
        {...config}
        rowActions={(row) => (
          <div className="flex flex-wrap gap-2">
            {row.actions?.canAdminVerify ? (
              <Button
                size="sm"
                onClick={() => {
                  setSelected(row);
                  setApproved(true);
                  setNote("");
                  setOpen(true);
                }}
              >
                بررسی
              </Button>
            ) : null}

            {row.actions?.canFinalize ? (
              <Button size="sm" variant="outline" onClick={() => setPendingAction({ type: "finalize", allocationId: row.id })}>
                نهایی‌سازی
              </Button>
            ) : null}

            {row.actions?.canCancel ? (
              <Button size="sm" variant="outline" onClick={() => setPendingAction({ type: "cancel", allocationId: row.id })}>
                لغو
              </Button>
            ) : null}
          </div>
        )}
      />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-3xl">
          <SheetHeader>
            <SheetTitle>بررسی تخصیص</SheetTitle>
          </SheetHeader>

          {selected ? (
            <div className="space-y-4 text-sm">
              <div className="rounded-2xl border p-4">
                <p>مبلغ: {formatMoney(selected.amount)}</p>
                <p>وضعیت: {selected.status}</p>
                <p>پرداخت‌کننده: {selected.payerName || "-"}</p>
                <p>گیرنده: {selected.receiverName || "-"}</p>
                <p>روش: {selected.payment?.method ?? selected.paymentMethod ?? "-"}</p>
                <p>شناسه پیگیری: {selected.payment?.bankRef ?? selected.bankRef ?? "-"}</p>
                <p>تاریخ پرداخت: {formatPersianDateTime(selected.payment?.paidAt ?? selected.paidAt)}</p>
              </div>

              <AttachmentViewer files={selected.attachments ?? []} />

              <div className="flex gap-2">
                <Button variant={approved ? "default" : "outline"} onClick={() => setApproved(true)}>
                  تأیید
                </Button>
                <Button variant={!approved ? "default" : "outline"} onClick={() => setApproved(false)}>
                  رد
                </Button>
              </div>

              <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="یادداشت" />
            </div>
          ) : null}

          <StickyFormFooter className="-mx-6">
            <div className="flex justify-end">
              <Button disabled={!selected?.actions?.canAdminVerify} onClick={() => setPendingAction({ type: "verify" })}>
                ثبت
              </Button>
            </div>
          </StickyFormFooter>
        </SheetContent>
      </Sheet>

      <ConfirmActionDialog
        open={Boolean(pendingAction)}
        onOpenChange={(openState) => !openState && setPendingAction(null)}
        title="تأیید عملیات"
        description="آیا از انجام این عملیات مطمئن هستید؟"
        destructive={pendingAction?.type === "cancel"}
        onConfirm={() => {
          if (!pendingAction) return;
          if (pendingAction.type === "verify") return submitVerify();
          if (pendingAction.type === "finalize" && pendingAction.allocationId) return runFinalize(pendingAction.allocationId);
          if (pendingAction.type === "cancel" && pendingAction.allocationId) return runCancel(pendingAction.allocationId);
        }}
      />
    </div>
  );
}
