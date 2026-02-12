"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileUploader } from "@/components/kit/files/file-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getMeKyc, getMeOverview, getMeSettings, putMeSettings, submitMeKyc } from "@/lib/api/foundation";
import type { UserSettingsDto } from "@/lib/contracts/foundation/dtos";
import { useToast } from "@/hooks/use-toast";
import { applyApiValidationErrorsToRHF } from "@/lib/forms/apply-api-errors";
import { formatApiErrorFa } from "@/lib/contracts/errors";
import { faLabels } from "@/lib/i18n/fa";

const defaultSettings: UserSettingsDto = {
  showBalances: true,
  showGold: true,
  showCoins: true,
  showCash: true,
  tradeEnabled: true,
  withdrawEnabled: true,
  maxOpenTrades: 3,
};

export default function TraderProfilePage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [levelRequested, setLevelRequested] = useState<"BASIC" | "FULL">("BASIC");
  const [note, setNote] = useState("");

  const overview = useQuery({ queryKey: ["foundation-me-overview-profile"], queryFn: getMeOverview });
  const settings = useQuery({ queryKey: ["foundation-me-settings"], queryFn: getMeSettings });
  const kyc = useQuery({ queryKey: ["foundation-me-kyc"], queryFn: getMeKyc });

  const form = useForm<UserSettingsDto>({ values: settings.data ?? defaultSettings });

  const settingsMutation = useMutation({
    mutationFn: (values: UserSettingsDto) => putMeSettings(values),
    onSuccess: () => {
      toast({ title: faLabels.common.success });
      qc.invalidateQueries({ queryKey: ["foundation-me-settings"] });
    },
    onError: (error) => {
      applyApiValidationErrorsToRHF(error, form.setError);
      toast({ title: formatApiErrorFa(error), variant: "destructive" });
    },
  });

  const submitKycMutation = useMutation({
    mutationFn: () => submitMeKyc({ levelRequested, note, fileIds }),
    onSuccess: () => {
      toast({ title: "درخواست احراز هویت ثبت شد" });
      qc.invalidateQueries({ queryKey: ["foundation-me-kyc"] });
    },
    onError: (error) => {
      applyApiValidationErrorsToRHF(error, form.setError);
      toast({ title: formatApiErrorFa(error), variant: "destructive" });
    },
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>اطلاعات کاربر</CardTitle></CardHeader>
        <CardContent className="text-sm">
          <p>{overview.data?.user.fullName}</p>
          <p>{overview.data?.user.mobile}</p>
          <p>{overview.data?.user.email}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>وضعیت احراز هویت</CardTitle></CardHeader>
        <CardContent>
          <p>{kyc.data ? faLabels.kycStatus[kyc.data.status] : faLabels.kycStatus.NONE}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>تنظیمات کاربر</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {(["showBalances", "showGold", "showCoins", "showCash", "tradeEnabled", "withdrawEnabled"] as const).map((key) => (
            <div key={key} className="flex items-center justify-between">
              <Label>{faLabels.settingsKeys[key]}</Label>
              <Controller
                control={form.control}
                name={key}
                render={({ field }) => <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />}
              />
            </div>
          ))}
          <div className="space-y-1">
            <Label>{faLabels.settingsKeys.maxOpenTrades}</Label>
            <Input
              type="number"
              value={form.watch("maxOpenTrades") ?? ""}
              onChange={(e) => {
                const raw = e.target.value.trim();
                form.setValue("maxOpenTrades", raw === "" ? null : Number(raw));
              }}
              placeholder="مثال: 3"
            />
          </div>
          <Button onClick={form.handleSubmit((values) => settingsMutation.mutate(values))}>{faLabels.common.save}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>ارسال احراز هویت</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <FileUploader maxFiles={5} accept="image/*,application/pdf" label="مدارک احراز هویت" onUploaded={setFileIds} />
          <div className="space-y-1">
            <Label>سطح درخواستی</Label>
            <Select value={levelRequested} onValueChange={(value: "BASIC" | "FULL") => setLevelRequested(value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BASIC">{faLabels.kycLevel.BASIC}</SelectItem>
                <SelectItem value="FULL">{faLabels.kycLevel.FULL}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>توضیحات</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="توضیح اختیاری" />
          </div>
          <Button onClick={() => submitKycMutation.mutate()}>{faLabels.common.submit}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>کیف پول و پالیسی</CardTitle></CardHeader>
        <CardContent><pre className="text-xs overflow-auto">{JSON.stringify({ wallet: overview.data?.wallet, policy: overview.data?.policy }, null, 2)}</pre></CardContent>
      </Card>
    </div>
  );
}
