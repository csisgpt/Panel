import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/kit/ops/status-badge";
import { CountdownBadge } from "@/components/kit/ops/countdown-badge";
import { UrgentChip } from "@/components/kit/ops/chips";
import { formatMoney } from "@/lib/format/money";
import { listAdminP2PWithdrawals } from "@/lib/api/p2p";
import type { P2PWithdrawal } from "@/lib/contracts/p2p";
import type { ServerTableViewProps } from "@/components/kit/table/server-table-view";
import { serializeListParams } from "@/lib/querykit/serialize";

export function createAdminP2PWithdrawalsListConfig(): ServerTableViewProps<P2PWithdrawal, Record<string, unknown>> {
  const columns: ColumnDef<P2PWithdrawal>[] = [
    {
      id: "createdAt",
      header: "زمان ثبت",
      cell: ({ row }) => <CountdownBadge targetDate={row.original.createdAt} />,
    },
    {
      id: "amount",
      header: "مبلغ",
      cell: ({ row }) => formatMoney(row.original.amount),
    },
    {
      id: "remainingToAssign",
      header: "باقی‌مانده تخصیص",
      cell: ({ row }) => formatMoney(row.original.remainingToAssign),
    },
    {
      id: "destination",
      header: "مقصد",
      cell: ({ row }) => row.original.destinationSummary ?? "-",
    },
    {
      id: "mobile",
      header: "موبایل",
      cell: ({ row }) => row.original.userMobile ?? "-",
    },
    {
      id: "status",
      header: "وضعیت",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "urgent",
      header: "فوریت",
      cell: ({ row }) => (row.original.isUrgent ? <UrgentChip /> : null),
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
      { id: "proofs", label: "دارای رسید", paramsPatch: { filters: { hasProof: true } } },
      { id: "disputes", label: "اختلاف", paramsPatch: { filters: { hasDispute: true } } },
      { id: "expiring_soon", label: "در شرف انقضا", paramsPatch: { filters: { expiringSoonMinutes: "60" } } },
    ],
    sortOptions: [
      { key: "priority", label: "اولویت", defaultDir: "desc" },
      { key: "nearestExpire", label: "نزدیک‌ترین انقضا", defaultDir: "asc" },
      { key: "createdAt", label: "زمان ثبت", defaultDir: "desc" },
      { key: "amount", label: "بیشترین مبلغ", defaultDir: "desc" },
      { key: "remainingToAssign", label: "بیشترین باقیمانده", defaultDir: "desc" },
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
      {
        type: "status",
        key: "hasProof",
        label: "دارای رسید",
        options: [
          { label: "بله", value: "true" },
          { label: "خیر", value: "false" },
        ],
      },
      {
        type: "status",
        key: "hasDispute",
        label: "اختلاف",
        options: [
          { label: "بله", value: "true" },
          { label: "خیر", value: "false" },
        ],
      },
      {
        type: "status",
        key: "expiringSoonMinutes",
        label: "نزدیک به انقضا",
        options: [
          { label: "۳۰ دقیقه", value: "30" },
          { label: "۶۰ دقیقه", value: "60" },
        ],
      },
      { type: "amountRange", key: "amountMin", label: "حداقل مبلغ" },
      { type: "amountRange", key: "amountMax", label: "حداکثر مبلغ" },
      { type: "amountRange", key: "remainingToAssignMin", label: "حداقل باقی‌مانده" },
      { type: "amountRange", key: "remainingToAssignMax", label: "حداکثر باقی‌مانده" },
      { type: "dateRange", key: "createdFrom", label: "از تاریخ" },
      { type: "dateRange", key: "createdTo", label: "تا تاریخ" },
    ],
    enableAdvancedFilters: true,
    enableDensityToggle: true,
  };
}
