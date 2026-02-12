"use client";

import Link from "next/link";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { Button } from "@/components/ui/button";
import { adminKycQueue } from "@/lib/api/foundation";
import { faLabels } from "@/lib/i18n/fa";

export default function AdminKycPage() {
  return (
    <ServerTableView<any>
      storageKey="foundation-kyc-queue"
      title="صف KYC"
      columns={[
        { id: "user", header: "کاربر", cell: ({ row }: any) => <div><div>{row.original.user.fullName}</div><div className="text-xs">{row.original.user.mobile}</div></div> },
        { id: "status", header: "وضعیت", cell: ({ row }: any) => faLabels.kycStatus[row.original.kyc.status as keyof typeof faLabels.kycStatus] },
        { id: "level", header: "سطح", cell: ({ row }: any) => faLabels.kycLevel[row.original.kyc.level as keyof typeof faLabels.kycLevel] },
        { accessorKey: "submittedAt", header: "زمان ارسال" },
      ] as any}
      queryKeyFactory={(params) => ["foundation-kyc", params]}
      queryFn={async (params) => {
        const data = await adminKycQueue({ page: params.page, limit: params.limit, ...(params.filters as any) });
        return { items: data.items, meta: { ...data.meta, total: data.meta.totalItems } as any };
      }}
      filtersConfig={[
        { type: "status", key: "status", label: "وضعیت", options: Object.entries(faLabels.kycStatus).map(([value, label]) => ({ value, label })) },
        { type: "status", key: "level", label: "سطح", options: Object.entries(faLabels.kycLevel).map(([value, label]) => ({ value, label })) },
      ] as any}
      rowActions={(row) => <Button asChild size="sm"><Link href={`/admin/users/${row.user.id}`}>جزئیات کاربر</Link></Button>}
    />
  );
}
