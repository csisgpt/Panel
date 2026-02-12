"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getAdminUserOverview, getAdminUserWalletAccounts, adjustAdminUserWallet } from "@/lib/api/admin-users";
import { putAdminUserKyc } from "@/lib/api/admin-kyc";
import { getAdminUserEffectivePolicy } from "@/lib/api/admin-policy";
import { resyncTahesabUser } from "@/lib/api/admin-tahesab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export default function AdminUserDetailsPage() {
  const params = useParams<{ id: string }>();
  const [trace, setTrace] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const overview = useQuery({ queryKey: ["admin-user-overview", params.id], queryFn: () => getAdminUserOverview(params.id) });
  const wallet = useQuery({ queryKey: ["admin-user-wallet", params.id], queryFn: () => getAdminUserWalletAccounts(params.id) });
  const kycMutation = useMutation({ mutationFn: (body: any) => putAdminUserKyc(params.id, body) });
  const adjustMutation = useMutation({ mutationFn: () => adjustAdminUserWallet(params.id, { instrumentCode: wallet.data?.items?.[0]?.instrumentCode || "IRR", amount, reason: "ADMIN_ADJUST" }) });
  const resyncMutation = useMutation({ mutationFn: () => resyncTahesabUser(params.id) });

  if (overview.isLoading) return <div>در حال بارگذاری...</div>;
  if (!overview.data) return <div>اطلاعات یافت نشد</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{overview.data.user.fullName}</h1>
        <Button onClick={() => resyncMutation.mutate()} disabled={resyncMutation.isPending}>Resync Tahesab</Button>
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="kyc">KYC</TabsTrigger>
          <TabsTrigger value="policy">Policy</TabsTrigger>
          <TabsTrigger value="tahesab">Tahesab</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Identity</CardTitle></CardHeader><CardContent>{overview.data.user.email} - {overview.data.user.mobile}</CardContent></Card>
        </TabsContent>
        <TabsContent value="wallet">
          <Card><CardHeader><CardTitle>Accounts</CardTitle></CardHeader><CardContent className="space-y-2">{wallet.data?.items?.map((a) => <div key={a.instrumentCode}>{a.instrumentCode}: {a.balance}</div>)}<Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="amount" /><Button onClick={() => adjustMutation.mutate()}>Adjust Wallet</Button></CardContent></Card>
        </TabsContent>
        <TabsContent value="kyc">
          <Card><CardContent className="pt-4 flex gap-2"><Button onClick={() => kycMutation.mutate({ status: "VERIFIED", level: "FULL" })}>Verify FULL</Button><Button variant="destructive" onClick={() => kycMutation.mutate({ status: "REJECTED", rejectReason: "Incomplete" })}>Reject</Button></CardContent></Card>
        </TabsContent>
        <TabsContent value="policy">
          <Card><CardContent className="pt-4"><Button onClick={async () => setTrace(await getAdminUserEffectivePolicy(params.id))}>Load Trace</Button><pre className="text-xs overflow-auto">{trace ? JSON.stringify(trace, null, 2) : ""}</pre></CardContent></Card>
        </TabsContent>
        <TabsContent value="tahesab"><Card><CardContent className="pt-4">{overview.data.tahesab?.customerCode || "—"}</CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
