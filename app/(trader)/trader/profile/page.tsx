"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { FileUploader } from "@/components/kit/files/file-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMeKyc, getMeOverview, getMeSettings, patchMeSettings, submitMeKyc } from "@/lib/api/foundation";
import { useToast } from "@/hooks/use-toast";
import { applyApiValidationErrorsToRHF } from "@/lib/forms/apply-api-errors";
import { formatApiErrorFa } from "@/lib/contracts/errors";
import { faLabels } from "@/lib/i18n/fa";

export default function TraderProfilePage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [levelRequested, setLevelRequested] = useState("BASIC");
  const [note, setNote] = useState("");
  const overview = useQuery({ queryKey: ["foundation-me-overview-profile"], queryFn: getMeOverview });
  const settings = useQuery({ queryKey: ["foundation-me-settings"], queryFn: getMeSettings });
  const kyc = useQuery({ queryKey: ["foundation-me-kyc"], queryFn: getMeKyc });
  const form = useForm<Record<string, any>>({ values: settings.data as any });

  const patchMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => patchMeSettings(values),
    onSuccess: () => { toast({ title: faLabels.common.success }); qc.invalidateQueries({ queryKey: ["foundation-me-settings"] }); },
    onError: (e) => { applyApiValidationErrorsToRHF(e, form.setError); toast({ title: formatApiErrorFa(e), variant: "destructive" }); },
  });

  const submitMutation = useMutation({
    mutationFn: () => submitMeKyc({ levelRequested, note, fileIds }),
    onSuccess: () => { toast({ title: "درخواست KYC ثبت شد" }); qc.invalidateQueries({ queryKey: ["foundation-me-kyc"] }); },
    onError: (e) => { applyApiValidationErrorsToRHF(e, form.setError); toast({ title: formatApiErrorFa(e), variant: "destructive" }); },
  });

  return (
    <div className="space-y-4">
      <Card><CardHeader><CardTitle>اطلاعات کاربر</CardTitle></CardHeader><CardContent className="text-sm"><p>{overview.data?.user.fullName}</p><p>{overview.data?.user.mobile}</p><p>{overview.data?.user.email}</p></CardContent></Card>

      <Card><CardHeader><CardTitle>وضعیت KYC</CardTitle></CardHeader><CardContent><p>{kyc.data ? faLabels.kycStatus[kyc.data.status as keyof typeof faLabels.kycStatus] : faLabels.kycStatus.NONE}</p></CardContent></Card>

      <Card><CardHeader><CardTitle>تنظیمات کاربر</CardTitle></CardHeader><CardContent className="grid gap-2 md:grid-cols-2"><div><Label>نمایش موجودی</Label><Input {...form.register("showBalances")} defaultValue={String((settings.data as any)?.showBalances ?? true)} /></div><div><Label>نمایش طلا</Label><Input {...form.register("showGold")} defaultValue={String((settings.data as any)?.showGold ?? true)} /></div><div><Label>نمایش سکه</Label><Input {...form.register("showCoins")} defaultValue={String((settings.data as any)?.showCoins ?? true)} /></div><div><Label>نمایش وجه نقد</Label><Input {...form.register("showCash")} defaultValue={String((settings.data as any)?.showCash ?? true)} /></div><div><Label>فعال بودن معامله</Label><Input {...form.register("tradeEnabled")} defaultValue={String((settings.data as any)?.tradeEnabled ?? true)} /></div><div><Label>فعال بودن برداشت</Label><Input {...form.register("withdrawEnabled")} defaultValue={String((settings.data as any)?.withdrawEnabled ?? true)} /></div><div><Label>حداکثر معاملات باز</Label><Input {...form.register("maxOpenTrades")} defaultValue={String((settings.data as any)?.maxOpenTrades ?? 3)} /></div><Button className="md:col-span-2" onClick={form.handleSubmit((values) => patchMutation.mutate(values))}>ذخیره</Button></CardContent></Card>

      <Card><CardHeader><CardTitle>ارسال KYC</CardTitle></CardHeader><CardContent className="space-y-2"><FileUploader maxFiles={5} accept="image/*,application/pdf" label="مدارک KYC" onUploaded={setFileIds} /><Input value={levelRequested} onChange={(e) => setLevelRequested(e.target.value)} placeholder="سطح درخواستی" /><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="توضیحات" /><Button onClick={() => submitMutation.mutate()}>ثبت</Button></CardContent></Card>

      <Card><CardHeader><CardTitle>کیف پول و پالیسی</CardTitle></CardHeader><CardContent><pre className="text-xs overflow-auto">{JSON.stringify({ wallet: overview.data?.wallet, policy: overview.data?.policy }, null, 2)}</pre></CardContent></Card>
    </div>
  );
}
