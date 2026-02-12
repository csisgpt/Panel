"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { applyApiValidationErrorsToRHF } from "@/lib/forms/apply-api-errors";
import { adminGetUsersMeta, adminListCustomerGroups, adminListUsers, adminPatchUser } from "@/lib/api/foundation";
import { faLabels } from "@/lib/i18n/fa";
import { formatApiErrorFa } from "@/lib/contracts/errors";

export default function AdminUsersPage() {
  const [editing, setEditing] = useState<any | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const groups = useQuery({ queryKey: ["foundation-groups"], queryFn: adminListCustomerGroups });
  const meta = useQuery({ queryKey: ["foundation-users-meta"], queryFn: adminGetUsersMeta });
  const form = useForm<Record<string, any>>();

  const patchMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => adminPatchUser(id, body),
    onSuccess: () => {
      toast({ title: faLabels.common.success });
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["foundation-users"] });
    },
    onError: (error) => {
      applyApiValidationErrorsToRHF(error, form.setError);
      toast({ title: formatApiErrorFa(error), variant: "destructive" });
    },
  });

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "شناسه" },
      { id: "fullName", header: "نام کامل", cell: ({ row }: any) => <div><div className="font-medium">{row.original.fullName}</div><div className="text-xs text-muted-foreground">{row.original.mobile}</div></div> },
      { accessorKey: "email", header: "ایمیل" },
      { id: "role", header: "نقش", cell: ({ row }: any) => <Badge variant="outline">{faLabels.userRole[row.original.role as keyof typeof faLabels.userRole] ?? row.original.role}</Badge> },
      { id: "status", header: "وضعیت", cell: ({ row }: any) => <Badge>{faLabels.userStatus[row.original.status as keyof typeof faLabels.userStatus] ?? row.original.status}</Badge> },
      { id: "customerGroup", header: "گروه مشتری", cell: ({ row }: any) => row.original.customerGroup?.name ?? "—" },
      { id: "kyc", header: "KYC", cell: ({ row }: any) => row.original.kyc ? `${faLabels.kycStatus[row.original.kyc.status as keyof typeof faLabels.kycStatus]} / ${faLabels.kycLevel[row.original.kyc.level as keyof typeof faLabels.kycLevel]}` : faLabels.kycStatus.NONE },
      { accessorKey: "tahesabCustomerCode", header: "کد ته‌حساب", cell: ({ row }: any) => row.original.tahesabCustomerCode ?? "—" },
      { id: "createdAt", header: "تاریخ ایجاد", cell: ({ row }: any) => new Date(row.original.createdAt).toLocaleDateString("fa-IR") },
    ],
    []
  );

  return (
    <>
      <ServerTableView<any>
        storageKey="foundation-admin-users"
        title="کاربران"
        columns={columns as any}
        queryKeyFactory={(params) => ["foundation-users", params]}
        queryFn={async (params) => {
          const data = await adminListUsers({ page: params.page, limit: params.limit, q: params.search, ...(params.filters as any) });
          return { items: data.items, meta: { ...data.meta, total: data.meta.totalItems } as any };
        }}
        filtersConfig={[
          { type: "status", key: "role", label: "نقش", options: (meta.data?.roles ?? []).map((item) => ({ label: faLabels.userRole[item as keyof typeof faLabels.userRole] ?? item, value: item })) },
          { type: "status", key: "status", label: "وضعیت", options: (meta.data?.statuses ?? []).map((item) => ({ label: faLabels.userStatus[item as keyof typeof faLabels.userStatus] ?? item, value: item })) },
          { type: "status", key: "kycStatus", label: "وضعیت KYC", options: (meta.data?.kycStatuses ?? []).map((item) => ({ label: faLabels.kycStatus[item as keyof typeof faLabels.kycStatus] ?? item, value: item })) },
          { type: "status", key: "kycLevel", label: "سطح KYC", options: (meta.data?.kycLevels ?? []).map((item) => ({ label: faLabels.kycLevel[item as keyof typeof faLabels.kycLevel] ?? item, value: item })) },
          { type: "status", key: "tahesabLinked", label: "ته‌حساب", options: [{ label: "متصل", value: "true" }, { label: "نامتصل", value: "false" }] },
          { type: "status", key: "customerGroupId", label: "گروه", options: (groups.data ?? []).map((g) => ({ label: g.name, value: g.id })) },
        ] as any}
        rowActions={(row) => (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline"><Link href={`/admin/users/${row.id}`}>{faLabels.common.view}</Link></Button>
            <Button size="sm" onClick={() => { setEditing(row); form.reset(row); }}>{faLabels.common.edit}</Button>
          </div>
        )}
      />

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>ویرایش کاربر</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>نام کامل</Label><Input {...form.register("fullName")} /></div>
            <div><Label>ایمیل</Label><Input {...form.register("email")} /></div>
            <div><Label>نقش</Label><Input {...form.register("role")} /></div>
            <div><Label>وضعیت</Label><Input {...form.register("status")} /></div>
            <div>
              <Label>گروه مشتری</Label>
              <Select value={form.watch("customerGroupId") ?? "none"} onValueChange={(v) => form.setValue("customerGroupId", v === "none" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="انتخاب گروه" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون گروه</SelectItem>
                  {(groups.data ?? []).map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>کد ته‌حساب</Label><Input {...form.register("tahesabCustomerCode")} /></div>
            <Button disabled={patchMutation.isPending || !editing} onClick={form.handleSubmit((values) => editing && patchMutation.mutate({ id: editing.id, body: values }))}>{faLabels.common.save}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
