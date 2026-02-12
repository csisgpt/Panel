"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { adminApplyUserProductLimits, adminGetEffectivePolicy, adminGetUserLimitReservations, adminGetUserLimitUsage, adminGetUserOverview, adminGetUserProductLimitsGrid, adminKycQueue, adminListPolicyAudit, adminListUserWalletAccounts, adminUpdateUserKyc, adminWalletAdjust, resyncUser } from "@/lib/api/foundation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { faLabels } from "@/lib/i18n/fa";
import { formatApiErrorFa } from "@/lib/contracts/errors";
import { useToast } from "@/hooks/use-toast";

export default function AdminUserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [trace, setTrace] = useState<any | null>(null);
  const [adjustForm, setAdjustForm] = useState({ instrumentCode: "", amount: "", reason: "", externalRef: "" });
  const [kycForm, setKycForm] = useState({ status: "PENDING", level: "BASIC", reason: "" });
  const overview = useQuery({ queryKey: ["foundation-user-overview", id], queryFn: () => adminGetUserOverview(id, true) });
  const wallet = useQuery({ queryKey: ["foundation-user-wallet", id], queryFn: () => adminListUserWalletAccounts(id, { page: 1, limit: 50 }) });
  const productLimits = useQuery({ queryKey: ["foundation-user-product-limits", id], queryFn: () => adminGetUserProductLimitsGrid(id) });
  const usage = useQuery({ queryKey: ["foundation-user-limit-usage", id], queryFn: () => adminGetUserLimitUsage(id, { page: 1, limit: 20 }) });
  const reservations = useQuery({ queryKey: ["foundation-user-limit-res", id], queryFn: () => adminGetUserLimitReservations(id, { page: 1, limit: 20 }) });
  const audits = useQuery({ queryKey: ["foundation-policy-audit", id], queryFn: () => adminListPolicyAudit({ page: 1, limit: 20, entityId: id }) });
  const adjustMutation = useMutation({ mutationFn: () => adminWalletAdjust(id, adjustForm), onSuccess: () => toast({ title: faLabels.common.success }), onError: (e) => toast({ title: formatApiErrorFa(e), variant: "destructive" }) });
  const kycMutation = useMutation({ mutationFn: () => adminUpdateUserKyc(id, kycForm), onSuccess: () => toast({ title: faLabels.common.success }), onError: (e) => toast({ title: formatApiErrorFa(e), variant: "destructive" }) });
  const resyncMutation = useMutation({ mutationFn: () => resyncUser(id), onSuccess: () => toast({ title: faLabels.common.success }), onError: (e) => toast({ title: formatApiErrorFa(e), variant: "destructive" }) });
  const applyLimitsMutation = useMutation({ mutationFn: () => adminApplyUserProductLimits(id, { changes: [] }), onSuccess: () => toast({ title: faLabels.common.success }) });

  const effectiveSettingsRows = useMemo(() => {
    const s = overview.data?.settings;
    if (!s) return [];
    return Object.keys(s.effective).map((key) => ({ key, value: (s.effective as any)[key], source: (s.sources as any)[key] }));
  }, [overview.data?.settings]);

  if (overview.isLoading) return <div>{faLabels.common.loading}</div>;
  if (!overview.data) return <div>{faLabels.common.fetchError}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{overview.data.user.fullName}</h1>
          <p className="text-sm text-muted-foreground">{overview.data.user.mobile} - {overview.data.user.email}</p>
        </div>
        <Button onClick={() => resyncMutation.mutate()}>{faLabels.common.resync} کاربر در ته‌حساب</Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="overview">نمای کلی</TabsTrigger>
          <TabsTrigger value="wallet">کیف پول</TabsTrigger>
          <TabsTrigger value="kyc">KYC</TabsTrigger>
          <TabsTrigger value="settings">تنظیمات</TabsTrigger>
          <TabsTrigger value="policy">پالیسی</TabsTrigger>
          <TabsTrigger value="product-limits">محدودیت‌های محصول</TabsTrigger>
          <TabsTrigger value="usage">مصرف محدودیت‌ها</TabsTrigger>
          <TabsTrigger value="reservations">رزروهای محدودیت</TabsTrigger>
          <TabsTrigger value="audit">لاگ تغییرات پالیسی</TabsTrigger>
          <TabsTrigger value="tahesab">ته‌حساب</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><Card><CardHeader><CardTitle>نمای کلی</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p>نقش: {faLabels.userRole[overview.data.user.role as keyof typeof faLabels.userRole]}</p><p>وضعیت: {faLabels.userStatus[overview.data.user.status as keyof typeof faLabels.userStatus]}</p><p>گروه: {overview.data.customerGroup?.name ?? "—"}</p><p>KYC: {overview.data.kyc ? `${faLabels.kycStatus[overview.data.kyc.status as keyof typeof faLabels.kycStatus]} / ${faLabels.kycLevel[overview.data.kyc.level as keyof typeof faLabels.kycLevel]}` : faLabels.kycStatus.NONE}</p></CardContent></Card></TabsContent>

        <TabsContent value="wallet"><Card><CardHeader><CardTitle>کیف پول</CardTitle></CardHeader><CardContent className="space-y-3">{(wallet.data?.items ?? []).map((item) => <div key={`${item.id}-${item.instrumentCode}`} className="rounded border p-2 text-sm">{item.instrumentCode}: {item.balance}</div>)}<div className="grid gap-2 md:grid-cols-2"><div><Label>کد دارایی (instrumentCode)</Label><Input value={adjustForm.instrumentCode} onChange={(e) => setAdjustForm((p) => ({ ...p, instrumentCode: e.target.value }))} /></div><div><Label>مبلغ (amount)</Label><Input value={adjustForm.amount} onChange={(e) => setAdjustForm((p) => ({ ...p, amount: e.target.value }))} /></div><div><Label>علت/توضیح (reason)</Label><Input value={adjustForm.reason} onChange={(e) => setAdjustForm((p) => ({ ...p, reason: e.target.value }))} /></div><div><Label>شناسه خارجی (externalRef)</Label><Input value={adjustForm.externalRef} onChange={(e) => setAdjustForm((p) => ({ ...p, externalRef: e.target.value }))} /></div></div><Button onClick={() => adjustMutation.mutate()}>{faLabels.common.apply}</Button></CardContent></Card></TabsContent>

        <TabsContent value="kyc"><Card><CardHeader><CardTitle>KYC</CardTitle></CardHeader><CardContent className="space-y-2"><p>وضعیت: {overview.data.kyc ? faLabels.kycStatus[overview.data.kyc.status as keyof typeof faLabels.kycStatus] : faLabels.kycStatus.NONE}</p><p>سطح: {overview.data.kyc ? faLabels.kycLevel[overview.data.kyc.level as keyof typeof faLabels.kycLevel] : faLabels.kycLevel.NONE}</p><div className="grid gap-2 md:grid-cols-3"><Input placeholder="status" value={kycForm.status} onChange={(e) => setKycForm((p) => ({ ...p, status: e.target.value }))} /><Input placeholder="level" value={kycForm.level} onChange={(e) => setKycForm((p) => ({ ...p, level: e.target.value }))} /><Input placeholder="reason" value={kycForm.reason} onChange={(e) => setKycForm((p) => ({ ...p, reason: e.target.value }))} /></div><Button onClick={() => kycMutation.mutate()}>{faLabels.common.save}</Button><Button variant="outline" asChild><Link href="/admin/kyc">رفتن به صف KYC</Link></Button></CardContent></Card></TabsContent>

        <TabsContent value="settings"><Card><CardHeader><CardTitle>تنظیمات</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><thead><tr><th className="text-right">کلید</th><th className="text-right">مقدار موثر</th><th className="text-right">منبع</th></tr></thead><tbody>{effectiveSettingsRows.map((row) => <tr key={row.key}><td>{row.key}</td><td>{String(row.value)}</td><td>{row.source}</td></tr>)}</tbody></table></CardContent></Card></TabsContent>

        <TabsContent value="policy"><Card><CardHeader><CardTitle>پالیسی</CardTitle></CardHeader><CardContent className="space-y-2"><pre className="text-xs overflow-auto">{JSON.stringify(overview.data.policy.summary, null, 2)}</pre><Button onClick={async () => setTrace(await adminGetEffectivePolicy(id))}>نمایش تحلیل قوانین (Effective Policy)</Button>{trace ? <pre className="text-xs overflow-auto">{JSON.stringify(trace, null, 2)}</pre> : null}</CardContent></Card></TabsContent>

        <TabsContent value="product-limits"><Card><CardHeader><CardTitle>محدودیت‌های محصول</CardTitle></CardHeader><CardContent className="space-y-2"><pre className="text-xs overflow-auto">{JSON.stringify(productLimits.data, null, 2)}</pre><Button onClick={() => applyLimitsMutation.mutate()}>{faLabels.common.apply}</Button></CardContent></Card></TabsContent>

        <TabsContent value="usage"><Card><CardHeader><CardTitle>مصرف محدودیت‌ها</CardTitle></CardHeader><CardContent><pre className="text-xs overflow-auto">{JSON.stringify(usage.data, null, 2)}</pre></CardContent></Card></TabsContent>
        <TabsContent value="reservations"><Card><CardHeader><CardTitle>رزروهای محدودیت</CardTitle></CardHeader><CardContent><pre className="text-xs overflow-auto">{JSON.stringify(reservations.data, null, 2)}</pre></CardContent></Card></TabsContent>
        <TabsContent value="audit"><Card><CardHeader><CardTitle>لاگ تغییرات پالیسی</CardTitle></CardHeader><CardContent><pre className="text-xs overflow-auto">{JSON.stringify(audits.data, null, 2)}</pre></CardContent></Card></TabsContent>

        <TabsContent value="tahesab"><Card><CardHeader><CardTitle>ته‌حساب</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p>فعال: {overview.data.tahesab.enabled ? "بله" : "خیر"}</p><p>کد مشتری: {overview.data.tahesab.customerCode ?? "—"}</p><p>گروه: {overview.data.tahesab.groupName ?? "—"}</p><pre className="text-xs overflow-auto">{JSON.stringify(overview.data.tahesab.lastOutbox, null, 2)}</pre><pre className="text-xs overflow-auto">{JSON.stringify(overview.data.tahesab.outboxHistory ?? [], null, 2)}</pre></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
