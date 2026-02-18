"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormSection } from "@/components/kit/forms/form-section";
import { AttachmentViewer } from "@/components/kit/files/attachment-viewer";
import { FileUploader } from "@/components/kit/files/file-uploader";
import { DestinationCard } from "@/components/kit/p2p/destination-card";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { WizardSheet } from "@/components/kit/flow/wizard-sheet";
import { JalaliDateTimePicker } from "@/components/ui/jalali-datetime-picker";
import { MaskedInput } from "@/components/ui/masked-input";
import { getFileMetaBatch } from "@/lib/api/files";
import { listMyAllocationsAsPayer, submitAllocationProof } from "@/lib/api/p2p";
import type { P2PAllocation } from "@/lib/contracts/p2p";
import { formatMoney } from "@/lib/format/money";
import { PaymentMethod, type FileMeta } from "@/lib/types/backend";

const methods = [PaymentMethod.CARD_TO_CARD, PaymentMethod.PAYA, PaymentMethod.SATNA, PaymentMethod.TRANSFER, PaymentMethod.UNKNOWN];

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

export default function TraderPayerPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<P2PAllocation | null>(null);
  const [method, setMethod] = useState<PaymentMethod | "">("");
  const [bankRef, setBankRef] = useState("");
  const [paidAt, setPaidAt] = useState<string>();
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [proofFilesMeta, setProofFilesMeta] = useState<FileMeta[]>([]);

  useEffect(() => {
    if (!fileIds.length) {
      setProofFilesMeta([]);
      return;
    }
    getFileMetaBatch(fileIds).then(setProofFilesMeta);
  }, [fileIds]);

  const submit = async () => {
    if (!selected || !method || !bankRef || !paidAt || !selected.actions?.canSubmitProof) return;
    await submitAllocationProof(selected.id, { method, bankRef, paidAt, fileIds });
    await qc.invalidateQueries({ queryKey: ["p2p", "allocations", "payer"] });
    setOpen(false);
  };

  const columns: ColumnDef<P2PAllocation>[] = useMemo(
    () => [
      { id: "id", header: "شناسه", cell: ({ row }) => row.original.id },
      { id: "amount", header: "مبلغ", cell: ({ row }) => formatMoney(row.original.amount) },
      { id: "status", header: "وضعیت", cell: ({ row }) => row.original.status },
    ],
    []
  );

  return (
    <div className="space-y-4 pb-24">
      <ServerTableView<P2PAllocation>
        title="پرداخت‌های P2P"
        storageKey="trader.p2p.payer"
        columns={columns}
        queryKeyFactory={(params) => ["p2p", "allocations", "payer", params]}
        queryFn={listMyAllocationsAsPayer}
        defaultParams={{ page: 1, limit: 10 }}
        rowActions={(row) =>
          row.actions?.canSubmitProof ? (
            <Button
              size="sm"
              onClick={() => {
                setSelected(row);
                setMethod("");
                setBankRef("");
                setPaidAt(undefined);
                setFileIds([]);
                setStep(0);
                setOpen(true);
              }}
            >
              ثبت پرداخت
            </Button>
          ) : null
        }
      />

      <WizardSheet
        open={open}
        onOpenChange={setOpen}
        title="ثبت پرداخت"
        steps={[
          { key: "destination", title: "مقصد پرداخت" },
          { key: "payment", title: "اطلاعات پرداخت" },
          { key: "files", title: "بارگذاری رسید" },
          { key: "review", title: "بازبینی" },
        ]}
        activeIndex={step}
        completedKeys={[]}
        onBack={() => setStep((prev) => Math.max(prev - 1, 0))}
        onNext={() => setStep((prev) => Math.min(prev + 1, 3))}
        onSubmit={submit}
        isNextDisabled={step === 1 && (!method || !bankRef || !paidAt)}
        isSubmitDisabled={!method || !bankRef || !paidAt || !selected?.actions?.canSubmitProof}
        submitLabel="ثبت"
      >
        {step === 0 && selected ? (
          <DestinationCard
            destinationToPay={selected.destinationToPay}
            destinationCopyText={selected.destinationCopyText}
            paymentCode={selected.paymentCode}
            mode="payer"
          />
        ) : null}

        {step === 1 ? (
          <FormSection title="اطلاعات پرداخت">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm">روش پرداخت</label>
                <Select value={method} onValueChange={(value) => setMethod(value as PaymentMethod)}>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب" />
                  </SelectTrigger>
                  <SelectContent>
                    {methods.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <MaskedInput
                maskType="bankRef"
                value={bankRef}
                onChange={setBankRef}
                label="شناسه پیگیری / کد رهگیری"
                placeholder="مثلاً ۱۲۳۴۵۶۷۸۹۰"
                hint="فقط عدد وارد کنید."
              />
              <JalaliDateTimePicker value={paidAt} onChange={setPaidAt} />
              {!paidAt ? <p className="text-xs text-destructive">تاریخ پرداخت الزامی است.</p> : null}
            </div>
          </FormSection>
        ) : null}

        {step === 2 ? (
          <FormSection title="رسید / پیوست‌ها">
            <FileUploader maxFiles={5} accept="image/*,application/pdf" label="رسید / پیوست‌ها" onUploaded={setFileIds} />
          </FormSection>
        ) : null}

        {step === 3 && selected ? (
          <FormSection title="بازبینی">
            <div className="space-y-2 text-sm">
              <p>مبلغ: {formatMoney(selected.amount)}</p>
              <p>کد تخصیص: {selected.paymentCode || "-"}</p>
              <p>روش: {method || "-"}</p>
              <p>شناسه پیگیری: {bankRef || "-"}</p>
              <p>زمان پرداخت: {formatPersianDateTime(paidAt)}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">پیوست‌های جدید</h3>
              <AttachmentViewer files={proofFilesMeta} />
            </div>
            {selected.attachments?.length ? (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">پیوست‌های قبلی</h3>
                <AttachmentViewer files={selected.attachments} />
              </div>
            ) : null}
          </FormSection>
        ) : null}
      </WizardSheet>
    </div>
  );
}
