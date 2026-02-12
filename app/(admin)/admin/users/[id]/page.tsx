"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminApplyUserProductLimits,
  adminGetEffectivePolicy,
  adminGetUserLimitReservations,
  adminGetUserLimitUsage,
  adminGetUserOverview,
  adminGetUserProductLimitsGrid,
  adminListPolicyAudit,
  adminListUserWalletAccounts,
  adminUpdateUserKyc,
  adminWalletAdjust,
  resyncUser,
} from "@/lib/api/foundation";
import type { PolicySummary } from "@/lib/contracts/foundation/dtos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { faLabels } from "@/lib/i18n/fa";
import { formatApiErrorFa } from "@/lib/contracts/errors";
import { useToast } from "@/hooks/use-toast";

interface WalletAdjustForm {
  instrumentCode: string;
  amount: string;
  reason: string;
  externalRef?: string;
}

interface KycForm {
  status: "NONE" | "PENDING" | "VERIFIED" | "REJECTED";
  level: "NONE" | "BASIC" | "FULL";
  reason: string;
}

interface ProductLimitCell {
  effectiveValue: number | null;
  source: string;
}

interface ProductLimitRow {
  productId: string;
  displayName: string;
  limits: {
    buyDaily: ProductLimitCell;
    buyMonthly: ProductLimitCell;
    sellDaily: ProductLimitCell;
    sellMonthly: ProductLimitCell;
  };
}

interface ProductLimitGroup {
  groupKey: string;
  items: ProductLimitRow[];
}

interface ProductLimitsResponse {
  groups: ProductLimitGroup[];
}

type LimitField = "buyDaily" | "buyMonthly" | "sellDaily" | "sellMonthly";

