"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/kit/ops/status-badge";
import { CountdownBadge } from "@/components/kit/ops/countdown-badge";
import { AttachmentBadge } from "@/components/kit/files/attachment-badge";
import { AttachmentPreviewButton } from "@/components/kit/files/attachment-preview-button";
import { AttachmentGalleryModal } from "@/components/kit/files/attachment-gallery-modal";
import { hasPermission } from "@/lib/contracts/permissions";
import { formatMoney } from "@/lib/format/money";
import { listAdminP2PAllocations } from "@/lib/api/p2p";
import type { P2PAllocation } from "@/lib/contracts/p2p";
import type { ServerTableViewProps } from "@/components/kit/table/server-table-view";
import type { FileMeta } from "@/lib/types/backend";

function buildStubFile(fileId: string): FileMeta {
  return {
    id: fileId,
    createdAt: new Date().toISOString(),
    uploadedById: "",
    storageKey: "",
    fileName: `فایل ${fileId}`,
    mimeType: "image/jpeg",
    sizeBytes: 0,
    label: "رسید",
  };
}

function ProofAttachmentsCell({ allocation }: { allocation: P2PAllocation }) {
  const [open, setOpen] = useState(false);
  const files = useMemo(() => {
    if (allocation.proofAttachments?.length) {
      return allocation.proofAttachments
        .map((attachment) => attachment.file)
        .filter(Boolean) as FileMeta[];
    }
    return (allocation.proofFileIds ?? []).map(buildStubFile);
  }, [allocation.proofAttachments, allocation.proofFileIds]);

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

function AllocationActionsCell({ allocation }: { allocation: P2PAllocation }) {
  const actions = allocation.actions;
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" disabled={!hasPermission(actions ?? {}, "canAdminVerify")}>
        تایید
      </Button>
      <Button size="sm" variant="outline" disabled={!hasPermission(actions ?? {}, "canFinalize")}>
        نهایی‌سازی
      </Button>
      <Button size="sm" variant="outline" disabled={!hasPermission(actions ?? {}, "canCancel")}>
        لغو
      </Button>
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
      id: "actions",
      header: "اقدامات",
      cell: ({ row }) => <AllocationActionsCell allocation={row.original} />,
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
      { id: "needs_verify", label: "نیاز به تایید", paramsPatch: { filters: { status: "NEEDS_VERIFY" } } },
      { id: "expiring_soon", label: "در شرف انقضا", paramsPatch: { filters: { bucket: "expiring_soon" } } },
      { id: "dispute", label: "اختلاف", paramsPatch: { filters: { hasDispute: true } } },
    ],
    sortOptions: [
      { key: "expiresAt", label: "نزدیک‌ترین انقضا", defaultDir: "asc" },
      { key: "amount", label: "بیشترین مبلغ", defaultDir: "desc" },
    ],
  };
}
