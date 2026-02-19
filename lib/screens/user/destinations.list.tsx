import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { PaymentDestinationView } from "@/lib/types/backend";
import { listUserDestinations } from "@/lib/api/payment-destinations";
import type { ServerTableViewProps } from "@/components/kit/table/server-table-view";
import { adaptListResponse } from "@/lib/adapters/list-response-adapter";

export function createUserDestinationsListConfig(): ServerTableViewProps<PaymentDestinationView, Record<string, unknown>> {
  const columns: ColumnDef<PaymentDestinationView>[] = [
    {
      id: "title",
      header: "عنوان",
      cell: ({ row }) => row.original.title ?? "-",
    },
    {
      id: "type",
      header: "نوع",
      cell: ({ row }) =>
        row.original.type === "IBAN"
          ? "شبا"
          : row.original.type === "CARD"
          ? "کارت"
          : "حساب",
    },
    {
      id: "masked",
      header: "مقدار",
      cell: ({ row }) => row.original.maskedValue ?? "-",
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
