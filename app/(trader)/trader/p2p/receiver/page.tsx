"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/kit/ops/status-badge";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { listMyAllocationsAsReceiver, confirmAllocationReceipt } from "@/lib/api/p2p";
import type { P2PAllocation } from "@/lib/contracts/p2p";
import { useToast } from "@/hooks/use-toast";
import { hasPermission } from "@/lib/contracts/permissions";

const disputeReasons = [
  { value: "NOT_RECEIVED", label: "نرسیده" },
  { value: "LESS_AMOUNT", label: "مبلغ کم" },
  { value: "UNCLEAR", label: "نامشخص" },
];

export default function TraderReceiverPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<P2PAllocation | null>(null);
  const [decision, setDecision] = useState<"confirm" | "dispute">("confirm");
  const [reason, setReason] = useState("");

  const columns: ColumnDef<P2PAllocation>[] = [
    { id: "createdAt", header: "تاریخ", cell: ({ row }: { row: { original: P2PAllocation } }) => row.original.createdAt },
    { id: "amount", header: "مبلغ", cell: ({ row }: { row: { original: P2PAllocation } }) => row.original.amount },
    { id: "payer", header: "پرداخت‌کننده", cell: ({ row }: { row: { original: P2PAllocation } }) => row.original.payerName ?? "-" },
    { id: "status", header: "وضعیت", cell: ({ row }: { row: { original: P2PAllocation } }) => <StatusBadge status={row.original.status} /> },
  ];

  const tabs = [
    { id: "pending", label: "منتظر تایید من", paramsPatch: { filters: { status: "PROOF_SUBMITTED" } } },
    { id: "disputed", label: "اختلاف‌ها", paramsPatch: { filters: { status: "DISPUTED" } } },
    { id: "confirmed", label: "تایید شده", paramsPatch: { filters: { status: "RECEIVER_CONFIRMED" } } },
  ];

  const handleSubmit = async () => {
    if (!selected) return;
    try {
      await confirmAllocationReceipt(selected.id, {
        confirmed: decision === "confirm",
        reason: decision === "dispute" ? reason : undefined,
      });
      toast({ title: "ثبت شد" });
      queryClient.invalidateQueries({ queryKey: ["p2p", "allocations", "receiver"] });
      setOpen(false);
      setSelected(null);
      setDecision("confirm");
      setReason("");
    } catch (error) {
      toast({ title: "خطا", description: "ثبت تایید ناموفق بود", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <ServerTableView<P2PAllocation>
        title="دریافت‌های P2P"
        description="تایید یا اعتراض به رسید پرداخت"
        storageKey="trader.p2p.receiver"
        columns={columns}
        queryKeyFactory={(params) => ["p2p", "allocations", "receiver", params]}
        queryFn={listMyAllocationsAsReceiver}
        defaultParams={{ page: 1, limit: 10, tab: "pending" }}
        tabs={tabs}
        renderCard={(row) => (
          <div className="rounded-lg border p-4 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">مبلغ: {row.amount}</p>
                <p className="text-xs text-muted-foreground">پرداخت‌کننده: {row.payerName ?? "-"}</p>
              </div>
              <StatusBadge status={row.status} />
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              disabled={!hasPermission(row.actions ?? {}, "canConfirmReceived")}
              onClick={() => {
                setSelected(row);
                setOpen(true);
              }}
            >
              تایید دریافت
            </Button>
          </div>
        )}
        rowActions={(row) => (
          <Button
            size="sm"
            variant="outline"
            disabled={!hasPermission(row.actions ?? {}, "canConfirmReceived")}
            onClick={() => {
              setSelected(row);
              setOpen(true);
            }}
          >
            تایید دریافت
          </Button>
        )}
        emptyState={{
          title: "دریافتی برای نمایش نیست",
          description: "در حال حاضر تخصیص فعالی ندارید.",
        }}
      />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-4 sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>تایید دریافت</SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm">نتیجه</label>
              <Select value={decision} onValueChange={(value) => setDecision(value as "confirm" | "dispute")}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirm">تایید دریافت</SelectItem>
                  <SelectItem value="dispute">اعتراض</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {decision === "dispute" ? (
              <div className="space-y-2">
                <label className="text-sm">دلیل اعتراض</label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب دلیل" />
                  </SelectTrigger>
                  <SelectContent>
                    {disputeReasons.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
          <SheetFooter className="mt-auto">
            <Button onClick={handleSubmit} disabled={decision === "dispute" && !reason}>
              ثبت
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