export default function AdminUserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [traceJson, setTraceJson] = useState<string>("");
  const [adjustForm, setAdjustForm] = useState<WalletAdjustForm>({ instrumentCode: "", amount: "", reason: "" });
  const [kycForm, setKycForm] = useState<KycForm>({ status: "PENDING", level: "BASIC", reason: "" });
  const [productEdits, setProductEdits] = useState<Record<string, string>>({});

  const overview = useQuery({ queryKey: ["foundation-user-overview", id], queryFn: () => adminGetUserOverview(id, true) });
  const wallet = useQuery({ queryKey: ["foundation-user-wallet", id], queryFn: () => adminListUserWalletAccounts(id, { page: 1, limit: 50 }) });
  const productLimits = useQuery<ProductLimitsResponse>({ queryKey: ["foundation-user-product-limits", id], queryFn: () => adminGetUserProductLimitsGrid(id) as Promise<ProductLimitsResponse> });
  const usage = useQuery({ queryKey: ["foundation-user-limit-usage", id], queryFn: () => adminGetUserLimitUsage(id, { page: 1, limit: 20 }) });
  const reservations = useQuery({ queryKey: ["foundation-user-limit-reservations", id], queryFn: () => adminGetUserLimitReservations(id, { page: 1, limit: 20 }) });
  const audits = useQuery({ queryKey: ["foundation-policy-audit", id], queryFn: () => adminListPolicyAudit({ page: 1, limit: 20, entityId: id }) });

  const adjustMutation = useMutation({
    mutationFn: () => adminWalletAdjust(id, adjustForm),
    onSuccess: () => toast({ title: faLabels.common.success }),
    onError: (error) => toast({ title: formatApiErrorFa(error), variant: "destructive" }),
  });

  const kycMutation = useMutation({
    mutationFn: () => adminUpdateUserKyc(id, kycForm),
    onSuccess: () => toast({ title: faLabels.common.success }),
    onError: (error) => toast({ title: formatApiErrorFa(error), variant: "destructive" }),
  });

  const resyncMutation = useMutation({
    mutationFn: () => resyncUser(id),
    onSuccess: () => toast({ title: faLabels.common.success }),
    onError: (error) => toast({ title: formatApiErrorFa(error), variant: "destructive" }),
  });

  const applyLimitsMutation = useMutation({
    mutationFn: async () => {
      const changes = Object.entries(productEdits).reduce<Array<Record<string, unknown>>>((acc, [key, value]) => {
        const [productId, field] = key.split("|") as [string, LimitField];
        const input = value.trim();
        const groups = productLimits.data?.groups ?? [];
        const row = groups.flatMap((group) => group.items).find((item) => item.productId === productId);
        const current = row?.limits[field]?.effectiveValue;

        if (input === "") {
          if (row?.limits[field]?.source === "USER") {
            acc.push({ productId, [field]: { mode: "CLEAR" } });
          }
          return acc;
        }

        const numeric = Number(input);
        if (Number.isFinite(numeric) && numeric > 0) {
          const same = current !== null && Number(current) === numeric;
          if (!same) {
            acc.push({ productId, [field]: { mode: "SET", value: numeric } });
          }
        }
        return acc;
      }, []);

      return adminApplyUserProductLimits(id, { changes });
    },
    onSuccess: () => {
      toast({ title: faLabels.common.success });
      setProductEdits({});
      queryClient.invalidateQueries({ queryKey: ["foundation-user-product-limits", id] });
    },
    onError: (error) => toast({ title: formatApiErrorFa(error), variant: "destructive" }),
  });

  const summary = overview.data?.policy.summary;

  const policyCards = useMemo(() => {
    if (!summary) return [];
    const items: Array<{ title: string; value: PolicySummary["withdraw"] }> = [
      { title: "برداشت ریالی", value: summary.withdrawIrr },
      { title: "خرید", value: summary.tradeBuyNotionalIrr },
      { title: "فروش", value: summary.tradeSellNotionalIrr },
    ];
    return items;
  }, [summary]);

  const allProductRows = (productLimits.data?.groups ?? []).flatMap((group) => group.items);

  if (overview.isLoading) return <div>{faLabels.common.loading}</div>;
  if (!overview.data) return <div>{faLabels.common.fetchError}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{overview.data.user.fullName}</h1>
          <p className="text-sm text-muted-foreground">{overview.data.user.mobile} - {overview.data.user.email}</p>
        </div>
        <Button onClick={() => resyncMutation.mutate()}>{faLabels.common.resync} کاربر</Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="overview">نمای کلی</TabsTrigger>
          <TabsTrigger value="wallet">کیف پول</TabsTrigger>
          <TabsTrigger value="kyc">احراز هویت</TabsTrigger>
          <TabsTrigger value="settings">تنظیمات</TabsTrigger>
          <TabsTrigger value="policy">پالیسی</TabsTrigger>
          <TabsTrigger value="product-limits">محدودیت‌های محصول</TabsTrigger>
          <TabsTrigger value="usage">مصرف محدودیت‌ها</TabsTrigger>
          <TabsTrigger value="reservations">رزروهای محدودیت</TabsTrigger>
          <TabsTrigger value="audit">لاگ پالیسی</TabsTrigger>
          <TabsTrigger value="tahesab">ته‌حساب</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>نمای کلی</CardTitle></CardHeader><CardContent className="space-y-1 text-sm"><p>نقش: {faLabels.userRole[overview.data.user.role]}</p><p>وضعیت: {faLabels.userStatus[overview.data.user.status]}</p><p>گروه: {overview.data.customerGroup?.name ?? "—"}</p></CardContent></Card>
        </TabsContent>

        <TabsContent value="wallet">
          <Card>
            <CardHeader><CardTitle>کیف پول</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(wallet.data?.items ?? []).map((item) => (
                <div key={item.id} className="rounded border p-2 text-sm">
                  <p>{item.instrument.code} - {item.instrument.name}</p>
                  <p>موجودی: {item.balancesHidden || item.balance === null ? "مخفی" : item.balance}</p>
                  <p>قابل استفاده: {item.availableBalance ?? "—"}</p>
                </div>
              ))}
              <div className="grid gap-2 md:grid-cols-2">
                <div><Label>کد دارایی</Label><Input value={adjustForm.instrumentCode} onChange={(e) => setAdjustForm((prev) => ({ ...prev, instrumentCode: e.target.value }))} /></div>
                <div><Label>مبلغ</Label><Input value={adjustForm.amount} onChange={(e) => setAdjustForm((prev) => ({ ...prev, amount: e.target.value }))} /></div>
                <div><Label>علت/توضیح</Label><Input value={adjustForm.reason} onChange={(e) => setAdjustForm((prev) => ({ ...prev, reason: e.target.value }))} /></div>
                <div><Label>شناسه خارجی</Label><Input value={adjustForm.externalRef ?? ""} onChange={(e) => setAdjustForm((prev) => ({ ...prev, externalRef: e.target.value }))} /></div>
              </div>
              <Button onClick={() => adjustMutation.mutate()}>{faLabels.common.apply}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc">
          <Card><CardHeader><CardTitle>احراز هویت</CardTitle></CardHeader><CardContent className="space-y-2"><p>وضعیت فعلی: {overview.data.kyc ? faLabels.kycStatus[overview.data.kyc.status as KycForm["status"]] : faLabels.kycStatus.NONE}</p><div className="grid gap-2 md:grid-cols-3"><div><Label>وضعیت</Label><Select value={kycForm.status} onValueChange={(value: KycForm["status"]) => setKycForm((prev) => ({ ...prev, status: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="NONE">{faLabels.kycStatus.NONE}</SelectItem><SelectItem value="PENDING">{faLabels.kycStatus.PENDING}</SelectItem><SelectItem value="VERIFIED">{faLabels.kycStatus.VERIFIED}</SelectItem><SelectItem value="REJECTED">{faLabels.kycStatus.REJECTED}</SelectItem></SelectContent></Select></div><div><Label>سطح</Label><Select value={kycForm.level} onValueChange={(value: KycForm["level"]) => setKycForm((prev) => ({ ...prev, level: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="NONE">{faLabels.kycLevel.NONE}</SelectItem><SelectItem value="BASIC">{faLabels.kycLevel.BASIC}</SelectItem><SelectItem value="FULL">{faLabels.kycLevel.FULL}</SelectItem></SelectContent></Select></div><div><Label>علت/توضیح</Label><Input value={kycForm.reason} onChange={(e) => setKycForm((prev) => ({ ...prev, reason: e.target.value }))} /></div></div><Button onClick={() => kycMutation.mutate()}>{faLabels.common.save}</Button><Button asChild variant="outline"><Link href="/admin/kyc">رفتن به صف احراز هویت</Link></Button></CardContent></Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader><CardTitle>تنظیمات</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>کلید</TableHead><TableHead>مقدار موثر</TableHead><TableHead>منبع</TableHead></TableRow></TableHeader>
                <TableBody>
                  {Object.entries(overview.data.settings.effective).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>{faLabels.settingsKeys[key as keyof typeof faLabels.settingsKeys] ?? key}</TableCell>
                      <TableCell>{String(value)}</TableCell>
                      <TableCell>{String(overview.data.settings.sources[key as keyof typeof overview.data.settings.sources] ?? "—")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policy">
          <div className="space-y-2">
            {policyCards.map((item) => (
              <Card key={item.title}>
                <CardHeader><CardTitle>{item.title}</CardTitle></CardHeader>
                <CardContent className="text-sm">
                  <p>روزانه: {item.value.daily.limit ?? "—"} | سطح احراز هویت: {item.value.daily.kycRequiredLevel ?? "—"} | منبع: {faLabels.policySource[item.value.daily.source]}</p>
                  <p>ماهانه: {item.value.monthly.limit ?? "—"} | سطح احراز هویت: {item.value.monthly.kycRequiredLevel ?? "—"} | منبع: {faLabels.policySource[item.value.monthly.source]}</p>
                </CardContent>
              </Card>
            ))}
            <Card><CardHeader><CardTitle>تحلیل قوانین موثر</CardTitle></CardHeader><CardContent className="space-y-2"><Button onClick={async () => { const trace = await adminGetEffectivePolicy(id); setTraceJson(JSON.stringify(trace, null, 2)); }}>نمایش تحلیل قوانین</Button>{traceJson ? <pre className="text-xs overflow-auto">{traceJson}</pre> : null}</CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="product-limits">
          <Card>
            <CardHeader><CardTitle>محدودیت‌های محصول</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>محصول</TableHead>
                    <TableHead>خرید روزانه</TableHead>
                    <TableHead>خرید ماهانه</TableHead>
                    <TableHead>فروش روزانه</TableHead>
                    <TableHead>فروش ماهانه</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allProductRows.map((row) => {
                    const fields: LimitField[] = ["buyDaily", "buyMonthly", "sellDaily", "sellMonthly"];
                    return (
                      <TableRow key={row.productId}>
                        <TableCell>{row.displayName}</TableCell>
                        {fields.map((field) => {
                          const editKey = `${row.productId}|${field}`;
                          return (
                            <TableCell key={editKey}>
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">{row.limits[field].effectiveValue ?? "—"}</div>
                                <Input
                                  value={productEdits[editKey] ?? ""}
                                  placeholder={row.limits[field].source === "USER" ? "خالی = حذف override" : "مقدار جدید"}
                                  onChange={(event) => setProductEdits((prev) => ({ ...prev, [editKey]: event.target.value }))}
                                />
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Button onClick={() => applyLimitsMutation.mutate()}>اعمال</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage"><Card><CardHeader><CardTitle>مصرف محدودیت‌ها</CardTitle></CardHeader><CardContent><pre className="text-xs overflow-auto">{JSON.stringify(usage.data, null, 2)}</pre></CardContent></Card></TabsContent>
        <TabsContent value="reservations"><Card><CardHeader><CardTitle>رزروهای محدودیت</CardTitle></CardHeader><CardContent><pre className="text-xs overflow-auto">{JSON.stringify(reservations.data, null, 2)}</pre></CardContent></Card></TabsContent>
        <TabsContent value="audit"><Card><CardHeader><CardTitle>لاگ تغییرات پالیسی</CardTitle></CardHeader><CardContent><pre className="text-xs overflow-auto">{JSON.stringify(audits.data, null, 2)}</pre></CardContent></Card></TabsContent>

        <TabsContent value="tahesab"><Card><CardHeader><CardTitle>ته‌حساب</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p>فعال: {overview.data.tahesab.enabled ? "بله" : "خیر"}</p><p>کد مشتری: {overview.data.tahesab.customerCode ?? "—"}</p><p>گروه: {overview.data.tahesab.groupName ?? "—"}</p><pre className="text-xs overflow-auto">{JSON.stringify(overview.data.tahesab.lastOutbox, null, 2)}</pre></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
