import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/kit/ops/status-badge";
import { CountdownBadge } from "@/components/kit/ops/countdown-badge";
import { UrgentChip } from "@/components/kit/ops/chips";
import { formatMoney } from "@/lib/format/money";
import { listAdminP2PWithdrawals } from "@/lib/api/p2p";
import type { P2PWithdrawal } from "@/lib/contracts/p2p";
import type { ServerTableViewProps } from "@/components/kit/table/server-table-view";

export function createAdminP2PWithdrawalsListConfig(): ServerTableViewProps<P2PWithdrawal, Record<string, unknown>> {
  const columns: ColumnDef<P2PWithdrawal>[] = [
    {
      id: "createdAt",
      header: "زمان ثبت",
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
      cell: ({ row }) => row.original.userMobile,
    },
    {
      id: "status",
      header: "وضعیت",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "urgent",
      header: "فوریت",
      cell: ({ row }) => (row.original.hasDispute ? <UrgentChip /> : null),
    },
  ];

  return {
    storageKey: "admin.p2p.withdrawals",
    title: "صف برداشت‌های P2P",
    description: "مدیریت صف برداشت‌های نیازمند تخصیص و بررسی",
    columns,
    queryKeyFactory: (params) => ["admin", "p2p", "withdrawals", params],
    queryFn: listAdminP2PWithdrawals,
    defaultParams: { page: 1, limit: 10, tab: "all" },
    tabs: [
      { id: "all", label: "همه", paramsPatch: { filters: {} } },
      { id: "needs_assignment", label: "نیاز به تخصیص", paramsPatch: { filters: { status: "NEEDS_ASSIGNMENT" } } },
      { id: "proof_submitted", label: "رسید ارسال شد", paramsPatch: { filters: { status: "PROOF_SUBMITTED" } } },
      { id: "expiring_soon", label: "در شرف انقضا", paramsPatch: { filters: { bucket: "expiring_soon" } } },
      { id: "disputes", label: "اختلاف", paramsPatch: { filters: { hasDispute: true } } },
    ],
    sortOptions: [
      { key: "createdAt", label: "جدیدترین", defaultDir: "desc" },
      { key: "amount", label: "بیشترین مبلغ", defaultDir: "desc" },
    ],
    filtersConfig: [
      {
        type: "status",
        key: "status",
        label: "وضعیت",
        options: [
          { label: "نیاز به تخصیص", value: "NEEDS_ASSIGNMENT" },
          { label: "رسید ارسال شد", value: "PROOF_SUBMITTED" },
          { label: "در انتظار", value: "PENDING" },
          { label: "تکمیل شده", value: "FINALIZED" },
          { label: "لغو شده", value: "CANCELLED" },
        ],
      },
      {
        type: "status",
        key: "bucket",
        label: "باکت",
        options: [
          { label: "همه", value: "all" },
          { label: "نیاز به تخصیص", value: "needs_assignment" },
          { label: "رسید ارسال شد", value: "proof_submitted" },
          { label: "در شرف انقضا", value: "expiring_soon" },
          { label: "اختلاف", value: "disputes" },
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
          { label: "۱۵ دقیقه", value: "15" },
          { label: "۳۰ دقیقه", value: "30" },
          { label: "۶۰ دقیقه", value: "60" },
        ],
      },
      { type: "amountRange", key: "amountMin", label: "حداقل مبلغ" },
      { type: "amountRange", key: "amountMax", label: "حداکثر مبلغ" },
      { type: "dateRange", key: "search", label: "جستجو" },
    ],
  };
}
