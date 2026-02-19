"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { Button } from "@/components/ui/button";
import { adminKycQueue } from "@/lib/api/foundation";
import type { UserKyc } from "@/lib/contracts/foundation/dtos";
import { faLabels } from "@/lib/i18n/fa";

interface KycQueueRow {
  user: { id: string; fullName: string; mobile: string; email: string };
  kyc: UserKyc;
  submittedAt: string;
}

export default function AdminKycPage() {
  const columns: ColumnDef<KycQueueRow>[] = [
    { id: "user", header: "کاربر", cell: ({ row }) => <div><div>{row.original.user.fullName}</div><div className="text-xs">{row.original.user.mobile}</div></div> },
    { id: "status", header: "وضعیت", cell: ({ row }) => faLabels.kycStatus[row.original.kyc.status] },
    { id: "level", header: "سطح", cell: ({ row }) => faLabels.kycLevel[row.original.kyc.level] },
    { accessorKey: "submittedAt", header: "زمان ارسال" },
  ];

  return (
    <ServerTableView<KycQueueRow>
      storageKey="foundation-kyc-queue"
      title="صف احراز هویت"
      columns={columns}
      queryKeyFactory={(params) => ["foundation-kyc", params]}
      queryFn={async (params) => {
        const data = await adminKycQueue({ page: params.page, limit: params.limit, ...(params.filters as Record<string, unknown>) });
        return {
          items: data.items,
          meta: {
            page: data.meta.page,
            limit: data.meta.limit,
            total: data.meta.totalItems,
            totalPages: data.meta.totalPages,
            hasNextPage: data.meta.hasNextPage,
            hasPrevPage: data.meta.hasPrevPage,
          },
        };
      }}
      filtersConfig={[
        { type: "status", key: "status", label: "وضعیت", options: Object.entries(faLabels.kycStatus).map(([value, label]) => ({ value, label })) },
        { type: "status", key: "level", label: "سطح", options: Object.entries(faLabels.kycLevel).map(([value, label]) => ({ value, label })) },
      ]}
      rowActions={(row) => <Button asChild size="sm"><Link href={`/admin/users/${row.user.id}`}>جزئیات کاربر</Link></Button>}
    />
  );
}
