"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/kit/ops/status-badge";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { WizardSheet } from "@/components/kit/flow/wizard-sheet";
import { FileUploader } from "@/components/kit/files/file-uploader";
import { useToast } from "@/hooks/use-toast";
import { listMyAllocationsAsPayer, submitAllocationProof } from "@/lib/api/p2p";
import type { P2PAllocation } from "@/lib/contracts/p2p";
import { PaymentMethod } from "@/lib/types/backend";
import { hasPermission } from "@/lib/contracts/permissions";

const steps = [
  { key: "info", title: "اطلاعات پرداخت" },
  { key: "files", title: "بارگذاری رسید" },
  { key: "review", title: "بازبینی" },
];

const methodOptions = [
  { value: PaymentMethod.CARD_TO_CARD, label: "کارت به کارت" },
  { value: PaymentMethod.PAYA, label: "پایا" },
  { value: PaymentMethod.SATNA, label: "ساتنا" },
  { value: PaymentMethod.TRANSFER, label: "انتقال" },
  { value: PaymentMethod.UNKNOWN, label: "نامشخص" },
];

export default function TraderPayerPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState<P2PAllocation | null>(null);
  const [method, setMethod] = useState<PaymentMethod | "">("");
  const [bankRef, setBankRef] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [fileIds, setFileIds] = useState<string[]>([]);

  const columns: ColumnDef<P2PAllocation>[] = [
    { id: "createdAt", header: "تاریخ", cell: ({ row }: { row: { original: P2PAllocation } }) => row.original.createdAt },
    { id: "amount", header: "مبلغ", cell: ({ row }: { row: { original: P2PAllocation } }) => row.original.amount },
    { id: "receiver", header: "گیرنده", cell: ({ row }: { row: { original: P2PAllocation } }) => row.original.receiverName ?? "-" },
    { id: "status", header: "وضعیت", cell: ({ row }: { row: { original: P2PAllocation } }) => <StatusBadge status={row.original.status} /> },
  ];

  const tabs = [
    { id: "action", label: "نیازمند اقدام", paramsPatch: { filters: { status: "ASSIGNED" } } },
    { id: "proof", label: "رسید ثبت شده", paramsPatch: { filters: { status: "PROOF_SUBMITTED" } } },
    { id: "dispute", label: "اختلاف", paramsPatch: { filters: { status: "DISPUTED" } } },
  ];

  const completedKeys = useMemo(() => {
    const keys: string[] = [];
    if (method && bankRef) keys.push("info");
    if (fileIds.length) keys.push("files");
    return keys;
  }, [method, bankRef, fileIds.length]);

  const resetForm = () => {
    setActiveIndex(0);
    setMethod("");
    setBankRef("");
    setPaidAt("");
    setFileIds([]);
    setSelected(null);
  };

  const handleSubmit = async () => {
    if (!selected || !method || !bankRef || fileIds.length === 0) return;
    try {
      await submitAllocationProof(selected.id, { bankRef, method, paidAt: paidAt || undefined, fileIds });
      toast({ title: "رسید ثبت شد" });
      queryClient.invalidateQueries({ queryKey: ["p2p", "allocations", "payer"] });
      setOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: "خطا", description: "ثبت رسید ناموفق بود", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <ServerTableView<P2PAllocation>
        title="پرداخت‌های P2P"
        description="لیست تخصیص‌هایی که باید پرداخت شوند"
        storageKey="trader.p2p.payer"
        columns={columns}
        queryKeyFactory={(params) => ["p2p", "allocations", "payer", params]}
        queryFn={listMyAllocationsAsPayer}
        defaultParams={{ page: 1, limit: 10, tab: "action" }}
        tabs={tabs}
        renderCard={(row) => (
          <div className="rounded-lg border p-4 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">مبلغ: {row.amount}</p>
                <p className="text-xs text-muted-foreground">گیرنده: {row.receiverName ?? "-"}</p>
              </div>
              <StatusBadge status={row.status} />
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              disabled={!hasPermission(row.actions ?? {}, "canSubmitProof")}
              onClick={() => {
                setSelected(row);
                setOpen(true);
              }}
            >
              ثبت پرداخت
            </Button>
          </div>
        )}
        rowActions={(row) => (
          <Button
            size="sm"
            variant="outline"
            disabled={!hasPermission(row.actions ?? {}, "canSubmitProof")}
            onClick={() => {
              setSelected(row);
              setOpen(true);
            }}
          >
            ثبت پرداخت
          </Button>
        )}
        emptyState={{
          title: "پرداختی برای نمایش نیست",
          description: "در حال حاضر تخصیص فعال ندارید.",
        }}
      />

      <WizardSheet
        open={open}
        onOpenChange={(next) => {
          if (!next) resetForm();
          setOpen(next);
        }}
        title="ثبت پرداخت"
        description={selected ? `کد تخصیص ${selected.id}` : ""}
        steps={steps}
        activeIndex={activeIndex}
        completedKeys={completedKeys}
        onBack={() => setActiveIndex((prev) => Math.max(prev - 1, 0))}
        onNext={() => setActiveIndex((prev) => Math.min(prev + 1, steps.length - 1))}
        onSubmit={handleSubmit}
        isNextDisabled={activeIndex === 0 ? !(method && bankRef) : activeIndex === 1 ? fileIds.length === 0 : false}
        isSubmitDisabled={!method || !bankRef || fileIds.length === 0}
        submitLabel="ارسال رسید"
      >
        {activeIndex === 0 ? (
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm">روش پرداخت</label>
              <Select value={method} onValueChange={(value) => setMethod(value as PaymentMethod)}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب روش" />
                </SelectTrigger>
                <SelectContent>
                  {methodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm">شماره مرجع</label>
              <Input value={bankRef} onChange={(event) => setBankRef(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">زمان پرداخت (اختیاری)</label>
              <Input type="datetime-local" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} />
            </div>
          </div>
        ) : null}

        {activeIndex === 1 ? (
          <FileUploader maxFiles={5} accept="image/*,application/pdf" label="رسید پرداخت" onUploaded={setFileIds} />
        ) : null}

        {activeIndex === 2 ? (
          <div className="space-y-2 rounded-lg border p-4 text-sm">
            <p>روش پرداخت: {methodOptions.find((item) => item.value === method)?.label}</p>
            <p>شماره مرجع: {bankRef}</p>
            <p>تعداد فایل: {fileIds.length}</p>
          </div>
        ) : null}
      </WizardSheet>
    </div>
  );
}
