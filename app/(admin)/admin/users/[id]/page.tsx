"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { adminApplyUserProductLimits, adminGetEffectivePolicy, adminGetUserLimitReservations, adminGetUserLimitUsage, adminGetUserOverview, adminGetUserProductLimitsGrid, adminListPolicyAudit, adminListUserWalletAccounts, adminUpdateUserKyc, adminWalletAdjust, resyncUser } from "@/lib/api/foundation";
import type { PolicySummary } from "@/lib/contracts/foundation/dtos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function AdminUserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [traceJson, setTraceJson] = useState<string>("");
  const [adjustForm, setAdjustForm] = useState<WalletAdjustForm>({ instrumentCode: "", amount: "", reason: "" });
  const [kycForm, setKycForm] = useState<KycForm>({ status: "PENDING", level: "BASIC", reason: "" });

  const overview = useQuery({ queryKey: ["foundation-user-overview", id], queryFn: () => adminGetUserOverview(id, true) });
  const wallet = useQuery({ queryKey: ["foundation-user-wallet", id], queryFn: () => adminListUserWalletAccounts(id, { page: 1, limit: 50 }) });
  const productLimits = useQuery({ queryKey: ["foundation-user-product-limits", id], queryFn: () => adminGetUserProductLimitsGrid(id) });
  const usage = useQuery({ queryKey: ["foundation-user-limit-usage", id], queryFn: () => adminGetUserLimitUsage(id, { page: 1, limit: 20 }) });
  const reservations = useQuery({ queryKey: ["foundation-user-limit-reservations", id], queryFn: () => adminGetUserLimitReservations(id, { page: 1, limit: 20 }) });
  const audits = useQuery({ queryKey: ["foundation-policy-audit", id], queryFn: () => adminListPolicyAudit({ page: 1, limit: 20, entityId: id }) });

  const adjustMutation = useMutation({ mutationFn: () => adminWalletAdjust(id, adjustForm), onSuccess: () => toast({ title: faLabels.common.success }), onError: (error) => toast({ title: formatApiErrorFa(error), variant: "destructive" }) });
  const kycMutation = useMutation({ mutationFn: () => adminUpdateUserKyc(id, kycForm), onSuccess: () => toast({ title: faLabels.common.success }), onError: (error) => toast({ title: formatApiErrorFa(error), variant: "destructive" }) });
  const resyncMutation = useMutation({ mutationFn: () => resyncUser(id), onSuccess: () => toast({ title: faLabels.common.success }), onError: (error) => toast({ title: formatApiErrorFa(error), variant: "destructive" }) });
  const applyLimitsMutation = useMutation({ mutationFn: () => adminApplyUserProductLimits(id, { changes: [] }), onSuccess: () => toast({ title: faLabels.common.success }) });

  const summary = overview.data?.policy.summary;
  const renderPolicyBlock = (title: string, item: PolicySummary["withdraw"]) => (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="text-sm">
        <p>روزانه: {item.daily.limit ?? "—"} | سطح KYC: {item.daily.kycRequiredLevel ?? "—"} | منبع: {faLabels.policySource[item.daily.source]}</p>
        <p>ماهانه: {item.monthly.limit ?? "—"} | سطح KYC: {item.monthly.kycRequiredLevel ?? "—"} | منبع: {faLabels.policySource[item.monthly.source]}</p>
      </CardContent>
    </Card>
  );

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

        <TabsContent value="overview"><Card><CardHeader><CardTitle>نمای کلی</CardTitle></CardHeader><CardContent className="space-y-1 text-sm"><p>نقش: {faLabels.userRole[overview.data.user.role]}</p><p>وضعیت: {faLabels.userStatus[overview.data.user.status]}</p><p>گروه: {overview.data.customerGroup?.name ?? "—"}</p></CardContent></Card></TabsContent>

        <TabsContent value="wallet"><Card><CardHeader><CardTitle>کیف پول</CardTitle></CardHeader><CardContent className="space-y-3">{(wallet.data?.items ?? []).map((item) => <div key={item.id} className="rounded border p-2 text-sm"><p>{item.instrument.code} - {item.instrument.name}</p><p>موجودی: {item.balancesHidden || item.balance === null ? "مخفی" : item.balance}</p><p>قابل استفاده: {item.availableBalance ?? "—"}</p></div>)}<div className="grid gap-2 md:grid-cols-2"><div><Label>کد دارایی</Label><Input value={adjustForm.instrumentCode} onChange={(e) => setAdjustForm((prev) => ({ ...prev, instrumentCode: e.target.value }))} /></div><div><Label>مبلغ</Label><Input value={adjustForm.amount} onChange={(e) => setAdjustForm((prev) => ({ ...prev, amount: e.target.value }))} /></div><div><Label>علت/توضیح</Label><Input value={adjustForm.reason} onChange={(e) => setAdjustForm((prev) => ({ ...prev, reason: e.target.value }))} /></div><div><Label>شناسه خارجی</Label><Input value={adjustForm.externalRef ?? ""} onChange={(e) => setAdjustForm((prev) => ({ ...prev, externalRef: e.target.value }))} /></div></div><Button onClick={() => adjustMutation.mutate()}>{faLabels.common.apply}</Button></CardContent></Card></TabsContent>

        <TabsContent value="kyc"><Card><CardHeader><CardTitle>احراز هویت</CardTitle></CardHeader><CardContent className="space-y-2"><p>وضعیت فعلی: {overview.data.kyc ? faLabels.kycStatus[overview.data.kyc.status as "NONE" | "PENDING" | "VERIFIED" | "REJECTED"] : faLabels.kycStatus.NONE}</p><div className="grid gap-2 md:grid-cols-3"><div><Label>وضعیت</Label><Select value={kycForm.status} onValueChange={(value: KycForm["status"]) => setKycForm((prev) => ({ ...prev, status: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="NONE">{faLabels.kycStatus.NONE}</SelectItem><SelectItem value="PENDING">{faLabels.kycStatus.PENDING}</SelectItem><SelectItem value="VERIFIED">{faLabels.kycStatus.VERIFIED}</SelectItem><SelectItem value="REJECTED">{faLabels.kycStatus.REJECTED}</SelectItem></SelectContent></Select></div><div><Label>سطح</Label><Select value={kycForm.level} onValueChange={(value: KycForm["level"]) => setKycForm((prev) => ({ ...prev, level: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="NONE">{faLabels.kycLevel.NONE}</SelectItem><SelectItem value="BASIC">{faLabels.kycLevel.BASIC}</SelectItem><SelectItem value="FULL">{faLabels.kycLevel.FULL}</SelectItem></SelectContent></Select></div><div><Label>علت/توضیح</Label><Input value={kycForm.reason} onChange={(e) => setKycForm((prev) => ({ ...prev, reason: e.target.value }))} /></div></div><Button onClick={() => kycMutation.mutate()}>{faLabels.common.save}</Button><Button asChild variant="outline"><Link href="/admin/kyc">رفتن به صف احراز هویت</Link></Button></CardContent></Card></TabsContent>

        <TabsContent value="settings"><Card><CardHeader><CardTitle>تنظیمات</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><thead><tr><th className="text-right">کلید</th><th className="text-right">مقدار موثر</th><th className="text-right">منبع</th></tr></thead><tbody>{Object.entries(overview.data.settings.effective).map(([key, value]) => <tr key={key}><td>{key}</td><td>{String(value)}</td><td>{overview.data.settings.sources[key as keyof typeof overview.data.settings.sources]}</td></tr>)}</tbody></table></CardContent></Card></TabsContent>

        <TabsContent value="policy"><div className="space-y-2">{summary ? <><Card><CardHeader><CardTitle>خلاصه پالیسی</CardTitle></CardHeader><CardContent className="space-y-2">{renderPolicyBlock("برداشت ریالی", summary.withdrawIrr)}{renderPolicyBlock("خرید", summary.tradeBuyNotionalIrr)}{renderPolicyBlock("فروش", summary.tradeSellNotionalIrr)}</CardContent></Card></> : null}<Card><CardHeader><CardTitle>تحلیل قوانین موثر</CardTitle></CardHeader><CardContent className="space-y-2"><Button onClick={async () => { const trace = await adminGetEffectivePolicy(id); setTraceJson(JSON.stringify(trace, null, 2)); }}>نمایش تحلیل قوانین</Button>{traceJson ? <pre className="text-xs overflow-auto">{traceJson}</pre> : null}</CardContent></Card></div></TabsContent>

        <TabsContent value="product-limits"><Card><CardHeader><CardTitle>محدودیت‌های محصول</CardTitle></CardHeader><CardContent className="space-y-2"><pre className="text-xs overflow-auto">{JSON.stringify(productLimits.data, null, 2)}</pre><Button onClick={() => applyLimitsMutation.mutate()}>اعمال</Button></CardContent></Card></TabsContent>
        <TabsContent value="usage"><Card><CardHeader><CardTitle>مصرف محدودیت‌ها</CardTitle></CardHeader><CardContent><pre className="text-xs overflow-auto">{JSON.stringify(usage.data, null, 2)}</pre></CardContent></Card></TabsContent>
        <TabsContent value="reservations"><Card><CardHeader><CardTitle>رزروهای محدودیت</CardTitle></CardHeader><CardContent><pre className="text-xs overflow-auto">{JSON.stringify(reservations.data, null, 2)}</pre></CardContent></Card></TabsContent>
        <TabsContent value="audit"><Card><CardHeader><CardTitle>لاگ تغییرات پالیسی</CardTitle></CardHeader><CardContent><pre className="text-xs overflow-auto">{JSON.stringify(audits.data, null, 2)}</pre></CardContent></Card></TabsContent>

        <TabsContent value="tahesab"><Card><CardHeader><CardTitle>ته‌حساب</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p>فعال: {overview.data.tahesab.enabled ? "بله" : "خیر"}</p><p>کد مشتری: {overview.data.tahesab.customerCode ?? "—"}</p><p>گروه: {overview.data.tahesab.groupName ?? "—"}</p><pre className="text-xs overflow-auto">{JSON.stringify(overview.data.tahesab.lastOutbox, null, 2)}</pre></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
