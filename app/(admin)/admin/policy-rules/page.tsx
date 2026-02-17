"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

import {
  adminBulkUpsertPolicyRules,
  adminCreatePolicyRule,
  adminDeletePolicyRule,
  adminListPolicyRules,
  adminPatchPolicyRule,
} from "@/lib/api/foundation";
import type { PolicyRuleDto } from "@/lib/contracts/foundation/dtos";
import { formatApiErrorFa } from "@/lib/contracts/errors";
import { useToast } from "@/hooks/use-toast";
import { faLabels } from "@/lib/i18n/fa";
import { applyApiValidationErrorsToRHF } from "@/lib/forms/apply-api-errors";

interface PolicyRuleForm {
  scopeType: "GLOBAL" | "GROUP" | "USER";
  scopeUserId: string;
  scopeGroupId: string;

  selectorKind: "ALL" | "PRODUCT" | "INSTRUMENT" | "TYPE";
  selectorValue: string;

  action: PolicyRuleDto["action"];
  metric: PolicyRuleDto["metric"];
  period: PolicyRuleDto["period"];
  limit: string;

  minKycLevel: "NONE" | "BASIC" | "FULL" | "";
  enabled: boolean;
  priority: number;
  note: string;
}

const defaultForm: PolicyRuleForm = {
  scopeType: "GLOBAL",
  scopeUserId: "",
  scopeGroupId: "",
  selectorKind: "ALL",
  selectorValue: "",
  action: "WITHDRAW_IRR",
  metric: "NOTIONAL_IRR",
  period: "DAILY",
  limit: "1",
  minKycLevel: "",
  enabled: true,
  priority: 100,
  note: "",
};

function selectorLabel(rule: PolicyRuleDto) {
  if (rule.productId) return "محصول";
  if (rule.instrumentId) return "دارایی";
  if (rule.instrumentType) return "نوع دارایی";
  return "همه";
}

type UpsertPayload = Omit<PolicyRuleDto, "id" | "updatedAt">;

function toPayload(form: PolicyRuleForm): UpsertPayload {
  return {
    scopeType: form.scopeType,
    scopeUserId: form.scopeType === "USER" ? (form.scopeUserId || null) : null,
    scopeGroupId: form.scopeType === "GROUP" ? (form.scopeGroupId || null) : null,
    productId: form.selectorKind === "PRODUCT" ? (form.selectorValue || null) : null,
    instrumentId: form.selectorKind === "INSTRUMENT" ? (form.selectorValue || null) : null,
    instrumentType: form.selectorKind === "TYPE" ? (form.selectorValue || null) : null,
    action: form.action,
    metric: form.metric,
    period: form.period,
    limit: form.limit,
    minKycLevel: form.minKycLevel || null,
    enabled: form.enabled,
    priority: form.priority,
    note: form.note || null,
    createdAt: new Date().toISOString(), // اگر در DTO اجباری نیست، می‌تونی حذفش کنی
  } as unknown as UpsertPayload;
}

