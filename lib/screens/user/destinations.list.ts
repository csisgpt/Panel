import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { maskIban, maskCard } from "@/lib/format/mask";
import type { PaymentDestination } from "@/lib/contracts/p2p";
import { listUserDestinations } from "@/lib/api/payment-destinations";
import type { ServerTableViewProps } from "@/components/kit/table/server-table-view";
import { adaptListResponse } from "@/lib/adapters/list-response-adapter";

export function createUserDestinationsListConfig(): ServerTableViewProps<PaymentDestination, Record<string, unknown>> {
  const columns: ColumnDef<PaymentDestination>[] = [
    {
      id: "label",
      header: "عنوان",
      cell: ({ row }) => row.original.label,
    },
    {
      id: "iban",
      header: "شماره شبا",
      cell: ({ row }) => (row.original.iban ? maskIban(row.original.iban) : "-"),
    },
    {
      id: "card",
      header: "کارت",
      cell: ({ row }) => (row.original.cardNumber ? maskCard(row.original.cardNumber) : "-"),
    },
    {
      id: "default",
      header: "پیش‌فرض",
      cell: ({ row }) => (row.original.isDefault ? <Badge variant="secondary">پیش‌فرض</Badge> : null),
    },
  ];

  return {
    storageKey: "user.destinations",
    title: "مقاصد پرداخت",
    description: "لیست مقاصد پرداخت کاربر",
    columns,
    queryKeyFactory: (params) => ["user", "destinations", params],
    queryFn: async (params) => {
      const items = await listUserDestinations();
      const start = (params.page - 1) * params.limit;
      const paginated = items.slice(start, start + params.limit);
      return adaptListResponse({
        items: paginated,
        meta: { page: params.page, limit: params.limit, total: items.length },
      });
    },
    defaultParams: { page: 1, limit: 10, tab: "all" },
  };
}
