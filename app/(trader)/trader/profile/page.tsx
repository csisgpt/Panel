"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { FileUploader } from "@/components/kit/files/file-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMeKyc, getMeOverview, getMeSettings, putMeSettings, submitMeKyc } from "@/lib/api/me";
import { applyApiValidationErrorsToRHF } from "@/lib/forms/apply-api-errors";
import { useToast } from "@/hooks/use-toast";

export default function TraderProfilePage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [kycLevel, setKycLevel] = useState("BASIC");
  const [kycNote, setKycNote] = useState("");
  const overview = useQuery({ queryKey: ["me-overview-profile"], queryFn: getMeOverview });
  const settings = useQuery({ queryKey: ["me-settings"], queryFn: getMeSettings });
  const kyc = useQuery({ queryKey: ["me-kyc"], queryFn: getMeKyc });
  const form = useForm<Record<string, any>>({ values: settings.data as any });

  const saveSettings = useMutation({
    mutationFn: (values: any) => putMeSettings(values),
    onSuccess: () => { toast({ title: "تنظیمات ذخیره شد" }); qc.invalidateQueries({ queryKey: ["me-settings"] }); },
    onError: (e) => applyApiValidationErrorsToRHF(e, form.setError),
  });
  const submitKyc = useMutation({
    mutationFn: () => submitMeKyc({ levelRequested: kycLevel, note: kycNote, fileIds }),
    onSuccess: () => { toast({ title: "درخواست KYC ثبت شد" }); qc.invalidateQueries({ queryKey: ["me-kyc"] }); },
    onError: (error: any) => {
      if (error?.code === "KYC_INVALID_FILE_IDS") applyApiValidationErrorsToRHF(error, form.setError);
      else if (error?.code === "KYC_FILES_FORBIDDEN") toast({ title: "فایل‌های انتخابی مجاز نیست", variant: "destructive" });
      else toast({ title: error?.message || "خطا", variant: "destructive" });
    },
  });

  return <div className="space-y-4">
    <h1 className="text-lg font-semibold">{overview.data?.user?.fullName || "پروفایل"}</h1>
    <div className="grid gap-2 md:grid-cols-2">
      <div><Label>showBalances</Label><Input defaultValue={String((settings.data as any)?.showBalances ?? "")} {...form.register("showBalances")} /></div>
      <div><Label>tradeEnabled</Label><Input defaultValue={String((settings.data as any)?.tradeEnabled ?? "")} {...form.register("tradeEnabled")} /></div>
      <div><Label>withdrawEnabled</Label><Input defaultValue={String((settings.data as any)?.withdrawEnabled ?? "")} {...form.register("withdrawEnabled")} /></div>
    </div>
    <Button onClick={form.handleSubmit((values) => saveSettings.mutate(values))}>ذخیره تنظیمات</Button>

    <div className="space-y-2 rounded border p-4">
      <h2 className="font-medium">ارسال KYC</h2>
      <FileUploader maxFiles={5} accept="image/*,application/pdf" label="مدارک" onUploaded={setFileIds} />
      <Input value={kycLevel} onChange={(e) => setKycLevel(e.target.value)} placeholder="BASIC/FULL" />
      <Input value={kycNote} onChange={(e) => setKycNote(e.target.value)} placeholder="note" />
      <Button onClick={() => submitKyc.mutate()}>ثبت KYC</Button>
      <p className="text-sm">وضعیت فعلی: {kyc.data?.status || "—"}</p>
    </div>
  </div>;
}
