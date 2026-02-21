"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StickyFormFooter } from "@/components/kit/forms/sticky-form-footer";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { ConfirmActionDialog } from "@/components/kit/dialogs/confirm-action-dialog";
import { AdminAllocationDetailsSheet } from "@/components/kit/p2p/admin-allocation-details-sheet";
import { P2PActionsMenu } from "@/components/kit/p2p/p2p-actions-menu";
import { cancelAllocation, finalizeAllocation, verifyAllocation } from "@/lib/api/p2p";
import type { P2PAllocation } from "@/lib/contracts/p2p";
import { createAdminP2PAllocationsListConfig } from "@/lib/screens/admin/p2p-allocations.list";
import { copyToClipboard } from "@/lib/copy";

type PendingAction = { type: "finalize" | "cancel" | "verify"; allocationId?: string } | null;

export default function AdminP2PAllocationsPage() {
  const config = useMemo(() => createAdminP2PAllocationsListConfig(), []);
  const qc = useQueryClient();
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState<P2PAllocation | null>(null);
  const [approved, setApproved] = useState(true);
  const [note, setNote] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const submitVerify = async () => {
    if (!selected || !selected.actions?.canAdminVerify) return;
    await verifyAllocation(selected.id, { approved, note: note || undefined });
    await qc.invalidateQueries({ queryKey: ["admin", "p2p", "allocations"] });
    setPendingAction(null);
    setVerifyOpen(false);
    setDetailsOpen(false);
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
          <P2PActionsMenu
            actions={[
              {
                key: "details",
                label: "جزئیات",
                onClick: () => {
                  setSelected(row);
                  setDetailsOpen(true);
                },
              },
              {
                key: "verify",
                label: "بررسی",
                onClick: () => {
                  setSelected(row);
                  setApproved(true);
                  setNote("");
                  setVerifyOpen(true);
                },
                disabled: !row.actions?.canAdminVerify,
                disabledReason: row.allowedActions?.find((a) => a.key === "ADMIN_VERIFY")?.reasonDisabled,
              },
              {
                key: "finalize",
                label: "نهایی‌سازی",
                onClick: () => setPendingAction({ type: "finalize", allocationId: row.id }),
                disabled: !row.actions?.canFinalize,
                disabledReason: row.allowedActions?.find((a) => a.key === "FINALIZE")?.reasonDisabled,
              },
              {
                key: "cancel",
                label: "لغو",
                destructive: true,
                onClick: () => setPendingAction({ type: "cancel", allocationId: row.id }),
                disabled: !row.actions?.canCancel,
                disabledReason: row.allowedActions?.find((a) => a.key === "CANCEL")?.reasonDisabled,
              },
              {
                key: "copy-code",
                label: "کپی کد تخصیص",
                onClick: () => copyToClipboard(row.paymentCode ?? ""),
                disabled: !row.paymentCode,
              },
            ]}
          />
        )}
      />

      <Sheet open={verifyOpen} onOpenChange={setVerifyOpen}>
        <SheetContent side="right" className="w-full sm:max-w-3xl">
          <SheetHeader>
            <SheetTitle>بررسی تخصیص</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 text-sm">
            <p>برای بررسی تخصیص یادداشت اختیاری ثبت کنید.</p>
            <div className="flex gap-2">
              <Button variant={approved ? "default" : "outline"} onClick={() => setApproved(true)}>تأیید</Button>
              <Button variant={!approved ? "default" : "outline"} onClick={() => setApproved(false)}>رد</Button>
            </div>
            <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="یادداشت" />
          </div>

          <StickyFormFooter className="-mx-6">
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setVerifyOpen(false)}>انصراف</Button>
              <Button disabled={!selected?.actions?.canAdminVerify} onClick={() => setPendingAction({ type: "verify" })}>ثبت</Button>
            </div>
          </StickyFormFooter>
        </SheetContent>
      </Sheet>

      <AdminAllocationDetailsSheet
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        allocation={selected}
        onVerify={selected?.actions?.canAdminVerify ? () => setVerifyOpen(true) : undefined}
        onFinalize={selected?.actions?.canFinalize ? () => setPendingAction({ type: "finalize", allocationId: selected.id }) : undefined}
        onCancel={selected?.actions?.canCancel ? () => setPendingAction({ type: "cancel", allocationId: selected.id }) : undefined}
      />

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
