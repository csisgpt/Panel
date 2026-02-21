"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AttachmentViewer } from "@/components/kit/files/attachment-viewer";
import { StickyFormFooter } from "@/components/kit/forms/sticky-form-footer";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ConfirmActionDialog } from "@/components/kit/dialogs/confirm-action-dialog";
import { confirmAllocationReceipt, listMyAllocationsAsReceiver } from "@/lib/api/p2p";
import type { P2PAllocation } from "@/lib/contracts/p2p";
import { formatMoney } from "@/lib/format/money";

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

export default function TraderReceiverPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<P2PAllocation | null>(null);
  const [decision, setDecision] = useState<"confirm" | "dispute">("confirm");
  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const columns: ColumnDef<P2PAllocation>[] = useMemo(
    () => [
      { id: "id", header: "شناسه", cell: ({ row }) => row.original.id },
      { id: "amount", header: "مبلغ", cell: ({ row }) => formatMoney(row.original.amount) },
      { id: "status", header: "وضعیت", cell: ({ row }) => row.original.status },
    ],
    []
  );

  const submit = async () => {
    if (!selected || !selected.actions?.canConfirmReceived) return;
    await confirmAllocationReceipt(selected.id, {
      confirmed: decision === "confirm",
      reason: decision === "dispute" ? reason : undefined,
    });
    await qc.invalidateQueries({ queryKey: ["p2p", "allocations", "receiver"] });
    setOpen(false);
  };

  return (
    <div className="space-y-4 pb-24">
      <ServerTableView<P2PAllocation>
        title="دریافت‌های P2P"
        storageKey="trader.p2p.receiver"
        columns={columns}
        queryKeyFactory={(params) => ["p2p", "allocations", "receiver", params]}
        queryFn={listMyAllocationsAsReceiver}
        defaultParams={{ page: 1, limit: 10 }}
        rowActions={(row) =>
          row.actions?.canConfirmReceived ? (
            <Button
              size="sm"
              onClick={() => {
                setSelected(row);
                setReason("");
                setDecision("confirm");
                setOpen(true);
              }}
            >
              تأیید دریافت
            </Button>
          ) : null
        }
      />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>تأیید دریافت</SheetTitle>
          </SheetHeader>

          {selected ? (
            <div className="space-y-4 text-sm">
              <div className="rounded-2xl border p-4">
                <p>وضعیت: {selected.status}</p>
                <p>مبلغ: {formatMoney(selected.amount)}</p>
                <p>پرداخت‌کننده: {selected.payer?.displayName ?? selected.payerName ?? "-"} - {selected.payer?.mobile ?? selected.payerMobile ?? "-"}</p>
                <p>تاریخ پرداخت: {formatPersianDateTime(selected.payment?.paidAt ?? selected.paidAt)}</p>
                <p>شناسه پیگیری: {selected.payment?.bankRef ?? selected.bankRef ?? "-"}</p>
                <p>روش: {selected.payment?.method ?? selected.paymentMethod ?? "-"}</p>
              </div>

              <AttachmentViewer files={selected.attachments ?? []} />
              <p className="text-xs text-muted-foreground">
                در صورت صحیح بودن اطلاعات پرداخت، گزینه تأیید را بزنید. در غیر این صورت اعتراض ثبت کنید.
              </p>

              <div className="flex flex-wrap gap-2">
                <Button variant={decision === "confirm" ? "default" : "outline"} onClick={() => setDecision("confirm")}>
                  تأیید دریافت
                </Button>
                <Button variant={decision === "dispute" ? "default" : "outline"} onClick={() => setDecision("dispute")}>
                  اعتراض
                </Button>
              </div>

              {decision === "dispute" ? (
                <div className="space-y-2">
                  <label>علت اعتراض</label>
                  <Textarea value={reason} onChange={(event) => setReason(event.target.value)} />
                  <p className="text-xs text-muted-foreground">حداقل ۱۰ کاراکتر وارد کنید.</p>
                </div>
              ) : null}
            </div>
          ) : null}

          <StickyFormFooter className="-mx-6">
            <div className="flex justify-end">
              <Button onClick={() => setConfirmOpen(true)} disabled={decision === "dispute" && reason.trim().length < 10}>
                ثبت
              </Button>
            </div>
          </StickyFormFooter>
        </SheetContent>
      </Sheet>

      <ConfirmActionDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={decision === "confirm" ? "تأیید دریافت" : "ثبت اعتراض"}
        description={decision === "confirm" ? "آیا دریافت پرداخت را تأیید می‌کنید؟" : "آیا از ثبت اعتراض مطمئن هستید؟"}
        onConfirm={submit}
      />

    </div>
  );
}
