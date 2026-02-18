"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { StatusBadge } from "@/components/kit/ops/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format/money";
import { listAdminDeposits } from "@/lib/api/admin-deposits";
import { mapAdminDepositsListParams } from "@/lib/contract-mappers/admin-deposits.mapper";
import type { DepositRequest } from "@/lib/types/backend";
import { serializeListParams } from "@/lib/querykit/serialize";

export default function AdminDepositsPage() {
  const columns: ColumnDef<DepositRequest>[] = useMemo(
    () => [
      { id: "id", header: "شناسه", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
      {
        id: "user",
        header: "کاربر",
        cell: ({ row }) => (
          <div className="space-y-1 text-xs">
            <div>{row.original.user?.mobile ?? "-"}</div>
            <div className="text-muted-foreground">{row.original.userId}</div>
          </div>
        ),
      },
      { id: "amount", header: "مبلغ", cell: ({ row }) => formatMoney(row.original.amount) },
      { id: "method", header: "روش", cell: ({ row }) => <Badge variant="outline">{row.original.method}</Badge> },
      { id: "status", header: "وضعیت", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { id: "createdAt", header: "ثبت", cell: ({ row }) => new Date(row.original.createdAt).toLocaleString("fa-IR") },
    ],
    []
  );

  return (
    <ServerTableView<DepositRequest>
      storageKey="admin.deposits"
      title="واریزها"
      description="مدیریت واریزها بر اساس قرارداد بک‌اند"
      columns={columns}
      queryKeyFactory={(params) => ["admin", "deposits", serializeListParams(params)]}
      queryFn={(params) => listAdminDeposits(mapAdminDepositsListParams(params))}
      defaultParams={{ page: 1, limit: 10, sort: { key: "createdAt", dir: "desc" }, tab: "all" }}
      sortOptions={[{ key: "createdAt", label: "تاریخ", defaultDir: "desc" }]}
      filtersConfig={[
        {
          type: "status",
          key: "status",
          label: "وضعیت",
          options: [
            { label: "در انتظار", value: "PENDING" },
            { label: "تایید", value: "APPROVED" },
            { label: "رد", value: "REJECTED" },
            { label: "لغو", value: "CANCELLED" },
          ],
        },
        { type: "dateRange", key: "createdFrom", label: "از تاریخ" },
        { type: "dateRange", key: "createdTo", label: "تا تاریخ" },
        { type: "amountRange", key: "amountFrom", label: "حداقل مبلغ" },
        { type: "amountRange", key: "amountTo", label: "حداکثر مبلغ" },
      ]}
      rowActions={(row) => (
        <Button asChild size="sm" variant="outline">
          <Link href={`/admin/users/${row.userId}`}>کاربر</Link>
        </Button>
      )}
      enableAdvancedFilters
    />
  );
}
