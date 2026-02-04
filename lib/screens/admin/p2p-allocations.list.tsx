"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/kit/ops/status-badge";
import { CountdownBadge } from "@/components/kit/ops/countdown-badge";
import { AttachmentBadge } from "@/components/kit/files/attachment-badge";
import { AttachmentPreviewButton } from "@/components/kit/files/attachment-preview-button";
import { AttachmentGalleryModal } from "@/components/kit/files/attachment-gallery-modal";
import { formatMoney } from "@/lib/format/money";
import { listAdminP2PAllocations } from "@/lib/api/p2p";
import type { P2PAllocation } from "@/lib/contracts/p2p";
import type { ServerTableViewProps } from "@/components/kit/table/server-table-view";

const supportsBooleanQuery = process.env.NEXT_PUBLIC_API_SUPPORTS_BOOLEAN_QUERY === "true";

function ProofAttachmentsCell({ allocation }: { allocation: P2PAllocation }) {
  const [open, setOpen] = useState(false);
  const files = useMemo(() => {
    if (allocation.attachments?.length) {
      return allocation.attachments;
    }
    return [];
  }, [allocation.attachments]);

  if (!files.length) return <span className="text-xs text-muted-foreground">بدون پیوست</span>;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {files.map((file) => (
        <AttachmentBadge key={file.id} file={file} />
      ))}
      <AttachmentPreviewButton onClick={() => setOpen(true)} label="مشاهده" />
      <AttachmentGalleryModal open={open} onOpenChange={setOpen} files={files} />
    </div>
  );
}

export function createAdminP2PAllocationsListConfig(): ServerTableViewProps<P2PAllocation, Record<string, unknown>> {
  const columns: ColumnDef<P2PAllocation>[] = [
    {
      id: "createdAt",
      header: "انقضا",
      cell: ({ row }) => (
        <CountdownBadge targetDate={row.original.expiresAt ?? row.original.createdAt} />
      ),
    },
    {
      id: "amount",
      header: "مبلغ",
      cell: ({ row }) => formatMoney(row.original.amount),
    },
    {
      id: "status",
      header: "وضعیت",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "payer",
      header: "پرداخت‌کننده",
      cell: ({ row }) => row.original.payerName ?? "-",
    },
    {
      id: "receiver",
      header: "دریافت‌کننده",
      cell: ({ row }) => row.original.receiverName ?? "-",
    },
    {
      id: "proof",
      header: "رسید",
      cell: ({ row }) => <ProofAttachmentsCell allocation={row.original} />,
    },
    {
      id: "paymentMethod",
      header: "روش پرداخت",
      cell: ({ row }) => row.original.paymentMethod ?? "-",
    },
    {
      id: "bankRef",
      header: "شماره مرجع",
      cell: ({ row }) => row.original.bankRef ?? "-",
    },
    {
      id: "destination",
      header: "مقصد پرداخت",
      cell: ({ row }) => row.original.destinationSummary ?? "-",
    },
  ];

  return {
    storageKey: "admin.p2p.allocations",
    title: "بازبینی تخصیص‌ها",
    description: "بازبینی تخصیص‌های دریافت و تایید رسید",
    columns,
    queryKeyFactory: (params) => ["admin", "p2p", "allocations", params],
    queryFn: listAdminP2PAllocations,
    defaultParams: { page: 1, limit: 10, tab: "all" },
    tabs: [
      { id: "all", label: "همه", paramsPatch: { filters: {} } },
      { id: "proof_submitted", label: "رسید ارسال شد", paramsPatch: { filters: { status: "PROOF_SUBMITTED" } } },
      { id: "receiver_confirmed", label: "تایید گیرنده", paramsPatch: { filters: { status: "RECEIVER_CONFIRMED" } } },
      { id: "admin_verified", label: "تایید ادمین", paramsPatch: { filters: { status: "ADMIN_VERIFIED" } } },
      { id: "disputed", label: "اختلاف", paramsPatch: { filters: { status: "DISPUTED" } } },
      { id: "expiring_soon", label: "در شرف انقضا", paramsPatch: { filters: { expiresSoonMinutes: "60" } } },
    ],
    sortOptions: [
      { key: "createdAt", label: "جدیدترین", defaultDir: "desc" },
      { key: "expiresAt", label: "نزدیک‌ترین انقضا", defaultDir: "asc" },
      { key: "paidAt", label: "آخرین پرداخت", defaultDir: "desc" },
      { key: "amount", label: "بیشترین مبلغ", defaultDir: "desc" },
    ],
    filtersConfig: [
      {
        type: "status",
        key: "status",
        label: "وضعیت",
        options: [
          { label: "تخصیص شده", value: "ASSIGNED" },
          { label: "رسید ارسال شد", value: "PROOF_SUBMITTED" },
          { label: "تایید گیرنده", value: "RECEIVER_CONFIRMED" },
          { label: "تایید ادمین", value: "ADMIN_VERIFIED" },
          { label: "تسویه شده", value: "SETTLED" },
          { label: "اختلاف", value: "DISPUTED" },
          { label: "لغو شده", value: "CANCELLED" },
          { label: "منقضی", value: "EXPIRED" },
        ],
      },
      {
        type: "status",
        key: "method",
        label: "روش پرداخت",
        options: [
          { label: "کارت به کارت", value: "CARD_TO_CARD" },
          { label: "ساتنا", value: "SATNA" },
          { label: "پایا", value: "PAYA" },
          { label: "انتقال", value: "TRANSFER" },
          { label: "نامشخص", value: "UNKNOWN" },
        ],
      },
      ...(supportsBooleanQuery
        ? [
            {
              type: "status" as const,
              key: "hasProof",
              label: "دارای رسید",
              options: [
                { label: "بله", value: "true" },
                { label: "خیر", value: "false" },
              ],
            },
            {
              type: "status" as const,
              key: "receiverConfirmed",
              label: "تایید گیرنده",
              options: [
                { label: "بله", value: "true" },
                { label: "خیر", value: "false" },
              ],
            },
            {
              type: "status" as const,
              key: "adminVerified",
              label: "تایید ادمین",
              options: [
                { label: "بله", value: "true" },
                { label: "خیر", value: "false" },
              ],
            },
            {
              type: "status" as const,
              key: "expired",
              label: "منقضی",
              options: [
                { label: "بله", value: "true" },
                { label: "خیر", value: "false" },
              ],
            },
          ]
        : []),
      {
        type: "status",
        key: "expiresSoonMinutes",
        label: "نزدیک به انقضا",
        options: [
          { label: "۳۰ دقیقه", value: "30" },
          { label: "۶۰ دقیقه", value: "60" },
        ],
      },
      // TODO: backend DTO needs amountMin/amountMax support before enabling amount range filters.
      { type: "dateRange", key: "createdFrom", label: "از تاریخ ایجاد" },
      { type: "dateRange", key: "createdTo", label: "تا تاریخ ایجاد" },
      { type: "dateRange", key: "paidFrom", label: "از تاریخ پرداخت" },
      { type: "dateRange", key: "paidTo", label: "تا تاریخ پرداخت" },
    ],
  };
}
