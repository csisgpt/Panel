"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { adminGetGroupSettings, adminListCustomerGroups, adminListGroupUsers, adminMoveGroupUsers, adminUpsertGroupSettings, resyncGroupUsers } from "@/lib/api/foundation";
import type { EffectiveSettings, GroupUserRowDto } from "@/lib/contracts/foundation/dtos";
import { formatApiErrorFa } from "@/lib/contracts/errors";
import { useToast } from "@/hooks/use-toast";

interface GroupSettingsForm {
  showBalances: boolean | null;
  showGold: boolean | null;
  showCoins: boolean | null;
  showCash: boolean | null;
  tradeEnabled: boolean | null;
  withdrawEnabled: boolean | null;
  maxOpenTrades: number | null;
  metaJson: string;
}

const boolFromSelect = (value: string): boolean | null => {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
};

const boolToSelect = (value: boolean | null): string => {
  if (value === true) return "true";
  if (value === false) return "false";
  return "null";
};

export default function CustomerGroupDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const groups = useQuery({ queryKey: ["foundation-groups-for-move"], queryFn: adminListCustomerGroups });
  const settingsQuery = useQuery({ queryKey: ["foundation-group-settings", id], queryFn: () => adminGetGroupSettings(id) });
  const [form, setForm] = useState<GroupSettingsForm>({
    showBalances: null,
    showGold: null,
    showCoins: null,
    showCash: null,
    tradeEnabled: null,
    withdrawEnabled: null,
    maxOpenTrades: null,
    metaJson: "",
  });
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [toGroupId, setToGroupId] = useState<string>("");

  useEffect(() => {
    const data = settingsQuery.data;
    if (!data) return;
    setForm({
      showBalances: data.showBalances ?? null,
      showGold: data.showGold ?? null,
      showCoins: data.showCoins ?? null,
      showCash: data.showCash ?? null,
      tradeEnabled: data.tradeEnabled ?? null,
      withdrawEnabled: data.withdrawEnabled ?? null,
      maxOpenTrades: data.maxOpenTrades ?? null,
      metaJson: data.metaJson ? JSON.stringify(data.metaJson, null, 2) : "",
    });
  }, [settingsQuery.data]);

  const settingsMutation = useMutation({
    mutationFn: async () => {
      let parsedMetaJson: Record<string, unknown> | null = null;
      if (form.metaJson.trim()) {
        parsedMetaJson = JSON.parse(form.metaJson) as Record<string, unknown>;
      }
      return adminUpsertGroupSettings(id, {
        showBalances: form.showBalances,
        showGold: form.showGold,
        showCoins: form.showCoins,
        showCash: form.showCash,
        tradeEnabled: form.tradeEnabled,
        withdrawEnabled: form.withdrawEnabled,
        maxOpenTrades: form.maxOpenTrades,
        metaJson: parsedMetaJson,
      });
    },
    onSuccess: () => toast({ title: "عملیات موفق بود" }),
    onError: (error) => toast({ title: formatApiErrorFa(error), variant: "destructive" }),
  });

  const moveMutation = useMutation({
    mutationFn: () => adminMoveGroupUsers(id, { toGroupId, userIds: selectedUserIds }),
    onSuccess: () => toast({ title: "عملیات موفق بود" }),
    onError: (error) => toast({ title: formatApiErrorFa(error), variant: "destructive" }),
  });

  const resyncMutation = useMutation({
    mutationFn: () => resyncGroupUsers(id, { mode: "ONLY_LINKED" }),
    onSuccess: () => toast({ title: "عملیات موفق بود" }),
    onError: (error) => toast({ title: formatApiErrorFa(error), variant: "destructive" }),
  });

  const boolFields: Array<{ key: keyof GroupSettingsForm; title: string }> = [
    { key: "showBalances", title: "نمایش موجودی" },
    { key: "showGold", title: "نمایش طلا" },
    { key: "showCoins", title: "نمایش سکه" },
    { key: "showCash", title: "نمایش وجه نقد" },
    { key: "tradeEnabled", title: "فعال بودن معامله" },
    { key: "withdrawEnabled", title: "فعال بودن برداشت" },
  ];

  return (
    <Tabs defaultValue="group-info">
      <TabsList>
        <TabsTrigger value="group-info">اطلاعات گروه</TabsTrigger>
        <TabsTrigger value="group-settings">تنظیمات گروه</TabsTrigger>
        <TabsTrigger value="group-users">کاربران گروه</TabsTrigger>
        <TabsTrigger value="group-tahesab">ته‌حساب</TabsTrigger>
      </TabsList>

      <TabsContent value="group-info">
        <p className="text-sm text-muted-foreground">شناسه گروه: {id}</p>
      </TabsContent>

      <TabsContent value="group-settings">
        <div className="space-y-3">
          {boolFields.map((field) => (
            <div key={field.key} className="space-y-1">
              <Label>{field.title}</Label>
              <Select value={boolToSelect(form[field.key] as boolean | null)} onValueChange={(value) => setForm((prev) => ({ ...prev, [field.key]: boolFromSelect(value) }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">پیش‌فرض</SelectItem>
                  <SelectItem value="true">بله</SelectItem>
                  <SelectItem value="false">خیر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
          <div className="space-y-1">
            <Label>حداکثر معاملات باز</Label>
            <Input type="number" value={form.maxOpenTrades ?? ""} onChange={(e) => setForm((prev) => ({ ...prev, maxOpenTrades: e.target.value === "" ? null : Number(e.target.value) }))} />
          </div>
          <div className="space-y-1">
            <Label>فراداده (JSON)</Label>
            <Textarea value={form.metaJson} rows={6} onChange={(e) => setForm((prev) => ({ ...prev, metaJson: e.target.value }))} placeholder='{"foo":"bar"}' />
          </div>
          <Button onClick={() => settingsMutation.mutate()}>ذخیره</Button>
        </div>
      </TabsContent>

      <TabsContent value="group-users" className="space-y-3">
        <ServerTableView<GroupUserRowDto>
          storageKey="foundation-group-users"
          title="کاربران گروه"
          columns={[
            { accessorKey: "fullName", header: "نام" },
            { accessorKey: "mobile", header: "موبایل" },
            { accessorKey: "email", header: "ایمیل" },
          ]}
          queryKeyFactory={(params) => ["foundation-group-users", id, params]}
          queryFn={async (params) => {
            const data = await adminListGroupUsers(id, { page: params.page, limit: params.limit, q: params.search });
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
            <Button
              size="sm"
              variant={selectedUserIds.includes(row.id) ? "default" : "outline"}
              onClick={() => setSelectedUserIds((prev) => (prev.includes(row.id) ? prev.filter((item) => item !== row.id) : [...prev, row.id]))}
            >
              {selectedUserIds.includes(row.id) ? "حذف از انتخاب" : "انتخاب"}
            </Button>
          )}
        />
        <div className="space-y-1">
          <Label>انتقال به گروه</Label>
          <Select value={toGroupId} onValueChange={setToGroupId}>
            <SelectTrigger><SelectValue placeholder="گروه مقصد" /></SelectTrigger>
            <SelectContent>
              {(groups.data ?? []).filter((group) => group.id !== id).map((group) => (
                <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => moveMutation.mutate()} disabled={!toGroupId || selectedUserIds.length === 0}>اعمال انتقال</Button>
      </TabsContent>

      <TabsContent value="group-tahesab">
        <Button onClick={() => resyncMutation.mutate()}>ری‌سینک کاربران گروه</Button>
      </TabsContent>
    </Tabs>
  );
}
