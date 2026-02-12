"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { listAdminUsers, patchAdminUser } from "@/lib/api/admin-users";
import { listCustomerGroups } from "@/lib/api/admin-customer-groups";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { applyApiValidationErrorsToRHF } from "@/lib/forms/apply-api-errors";
import type { UserSafeDto } from "@/lib/types/admin-modules";

export default function AdminUsersPage() {
  const [editing, setEditing] = useState<UserSafeDto | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const groupsQuery = useQuery({ queryKey: ["admin-groups-all"], queryFn: listCustomerGroups });
  const form = useForm<Record<string, string>>();

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => patchAdminUser(id, body),
    onSuccess: () => {
      toast({ title: "کاربر بروزرسانی شد" });
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      applyApiValidationErrorsToRHF(error, form.setError);
      toast({ title: "خطا در ذخیره", variant: "destructive" });
    },
  });

  const columns = useMemo(
    () => [
      { id: "user", header: "کاربر", cell: ({ row }: any) => <div><p className="font-medium">{row.original.fullName}</p><p className="text-xs text-muted-foreground">{row.original.mobile}</p></div> },
      { accessorKey: "email", header: "ایمیل" },
      { accessorKey: "role", header: "نقش", cell: ({ row }: any) => <Badge variant="outline">{row.original.role}</Badge> },
      { accessorKey: "status", header: "وضعیت", cell: ({ row }: any) => <Badge>{row.original.status}</Badge> },
      { id: "group", header: "گروه", cell: ({ row }: any) => row.original.customerGroupName || row.original.customerGroupCode || "—" },
      { id: "kyc", header: "KYC", cell: ({ row }: any) => `${row.original.kycStatus ?? "—"} ${row.original.kycLevel ?? ""}` },
      { id: "tahesab", header: "تاهساب", cell: ({ row }: any) => row.original.tahesabCustomerCode || "—" },
      { id: "createdAt", header: "ایجاد", cell: ({ row }: any) => row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString("fa-IR") : "—" },
    ],
    []
  );

  return (
    <>
      <ServerTableView<UserSafeDto>
        storageKey="admin-users-v2"
        title="کاربران"
        columns={columns as any}
        queryKeyFactory={(params) => ["admin-users", params]}
        queryFn={(params) => listAdminUsers({
          page: params.page,
          limit: params.limit,
          q: params.search,
          ...(params.filters as any),
        }).then((r) => ({ items: r.items ?? [], meta: (r.meta as any) ?? { page: 1, limit: 20, totalItems: r.items?.length ?? 0, totalPages: 1 } }))}
        filtersConfig={[
          { type: "status", key: "status", label: "وضعیت", options: [{ label: "ACTIVE", value: "ACTIVE" }, { label: "BLOCKED", value: "BLOCKED" }] },
          { type: "status", key: "role", label: "نقش", options: [{ label: "ADMIN", value: "ADMIN" }, { label: "TRADER", value: "TRADER" }] },
        ] as any}
        rowActions={(row) => (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline"><Link href={`/admin/users/${row.id}`}>مشاهده</Link></Button>
            <Button size="sm" onClick={() => { setEditing(row); form.reset(row as any); }}>ویرایش</Button>
          </div>
        )}
      />

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>ویرایش کاربر</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>نام</Label><Input {...form.register("fullName")} /></div>
            <div><Label>ایمیل</Label><Input {...form.register("email")} /></div>
            <div><Label>نقش</Label><Input {...form.register("role")} /></div>
            <div><Label>وضعیت</Label><Input {...form.register("status")} /></div>
            <div>
              <Label>گروه</Label>
              <Select value={form.watch("customerGroupId") || ""} onValueChange={(v) => form.setValue("customerGroupId", v)}>
                <SelectTrigger><SelectValue placeholder="انتخاب گروه" /></SelectTrigger>
                <SelectContent>
                  {(groupsQuery.data ?? []).map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>کد تاهساب</Label><Input {...form.register("tahesabCustomerCode")} /></div>
            <div><Label>کدملی</Label><Input {...form.register("nationalCode")} /></div>
            <div><Label>آدرس</Label><Input {...form.register("address")} /></div>
            <Button disabled={updateMutation.isPending || !editing} onClick={form.handleSubmit((values) => editing && updateMutation.mutate({ id: editing.id, body: values }))}>ذخیره</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
