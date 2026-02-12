"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { listAdminKycQueue, putAdminUserKyc } from "@/lib/api/admin-kyc";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { Button } from "@/components/ui/button";

export default function AdminKycPage() {
  const quick = useMutation({ mutationFn: ({ userId, status }: any) => putAdminUserKyc(userId, { status }) });
  return <ServerTableView<any>
    storageKey="admin-kyc-queue"
    title="صف KYC"
    columns={[{ id: "user", header: "کاربر", cell: ({ row }: any) => <div>{row.original.fullName}<div className="text-xs">{row.original.mobile}</div></div> }, { accessorKey: "status", header: "وضعیت" }, { accessorKey: "level", header: "سطح" }, { accessorKey: "submittedAt", header: "زمان" }] as any}
    queryKeyFactory={(params) => ["kyc-queue", params]}
    queryFn={(params) => listAdminKycQueue({ page: params.page, limit: params.limit, q: params.search, ...(params.filters as any) }).then((r) => ({ items: r.items ?? [], meta: (r.meta as any) ?? { page: 1, limit: 20, totalItems: r.items?.length || 0, totalPages: 1 } }))}
    rowActions={(row) => <div className="flex gap-2"><Button asChild size="sm" variant="outline"><Link href={`/admin/users/${row.userId || row.id}`}>جزئیات</Link></Button><Button size="sm" onClick={() => quick.mutate({ userId: row.userId || row.id, status: "VERIFIED" })}>تایید</Button></div>}
  />;
}
