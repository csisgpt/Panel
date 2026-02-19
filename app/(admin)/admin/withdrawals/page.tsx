"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { StatusBadge } from "@/components/kit/ops/status-badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format/money";
import { listAdminWithdrawals } from "@/lib/api/admin-withdrawals";
import { mapAdminWithdrawalsListParams } from "@/lib/contract-mappers/admin-withdrawals.mapper";
import type { WithdrawRequest } from "@/lib/types/backend";
import { serializeListParams } from "@/lib/querykit/serialize";

export default function AdminWithdrawalsPage() {
  const columns: ColumnDef<WithdrawRequest>[] = useMemo(
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
      { id: "destination", header: "مقصد", cell: ({ row }) => row.original.destination?.maskedValue ?? "-" },
      { id: "status", header: "وضعیت", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { id: "createdAt", header: "ثبت", cell: ({ row }) => new Date(row.original.createdAt).toLocaleString("fa-IR") },
    ],
    []
  );

  return (
    <ServerTableView<WithdrawRequest>
      storageKey="admin.withdrawals"
      title="برداشت‌ها"
      description="مدیریت برداشت‌ها با کلیدهای دقیق DTO"
      columns={columns}
      queryKeyFactory={(params) => ["admin", "withdrawals", serializeListParams(params)]}
      queryFn={(params) => listAdminWithdrawals(mapAdminWithdrawalsListParams(params))}
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
