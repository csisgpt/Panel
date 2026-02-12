"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { adminBulkUpsertPolicyRules, adminCreatePolicyRule, adminDeletePolicyRule, adminListPolicyRules, adminPatchPolicyRule } from "@/lib/api/foundation";
import type { PolicyRuleDto } from "@/lib/contracts/foundation/dtos";
import { formatApiErrorFa } from "@/lib/contracts/errors";
import { useToast } from "@/hooks/use-toast";

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

function toPayload(form: PolicyRuleForm) {
  return {
    scopeType: form.scopeType,
    scopeUserId: form.scopeType === "USER" ? form.scopeUserId || null : null,
    scopeGroupId: form.scopeType === "GROUP" ? form.scopeGroupId || null : null,
    productId: form.selectorKind === "PRODUCT" ? form.selectorValue || null : null,
    instrumentId: form.selectorKind === "INSTRUMENT" ? form.selectorValue || null : null,
    instrumentType: form.selectorKind === "TYPE" ? form.selectorValue || null : null,
    action: form.action,
    metric: form.metric,
    period: form.period,
    limit: form.limit,
    minKycLevel: form.minKycLevel || null,
    enabled: form.enabled,
    priority: form.priority,
    note: form.note || null,
  };
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

export default function PolicyRulesPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PolicyRuleDto | null>(null);
  const [form, setForm] = useState<PolicyRuleForm>(defaultForm);
  const [rawJson, setRawJson] = useState('{"items":[]}');

  const saveMutation = useMutation({
    mutationFn: () => (editingRule ? adminPatchPolicyRule(editingRule.id, toPayload(form)) : adminCreatePolicyRule(toPayload(form))),
    onSuccess: () => {
      setOpen(false);
      setEditingRule(null);
      setForm(defaultForm);
      qc.invalidateQueries({ queryKey: ["foundation-policy-rules"] });
      toast({ title: "عملیات موفق بود" });
    },
    onError: (error) => toast({ title: formatApiErrorFa(error), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeletePolicyRule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["foundation-policy-rules"] }),
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
      toast({ title: "عملیات موفق بود" });
    },
    onError: (error) => toast({ title: formatApiErrorFa(error), variant: "destructive" }),
  });

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button onClick={() => { setEditingRule(null); setForm(defaultForm); setOpen(true); }}>ثبت قانون</Button>
        <Button variant="outline" onClick={() => setBulkOpen(true)}>اعمال گروهی</Button>
      </div>

      <ServerTableView<PolicyRuleDto>
        storageKey="foundation-policy-rules"
        title="قوانین پالیسی"
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
            <Button size="sm" onClick={() => { setEditingRule(row); setForm(toForm(row)); setOpen(true); }}>ویرایش</Button>
            <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(row.id)}>حذف</Button>
          </div>
        )}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>فرم قانون پالیسی</DialogTitle></DialogHeader>
          <div className="grid gap-2">
            <Label>دامنه</Label>
            <Select value={form.scopeType} onValueChange={(value: PolicyRuleForm["scopeType"]) => setForm((prev) => ({ ...prev, scopeType: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="GLOBAL">سراسری</SelectItem>
                <SelectItem value="GROUP">گروه</SelectItem>
                <SelectItem value="USER">کاربر</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="شناسه کاربر (اختیاری)" value={form.scopeUserId} onChange={(e) => setForm((prev) => ({ ...prev, scopeUserId: e.target.value }))} />
            <Input placeholder="شناسه گروه (اختیاری)" value={form.scopeGroupId} onChange={(e) => setForm((prev) => ({ ...prev, scopeGroupId: e.target.value }))} />

            <Label>نوع انتخابگر</Label>
            <Select value={form.selectorKind} onValueChange={(value: PolicyRuleForm["selectorKind"]) => setForm((prev) => ({ ...prev, selectorKind: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">همه</SelectItem>
                <SelectItem value="PRODUCT">محصول</SelectItem>
                <SelectItem value="INSTRUMENT">دارایی</SelectItem>
                <SelectItem value="TYPE">نوع دارایی</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="مقدار انتخابگر (شناسه محصول/دارایی/نوع)" value={form.selectorValue} onChange={(e) => setForm((prev) => ({ ...prev, selectorValue: e.target.value }))} />

            <Input placeholder="عملیات (مثال: WITHDRAW_IRR)" value={form.action} onChange={(e) => setForm((prev) => ({ ...prev, action: e.target.value as PolicyRuleDto["action"] }))} />
            <Input placeholder="معیار (مثال: NOTIONAL_IRR)" value={form.metric} onChange={(e) => setForm((prev) => ({ ...prev, metric: e.target.value as PolicyRuleDto["metric"] }))} />
            <Select value={form.period} onValueChange={(value: PolicyRuleForm["period"]) => setForm((prev) => ({ ...prev, period: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="DAILY">روزانه</SelectItem><SelectItem value="MONTHLY">ماهانه</SelectItem></SelectContent>
            </Select>
            <Input placeholder="حد به صورت رشته عددی" value={form.limit} onChange={(e) => setForm((prev) => ({ ...prev, limit: e.target.value }))} />
            <Select value={form.minKycLevel || ""} onValueChange={(value: PolicyRuleForm["minKycLevel"]) => setForm((prev) => ({ ...prev, minKycLevel: value }))}>
              <SelectTrigger><SelectValue placeholder="حداقل سطح احراز هویت" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">بدون سطح</SelectItem>
                <SelectItem value="NONE">بدون سطح</SelectItem>
                <SelectItem value="BASIC">پایه</SelectItem>
                <SelectItem value="FULL">کامل</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" placeholder="اولویت" value={String(form.priority)} onChange={(e) => setForm((prev) => ({ ...prev, priority: Number(e.target.value || 0) }))} />
            <Input placeholder="یادداشت" value={form.note} onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))} />
            <div className="flex items-center justify-between"><Label>فعال</Label><Switch checked={form.enabled} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, enabled: checked }))} /></div>
            <Button onClick={() => saveMutation.mutate()}>ذخیره</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>اعمال گروهی قوانین</DialogTitle></DialogHeader>
          <Textarea rows={12} value={rawJson} onChange={(e) => setRawJson(e.target.value)} />
          <Button onClick={() => bulkMutation.mutate()}>اعمال</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
