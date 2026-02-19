"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { ServerTableView } from "@/components/kit/table/server-table-view";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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

// مطابق payload مدنظر شما
interface UserEditForm {
  fullName: string;
  email: string;
  role: UserSafeDto["role"];
  status: UserSafeDto["status"];
  customerGroupId: string | null;
  tahesabCustomerCode: string | null;
}

const DEFAULT_FORM: UserEditForm = {
  fullName: "",
  email: "",
  role: "CLIENT",
  status: "ACTIVE",
  customerGroupId: null,
  tahesabCustomerCode: null,
};

function toEditForm(row: AdminUsersRow): UserEditForm {
  return {
    fullName: row.fullName ?? "",
    email: row.email ?? "",
    role: row.role,
    status: row.status,
    customerGroupId: row.customerGroupId ?? null,
    tahesabCustomerCode: row.tahesabCustomerCode ?? null,
  };
}

function normalizeUserPayload(values: UserEditForm): UserEditForm {
  const fullName = values.fullName.trim();
  const email = values.email.trim();
  const tahesabCustomerCode = (values.tahesabCustomerCode ?? "").trim();

  return {
    ...values,
    fullName,
    email,
    tahesabCustomerCode: tahesabCustomerCode ? tahesabCustomerCode : null,
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

export default function AdminUsersPage() {
  const [editing, setEditing] = useState<AdminUsersRow | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const groups = useQuery({ queryKey: ["foundation-groups"], queryFn: adminListCustomerGroups });
  const meta = useQuery({ queryKey: ["foundation-users-meta"], queryFn: adminGetUsersMeta });

  const form = useForm<UserEditForm>({
    defaultValues: DEFAULT_FORM,
    mode: "onSubmit",
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UserEditForm }) => adminPatchUser(id, body),
    onSuccess: () => {
      toast({ title: faLabels.common.success , variant: "success"} );
      setEditing(null);
      form.reset(DEFAULT_FORM);
      queryClient.invalidateQueries({ queryKey: ["foundation-users"] });
    },
    onError: (error) => {
      applyApiValidationErrorsToRHF(error, form.setError);
      toast({ title: formatApiErrorFa(error), variant: "destructive" });
    },
  });

  const columns: ColumnDef<AdminUsersRow>[] = useMemo(
    () => [
      { accessorKey: "id", header: "شناسه" },
      {
        id: "fullName",
        header: "نام کامل",
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-medium">{row.original.fullName}</div>
            <div className="text-xs text-muted-foreground">{row.original.mobile}</div>
          </div>
        ),
      },
      { accessorKey: "email", header: "ایمیل" },
      { id: "role", header: "نقش", cell: ({ row }) => <Badge variant="outline">{faLabels.userRole[row.original.role]}</Badge> },
      { id: "status", header: "وضعیت", cell: ({ row }) => <Badge>{faLabels.userStatus[row.original.status]}</Badge> },
      { id: "customerGroup", header: "گروه مشتری", cell: ({ row }) => row.original.customerGroup?.name ?? "—" },
      {
        id: "kyc",
        header: "احراز هویت",
        cell: ({ row }) =>
          row.original.kyc
            ? `${faLabels.kycStatus[row.original.kyc.status]} / ${faLabels.kycLevel[row.original.kyc.level]}`
            : faLabels.kycStatus.NONE,
      },
      { accessorKey: "tahesabCustomerCode", header: "کد ته‌حساب", cell: ({ row }) => row.original.tahesabCustomerCode ?? "—" },
      { id: "createdAt", header: "تاریخ ایجاد", cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("fa-IR") },
    ],
    []
  );

  const openEdit = (row: AdminUsersRow) => {
    setEditing(row);
    form.reset(toEditForm(row)); // ✅ فقط فیلدهای موردنیاز
  };

  const closeEdit = () => {
    setEditing(null);
    form.reset(DEFAULT_FORM);
  };

  const roles = (meta.data?.roles ?? []) as Array<UserSafeDto["role"]>;
  const statuses = (meta.data?.statuses ?? []) as Array<UserSafeDto["status"]>;

  return (
    <>
      <ServerTableView<AdminUsersRow>
        storageKey="foundation-admin-users"
        title="کاربران"
        description="جستجو، فیلتر و ویرایش اطلاعات پایه کاربران"
        columns={columns}
        queryKeyFactory={(params) => ["foundation-users", params]}
        queryFn={async (params) => {
          const data = await adminListUsers({
            page: params.page,
            limit: params.limit,
            q: params.search,
            ...(params.filters as Record<string, unknown>),
          });
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
          {
            type: "status",
            key: "role",
            label: "نقش",
            options: roles.map((item) => ({ label: faLabels.userRole[item] ?? item, value: item })),
          },
          {
            type: "status",
            key: "status",
            label: "وضعیت",
            options: statuses.map((item) => ({ label: faLabels.userStatus[item] ?? item, value: item })),
          },
          {
            type: "status",
            key: "kycStatus",
            label: "وضعیت احراز هویت",
            options: (meta.data?.kycStatuses ?? []).map((item) => ({
              label: faLabels.kycStatus[item as keyof typeof faLabels.kycStatus] ?? item,
              value: item,
            })),
          },
          {
            type: "status",
            key: "kycLevel",
            label: "سطح احراز هویت",
            options: (meta.data?.kycLevels ?? []).map((item) => ({
              label: faLabels.kycLevel[item as keyof typeof faLabels.kycLevel] ?? item,
              value: item,
            })),
          },
          {
            type: "status",
            key: "tahesabLinked",
            label: "ته‌حساب",
            options: [
              { label: "متصل", value: "true" },
              { label: "نامتصل", value: "false" },
            ],
          },
          {
            type: "status",
            key: "customerGroupId",
            label: "گروه",
            options: (groups.data ?? []).map((group) => ({ label: group.name, value: group.id })),
          },
        ]}
        rowActions={(row) => (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/admin/users/${row.id}`}>مشاهده</Link>
            </Button>
            <Button size="sm" onClick={() => openEdit(row)}>
              ویرایش
            </Button>
          </div>
        )}
      />

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>ویرایش کاربر</DialogTitle>
            <DialogDescription>
              اطلاعات پایه کاربر را تغییر دهید. (شناسه: {editing?.id ?? "—"})
            </DialogDescription>
          </DialogHeader>

          {/* برای Select ها بهتره hidden register داشته باشیم */}
          <input type="hidden" {...form.register("role")} />
          <input type="hidden" {...form.register("status")} />
          <input type="hidden" {...form.register("customerGroupId")} />

          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6 px-5 py-4">
              {/* خلاصه */}
              {editing ? (
                <div className="rounded-xl border bg-muted/20 p-4 text-sm">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <div className="text-xs text-muted-foreground">موبایل</div>
                      <div className="font-medium">{editing.mobile}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">گروه فعلی</div>
                      <div className="font-medium">{editing.customerGroup?.name ?? "—"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">KYC</div>
                      <div className="font-medium">
                        {editing.kyc
                          ? `${faLabels.kycStatus[editing.kyc.status]} / ${faLabels.kycLevel[editing.kyc.level]}`
                          : faLabels.kycStatus.NONE}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* فیلدها */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>نام کامل</Label>
                  <Input {...form.register("fullName")} />
                  <FieldError message={form.formState.errors.fullName?.message} />
                </div>

                <div>
                  <Label>ایمیل</Label>
                  <Input dir="ltr" {...form.register("email")} />
                  <FieldError message={form.formState.errors.email?.message} />
                </div>

                <div>
                  <Label>نقش</Label>
                  <Select
                    value={form.watch("role")}
                    onValueChange={(value: UserSafeDto["role"]) => form.setValue("role", value, { shouldDirty: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب نقش" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {faLabels.userRole[role] ?? role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError message={form.formState.errors.role?.message} />
                </div>

                <div>
                  <Label>وضعیت</Label>
                  <Select
                    value={form.watch("status")}
                    onValueChange={(value: UserSafeDto["status"]) => form.setValue("status", value, { shouldDirty: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب وضعیت" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {faLabels.userStatus[status] ?? status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError message={form.formState.errors.status?.message} />
                </div>

                <div className="md:col-span-2">
                  <Label>گروه مشتری</Label>
                  <Select
                    value={form.watch("customerGroupId") ?? "none"}
                    onValueChange={(value) =>
                      form.setValue("customerGroupId", value === "none" ? null : value, { shouldDirty: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب گروه" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون گروه</SelectItem>
                      {(groups.data ?? []).map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError message={form.formState.errors.customerGroupId?.message} />
                </div>

                <div className="md:col-span-2">
                  <Label>کد ته‌حساب</Label>
                  <Input
                    dir="ltr"
                    {...form.register("tahesabCustomerCode", {
                      setValueAs: (v) => (typeof v === "string" ? v : ""),
                    })}
                  />
                  <FieldError message={form.formState.errors.tahesabCustomerCode?.message} />
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={closeEdit} disabled={patchMutation.isPending}>
              بستن
            </Button>
            <Button
              disabled={!editing || patchMutation.isPending}
              onClick={form.handleSubmit((values) => {
                if (!editing) return;
                const body = normalizeUserPayload(values);
                // ✅ payload دقیقاً مطابق فرم و بدون فیلدهای اضافه
                patchMutation.mutate({ id: editing.id, body });
              })}
            >
              {patchMutation.isPending ? "در حال ذخیره…" : "ذخیره"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
