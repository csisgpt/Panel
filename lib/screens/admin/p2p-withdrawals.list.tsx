"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/kit/ops/status-badge";
import { CountdownBadge } from "@/components/kit/ops/countdown-badge";
import { formatMoney } from "@/lib/format/money";
import { listAdminP2PWithdrawals } from "@/lib/api/p2p";
import type { P2PWithdrawal } from "@/lib/contracts/p2p";
import type { ServerTableViewProps } from "@/components/kit/table/server-table-view";
import { serializeListParams } from "@/lib/querykit/serialize";
import { copyToClipboard } from "@/lib/copy";

const supportsBooleanQuery = process.env.NEXT_PUBLIC_API_SUPPORTS_BOOLEAN_QUERY !== "false";

export function createAdminP2PWithdrawalsListConfig(): ServerTableViewProps<P2PWithdrawal, Record<string, unknown>> {
  const columns: ColumnDef<P2PWithdrawal>[] = [
    {
      id: "createdAt",
      header: "زمان ثبت",
      cell: ({ row }) => <CountdownBadge targetDate={row.original.createdAt} />,
    },
    {
      id: "withdrawer",
      header: "برداشت‌کننده",
      cell: ({ row }) => (
        <div className="space-y-1 text-xs">
          <p className="font-medium">{row.original.withdrawer?.displayName ?? "-"}</p>
          <p>{row.original.withdrawer?.mobile ?? row.original.userMobile ?? "-"}</p>
          {row.original.withdrawer?.userId ? <Button size="sm" variant="outline" onClick={() => copyToClipboard(row.original.withdrawer!.userId, "شناسه کاربر کپی شد")}>کپی userId</Button> : null}
        </div>
      ),
    },
    {
      id: "destination",
      header: "مقصد",
      cell: ({ row }) => {
        const destination = row.original.destination;
        const value = destination?.fullValue ?? destination?.masked;
        const all = destination?.copyText ?? [destination?.title, destination?.bankName, destination?.ownerName, value].filter(Boolean).join(" | ");
        return (
          <div className="space-y-1 text-xs">
            <p>{destination?.title ?? "-"}</p>
            <p>{destination?.bankName ?? "-"}</p>
            <p>{destination?.ownerName ?? "-"}</p>
            <p className="font-mono">{value ?? "-"}</p>
            <div className="flex gap-1">
              {all ? <Button size="sm" variant="outline" onClick={() => copyToClipboard(all, "اطلاعات مقصد کپی شد")}>کپی همه</Button> : null}
              {value ? <Button size="sm" variant="outline" onClick={() => copyToClipboard(value, "شماره مقصد کپی شد")}>کپی شماره</Button> : null}
            </div>
          </div>
        );
      },
    },
    {
      id: "amount",
      header: "مبلغ / باقی‌مانده",
      cell: ({ row }) => (
        <div className="text-xs">
          <p>{formatMoney(row.original.amount)}</p>
          <p className="text-muted-foreground">{formatMoney(row.original.remainingToAssign)}</p>
        </div>
      ),
    },
    {
      id: "status",
      header: "وضعیت",
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-1">
          <StatusBadge status={row.original.status} />
          {row.original.isUrgent ? <Badge variant="destructive">فوری</Badge> : null}
          {row.original.hasDispute ? <Badge variant="secondary">اختلاف</Badge> : null}
          {row.original.hasProof ? <Badge variant="secondary">رسید دارد</Badge> : null}
          {row.original.hasExpiringAllocations ? <Badge variant="secondary">نزدیک انقضا</Badge> : null}
        </div>
      ),
    },
  ];

  return {
    storageKey: "admin.p2p.withdrawals",
    title: "صف برداشت‌های P2P",
    description: "مدیریت صف برداشت‌های نیازمند تخصیص و بررسی",
    columns,
    queryKeyFactory: (params) => ["admin", "p2p", "withdrawals", serializeListParams(params)],
    queryFn: listAdminP2PWithdrawals,
    defaultParams: { page: 1, limit: 10, tab: "all" },
    tabs: [
      { id: "all", label: "همه", paramsPatch: { filters: {} } },
      ...(supportsBooleanQuery
        ? [
            { id: "urgent", label: "فوری", paramsPatch: { filters: { isUrgent: true } } },
            { id: "proofs", label: "دارای رسید", paramsPatch: { filters: { hasProof: true } } },
            { id: "disputes", label: "اختلاف", paramsPatch: { filters: { hasDispute: true } } },
          ]
        : []),
      { id: "expiring_soon", label: "در شرف انقضا", paramsPatch: { filters: { expiringSoonMinutes: "60" } } },
    ],
    sortOptions: [
      { key: "priority", label: "اولویت", defaultDir: "desc" },
      { key: "createdAt", label: "زمان ثبت", defaultDir: "desc" },
      { key: "amount", label: "بیشترین مبلغ", defaultDir: "desc" },
    ],
    filtersConfig: [
      {
        type: "status",
        key: "destinationType",
        label: "نوع مقصد",
        options: [
          { label: "شبا", value: "IBAN" },
          { label: "کارت", value: "CARD" },
          { label: "حساب", value: "ACCOUNT" },
        ],
      },
    ],
    enableAdvancedFilters: true,
    enableDensityToggle: true,
  };
}