function toForm(rule: PolicyRuleDto): PolicyRuleForm {
  const selectorKind = rule.productId ? "PRODUCT" : rule.instrumentId ? "INSTRUMENT" : rule.instrumentType ? "TYPE" : "ALL";
  const selectorValue = rule.productId ?? rule.instrumentId ?? rule.instrumentType ?? "";
  return {
    scopeType: rule.scopeType,
    scopeUserId: rule.scopeUserId ?? "",
    scopeGroupId: rule.scopeGroupId ?? "",
    selectorKind,
    selectorValue,
    action: rule.action,
    metric: rule.metric,
    period: rule.period,
    limit: rule.limit,
    minKycLevel: (rule.minKycLevel ?? "") as PolicyRuleForm["minKycLevel"],
    enabled: rule.enabled,
    priority: rule.priority,
    note: rule.note ?? "",
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

export default function PolicyRulesPage() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PolicyRuleDto | null>(null);

  const form = useForm<PolicyRuleForm>({ defaultValues: defaultForm });
  const scopeType = form.watch("scopeType");
  const selectorKind = form.watch("selectorKind");

  const [rawJson, setRawJson] = useState('{"items":[]}');

  const saveMutation = useMutation({
    mutationFn: async ({ id, payload }: { id?: string; payload: UpsertPayload }) => {
      return id ? adminPatchPolicyRule(id, payload) : adminCreatePolicyRule(payload);
    },
    onSuccess: () => {
      setOpen(false);
      setEditingRule(null);
      form.reset(defaultForm);
      qc.invalidateQueries({ queryKey: ["foundation-policy-rules"] });
      toast({ title: faLabels.common.success });
    },
    onError: (error) => {
      applyApiValidationErrorsToRHF(error, form.setError);
      toast({ title: formatApiErrorFa(error), variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeletePolicyRule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["foundation-policy-rules"] }),
    onError: (error) => toast({ title: formatApiErrorFa(error), variant: "destructive" }),
  });

  const bulkMutation = useMutation({
    mutationFn: () => {
      try {
        return adminBulkUpsertPolicyRules(JSON.parse(rawJson) as { items: Array<Omit<PolicyRuleDto, "id" | "updatedAt">> });
      } catch {
        toast({ title: "JSON ورودی معتبر نیست", variant: "destructive" });
        throw new Error("INVALID_BULK_JSON");
      }
    },
    onSuccess: () => {
      setBulkOpen(false);
      qc.invalidateQueries({ queryKey: ["foundation-policy-rules"] });
      toast({ title: faLabels.common.success });
    },
    onError: (error) => toast({ title: formatApiErrorFa(error), variant: "destructive" }),
  });

  const openCreate = () => {
    setEditingRule(null);
    form.reset(defaultForm);
    setOpen(true);
  };

  const openEdit = (rule: PolicyRuleDto) => {
    setEditingRule(rule);
    form.reset(toForm(rule));
    setOpen(true);
  };

  const selectorKindLabel: Record<PolicyRuleForm["selectorKind"], string> = {
    ALL: "همه",
    PRODUCT: "محصول",
    INSTRUMENT: "دارایی",
    TYPE: "نوع دارایی",
  };

  const kycValue = form.watch("minKycLevel") || "";
  const isEditing = Boolean(editingRule);

  const bulkParsed = useMemo(() => {
    try {
      const parsed = JSON.parse(rawJson);
      const count = Array.isArray(parsed?.items) ? parsed.items.length : 0;
      return { ok: true as const, count };
    } catch {
      return { ok: false as const, count: 0 };
    }
  }, [rawJson]);

  return (
    <div className="space-y-4">
      {/* اکشن‌های بالا */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card px-4 py-3">
        <div className="space-y-1">
          <div className="text-lg font-semibold">قوانین پالیسی</div>
          <div className="text-sm text-muted-foreground">ثبت، ویرایش و اعمال گروهی قوانین محدودیت‌ها</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={openCreate}>ثبت قانون</Button>
          <Button variant="outline" onClick={() => setBulkOpen(true)}>اعمال گروهی</Button>
        </div>
      </div>

      <ServerTableView<PolicyRuleDto>
        storageKey="foundation-policy-rules"
        title="لیست قوانین"
        columns={[
          { accessorKey: "scopeType", header: "دامنه" },
          { id: "selector", header: "انتخابگر", cell: ({ row }) => selectorLabel(row.original) },
          { accessorKey: "action", header: "عملیات" },
          { accessorKey: "metric", header: "معیار" },
          { accessorKey: "period", header: "بازه" },
          { accessorKey: "limit", header: "حد" },
          { id: "enabled", header: "فعال", cell: ({ row }) => (row.original.enabled ? "بله" : "خیر") },
        ]}
        queryKeyFactory={(params) => ["foundation-policy-rules", params]}
        queryFn={async (params) => {
          const data = await adminListPolicyRules({ page: params.page, limit: params.limit, ...(params.filters as Record<string, unknown>) });
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
        rowActions={(row) => (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => openEdit(row)}>ویرایش</Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (window.confirm("آیا از حذف این قانون مطمئن هستید؟")) deleteMutation.mutate(row.id);
              }}
            >
              حذف
            </Button>
          </div>
        )}
      />

      {/* دیالوگ ثبت/ویرایش */}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setEditingRule(null);
            form.reset(defaultForm);
          }
        }}
      >
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "ویرایش قانون پالیسی" : "ثبت قانون پالیسی"}</DialogTitle>
            <DialogDescription>
              فیلدها را دقیق وارد کنید. دامنه و انتخابگر مشخص می‌کند این قانون روی چه کسی/چه چیزی اعمال شود.
            </DialogDescription>
          </DialogHeader>

          {/* hidden register برای فیلدهای Select */}
          <input type="hidden" {...form.register("scopeType")} />
          <input type="hidden" {...form.register("selectorKind")} />
          <input type="hidden" {...form.register("action")} />
          <input type="hidden" {...form.register("metric")} />
          <input type="hidden" {...form.register("period")} />
          <input type="hidden" {...form.register("minKycLevel")} />

          <ScrollArea className="max-h-[72vh]">
            <div className="space-y-6 px-5 py-4">
              {/* چیپ‌های خلاصه */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{faLabels.policyScopeType[scopeType]}</Badge>
                <Badge variant="outline">{selectorKindLabel[selectorKind]}</Badge>
                <Badge variant={form.watch("enabled") ? "success" : "secondary"}>
                  {form.watch("enabled") ? "فعال" : "غیرفعال"}
                </Badge>
              </div>

              <Separator />

              {/* دامنه */}
              <section className="space-y-3">
                <div className="text-sm font-semibold">دامنه</div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>نوع دامنه</Label>
                    <Select
                      value={scopeType}
                      onValueChange={(v: PolicyRuleForm["scopeType"]) => {
                        form.setValue("scopeType", v, { shouldDirty: true });
                        // پاکسازی فیلدهای بی‌ربط
                        if (v !== "USER") form.setValue("scopeUserId", "", { shouldDirty: true });
                        if (v !== "GROUP") form.setValue("scopeGroupId", "", { shouldDirty: true });
                      }}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GLOBAL">{faLabels.policyScopeType.GLOBAL}</SelectItem>
                        <SelectItem value="GROUP">{faLabels.policyScopeType.GROUP}</SelectItem>
                        <SelectItem value="USER">{faLabels.policyScopeType.USER}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError message={form.formState.errors.scopeType?.message} />
                  </div>

                  {scopeType === "USER" ? (
                    <div>
                      <Label>شناسه کاربر</Label>
                      <Input dir="ltr" placeholder="UserId" {...form.register("scopeUserId")} />
                      <FieldError message={form.formState.errors.scopeUserId?.message} />
                    </div>
                  ) : null}

                  {scopeType === "GROUP" ? (
                    <div>
                      <Label>شناسه گروه</Label>
                      <Input dir="ltr" placeholder="GroupId" {...form.register("scopeGroupId")} />
                      <FieldError message={form.formState.errors.scopeGroupId?.message} />
                    </div>
                  ) : null}
                </div>
              </section>

              <Separator />

              {/* انتخابگر */}
              <section className="space-y-3">
                <div className="text-sm font-semibold">انتخابگر</div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>نوع انتخابگر</Label>
                    <Select
                      value={selectorKind}
                      onValueChange={(v: PolicyRuleForm["selectorKind"]) => {
                        form.setValue("selectorKind", v, { shouldDirty: true });
                        if (v === "ALL") form.setValue("selectorValue", "", { shouldDirty: true });
                      }}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">همه</SelectItem>
                        <SelectItem value="PRODUCT">محصول</SelectItem>
                        <SelectItem value="INSTRUMENT">دارایی</SelectItem>
                        <SelectItem value="TYPE">نوع دارایی</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError message={form.formState.errors.selectorKind?.message} />
                  </div>

                  {selectorKind !== "ALL" ? (
                    <div>
                      <Label>مقدار انتخابگر</Label>
                      <Input
                        dir="ltr"
                        placeholder={selectorKind === "PRODUCT" ? "ProductId" : selectorKind === "INSTRUMENT" ? "InstrumentId" : "InstrumentType"}
                        {...form.register("selectorValue")}
                      />
                      <FieldError message={form.formState.errors.selectorValue?.message} />
                    </div>
                  ) : null}
                </div>
              </section>

              <Separator />

              {/* تنظیمات محدودیت */}
              <section className="space-y-3">
                <div className="text-sm font-semibold">محدودیت</div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>عملیات</Label>
                    <Select
                      value={form.watch("action")}
                      onValueChange={(v) => form.setValue("action", v as PolicyRuleDto["action"], { shouldDirty: true })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(faLabels.policyAction).map(([k, label]) => (
                          <SelectItem key={k} value={k}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={form.formState.errors.action?.message} />
                  </div>

                  <div>
                    <Label>معیار</Label>
                    <Select
                      value={form.watch("metric")}
                      onValueChange={(v) => form.setValue("metric", v as PolicyRuleDto["metric"], { shouldDirty: true })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(faLabels.policyMetric).map(([k, label]) => (
                          <SelectItem key={k} value={k}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={form.formState.errors.metric?.message} />
                  </div>

                  <div>
                    <Label>بازه</Label>
                    <Select
                      value={form.watch("period")}
                      onValueChange={(v) => form.setValue("period", v as PolicyRuleDto["period"], { shouldDirty: true })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAILY">{faLabels.policyPeriod.DAILY}</SelectItem>
                        <SelectItem value="MONTHLY">{faLabels.policyPeriod.MONTHLY}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError message={form.formState.errors.period?.message} />
                  </div>

                  <div className="md:col-span-1">
                    <Label>حد (عدد به صورت رشته)</Label>
                    <Input dir="ltr" inputMode="numeric" placeholder="مثال: 1000000" {...form.register("limit")} />
                    <FieldError message={form.formState.errors.limit?.message} />
                  </div>

                  <div>
                    <Label>حداقل سطح KYC</Label>
                    <Select
                      value={kycValue || "__EMPTY__"}
                      onValueChange={(v) => form.setValue("minKycLevel", (v === "__EMPTY__" ? "" : (v as any)), { shouldDirty: true })}
                    >
                      <SelectTrigger><SelectValue placeholder="بدون محدودیت" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__EMPTY__">بدون محدودیت</SelectItem>
                        <SelectItem value="NONE">NONE (بدون احراز)</SelectItem>
                        <SelectItem value="BASIC">پایه</SelectItem>
                        <SelectItem value="FULL">کامل</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError message={form.formState.errors.minKycLevel?.message} />
                  </div>

                  <div>
                    <Label>اولویت</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={String(form.watch("priority") ?? 0)}
                      onChange={(e) => form.setValue("priority", Number(e.target.value || 0), { shouldDirty: true })}
                    />
                    <FieldError message={form.formState.errors.priority?.message as string | undefined} />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border bg-muted/20 px-4 py-3">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">فعال بودن قانون</div>
                    <div className="text-xs text-muted-foreground">در صورت غیرفعال شدن، قانون در محاسبه اعمال نمی‌شود.</div>
                  </div>
                  <Switch
                    checked={form.watch("enabled")}
                    onCheckedChange={(checked) => form.setValue("enabled", checked, { shouldDirty: true })}
                  />
                </div>
              </section>

              <Separator />

              {/* یادداشت */}
              <section className="space-y-3">
                <div className="text-sm font-semibold">یادداشت</div>
                <div>
                  <Label>توضیحات</Label>
                  <Textarea rows={3} placeholder="اختیاری…" value={form.watch("note")} onChange={(e) => form.setValue("note", e.target.value, { shouldDirty: true })} />
                  <FieldError message={form.formState.errors.note?.message} />
                </div>
              </section>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setEditingRule(null);
                form.reset(defaultForm);
              }}
              disabled={saveMutation.isPending}
            >
              بستن
            </Button>

            <Button
              onClick={form.handleSubmit((values) => {
                const payload = toPayload(values);
                saveMutation.mutate({ id: editingRule?.id, payload });
              })}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "در حال ذخیره…" : "ذخیره"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* دیالوگ اعمال گروهی */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>اعمال گروهی قوانین</DialogTitle>
            <DialogDescription>
              فرمت ورودی باید به شکل <span className="font-mono">{"{ \"items\": [...] }"}</span> باشد.
              {bulkParsed.ok ? (
                <span className="mr-2 inline-flex items-center gap-2">
                  <Badge variant="success">JSON معتبر</Badge>
                  <span className="text-xs text-muted-foreground">تعداد آیتم‌ها: {bulkParsed.count}</span>
                </span>
              ) : (
                <span className="mr-2 inline-flex items-center gap-2">
                  <Badge variant="destructive">JSON نامعتبر</Badge>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 px-5 py-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setRawJson(
                    JSON.stringify(
                      {
                        items: [
                          {
                            scopeType: "GLOBAL",
                            scopeUserId: null,
                            scopeGroupId: null,
                            productId: null,
                            instrumentId: null,
                            instrumentType: null,
                            action: "WITHDRAW_IRR",
                            metric: "NOTIONAL_IRR",
                            period: "DAILY",
                            limit: "1",
                            minKycLevel: null,
                            enabled: true,
                            priority: 100,
                            note: "نمونه",
                            createdAt: new Date().toISOString(),
                          },
                        ],
                      },
                      null,
                      2
                    )
                  )
                }
              >
                قرار دادن نمونه
              </Button>
            </div>

            <Textarea rows={14} value={rawJson} onChange={(e) => setRawJson(e.target.value)} />

            <DialogFooter className="px-0 pb-0">
              <Button variant="outline" onClick={() => setBulkOpen(false)} disabled={bulkMutation.isPending}>
                بستن
              </Button>
              <Button onClick={() => bulkMutation.mutate()} disabled={bulkMutation.isPending || !bulkParsed.ok}>
                {bulkMutation.isPending ? "در حال اعمال…" : "اعمال"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
