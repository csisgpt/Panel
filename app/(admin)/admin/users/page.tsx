"use client";

import Link from "next/link";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
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
import type { UserKyc, UserSafeDto } from "@/lib/contracts/foundation/dtos";
import { faLabels } from "@/lib/i18n/fa";
import { formatApiErrorFa } from "@/lib/contracts/errors";

interface AdminUsersRow extends UserSafeDto {
  customerGroup: { id: string; code: string; name: string } | null;
  kyc: UserKyc | null;
}

interface UserEditForm {
  fullName?: string;
  email?: string;
  role?: UserSafeDto["role"];
  status?: UserSafeDto["status"];
  customerGroupId?: string | null;
  tahesabCustomerCode?: string | null;
}

export default function AdminUsersPage() {
  const [editing, setEditing] = useState<AdminUsersRow | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const groups = useQuery({ queryKey: ["foundation-groups"], queryFn: adminListCustomerGroups });
  const meta = useQuery({ queryKey: ["foundation-users-meta"], queryFn: adminGetUsersMeta });
  const form = useForm<UserEditForm>();

  const patchMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UserEditForm }) => adminPatchUser(id, body),
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

  const columns: ColumnDef<AdminUsersRow>[] = [
    { accessorKey: "id", header: "شناسه" },
    { id: "fullName", header: "نام کامل", cell: ({ row }) => <div><div className="font-medium">{row.original.fullName}</div><div className="text-xs text-muted-foreground">{row.original.mobile}</div></div> },
    { accessorKey: "email", header: "ایمیل" },
    { id: "role", header: "نقش", cell: ({ row }) => <Badge variant="outline">{faLabels.userRole[row.original.role]}</Badge> },
    { id: "status", header: "وضعیت", cell: ({ row }) => <Badge>{faLabels.userStatus[row.original.status]}</Badge> },
    { id: "customerGroup", header: "گروه مشتری", cell: ({ row }) => row.original.customerGroup?.name ?? "—" },
    { id: "kyc", header: "احراز هویت", cell: ({ row }) => row.original.kyc ? `${faLabels.kycStatus[row.original.kyc.status]} / ${faLabels.kycLevel[row.original.kyc.level]}` : faLabels.kycStatus.NONE },
    { accessorKey: "tahesabCustomerCode", header: "کد ته‌حساب", cell: ({ row }) => row.original.tahesabCustomerCode ?? "—" },
    { id: "createdAt", header: "تاریخ ایجاد", cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("fa-IR") },
  ];

  return (
    <>
      <ServerTableView<AdminUsersRow>
        storageKey="foundation-admin-users"
        title="کاربران"
        columns={columns}
        queryKeyFactory={(params) => ["foundation-users", params]}
        queryFn={async (params) => {
          const data = await adminListUsers({ page: params.page, limit: params.limit, q: params.search, ...(params.filters as Record<string, unknown>) });
          return {
            items: data.items,
            meta: {
              page: data.meta.page,
              limit: data.meta.limit,
              total: data.meta.totalItems,
              totalPages: data.meta.totalPages,
              hasNextPage: data.meta.hasNextPage,
              hasPrevPage: data.meta.hasPrevPage,
            },
          };
        }}
        filtersConfig={[
          { type: "status", key: "role", label: "نقش", options: (meta.data?.roles ?? []).map((item) => ({ label: faLabels.userRole[item as UserSafeDto["role"]] ?? item, value: item })) },
          { type: "status", key: "status", label: "وضعیت", options: (meta.data?.statuses ?? []).map((item) => ({ label: faLabels.userStatus[item as UserSafeDto["status"]] ?? item, value: item })) },
          { type: "status", key: "kycStatus", label: "وضعیت احراز هویت", options: (meta.data?.kycStatuses ?? []).map((item) => ({ label: faLabels.kycStatus[item as keyof typeof faLabels.kycStatus] ?? item, value: item })) },
          { type: "status", key: "kycLevel", label: "سطح احراز هویت", options: (meta.data?.kycLevels ?? []).map((item) => ({ label: faLabels.kycLevel[item as keyof typeof faLabels.kycLevel] ?? item, value: item })) },
          { type: "status", key: "tahesabLinked", label: "ته‌حساب", options: [{ label: "متصل", value: "true" }, { label: "نامتصل", value: "false" }] },
          { type: "status", key: "customerGroupId", label: "گروه", options: (groups.data ?? []).map((group) => ({ label: group.name, value: group.id })) },
        ]}
        rowActions={(row) => (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline"><Link href={`/admin/users/${row.id}`}>مشاهده</Link></Button>
            <Button size="sm" onClick={() => { setEditing(row); form.reset(row); }}>ویرایش</Button>
          </div>
        )}
      />

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>ویرایش کاربر</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>نام کامل</Label><Input {...form.register("fullName")} /></div>
            <div><Label>ایمیل</Label><Input {...form.register("email")} /></div>
            <div>
              <Label>نقش</Label>
              <Select value={form.watch("role") ?? ""} onValueChange={(value: UserSafeDto["role"]) => form.setValue("role", value)}>
                <SelectTrigger><SelectValue placeholder="انتخاب نقش" /></SelectTrigger>
                <SelectContent>
                  {(meta.data?.roles ?? []).map((role) => (
                    <SelectItem key={role} value={role}>{faLabels.userRole[role as UserSafeDto["role"]] ?? role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>وضعیت</Label>
              <Select value={form.watch("status") ?? ""} onValueChange={(value: UserSafeDto["status"]) => form.setValue("status", value)}>
                <SelectTrigger><SelectValue placeholder="انتخاب وضعیت" /></SelectTrigger>
                <SelectContent>
                  {(meta.data?.statuses ?? []).map((status) => (
                    <SelectItem key={status} value={status}>{faLabels.userStatus[status as UserSafeDto["status"]] ?? status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>گروه مشتری</Label>
              <Select value={form.watch("customerGroupId") ?? "none"} onValueChange={(value) => form.setValue("customerGroupId", value === "none" ? null : value)}>
                <SelectTrigger><SelectValue placeholder="انتخاب گروه" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون گروه</SelectItem>
                  {(groups.data ?? []).map((group) => <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>کد ته‌حساب</Label><Input {...form.register("tahesabCustomerCode")} /></div>
            <Button disabled={!editing || patchMutation.isPending} onClick={form.handleSubmit((values) => editing && patchMutation.mutate({ id: editing.id, body: values }))}>ذخیره</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
