"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminGetGroupSettings, adminListCustomerGroups, adminListGroupUsers, adminMoveGroupUsers, adminUpsertGroupSettings, resyncGroupUsers } from "@/lib/api/foundation";
import { formatApiErrorFa } from "@/lib/contracts/errors";
import { useToast } from "@/hooks/use-toast";

export default function CustomerGroupDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const settings = useQuery({ queryKey: ["foundation-group-settings", id], queryFn: () => adminGetGroupSettings(id) });
  const users = useQuery({ queryKey: ["foundation-group-users", id], queryFn: () => adminListGroupUsers(id, { page: 1, limit: 50 }) });
  const groups = useQuery({ queryKey: ["foundation-groups-for-move"], queryFn: adminListCustomerGroups });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [toGroupId, setToGroupId] = useState("");
  const settingsMutation = useMutation({ mutationFn: () => adminUpsertGroupSettings(id, settings.data ?? {}), onSuccess: () => toast({ title: "عملیات موفق بود" }), onError: (e) => toast({ title: formatApiErrorFa(e), variant: "destructive" }) });
  const moveMutation = useMutation({ mutationFn: () => adminMoveGroupUsers(id, { toGroupId, userIds: selectedUsers }), onSuccess: () => toast({ title: "عملیات موفق بود" }), onError: (e) => toast({ title: formatApiErrorFa(e), variant: "destructive" }) });
  const resyncMutation = useMutation({ mutationFn: () => resyncGroupUsers(id, { mode: "ONLY_LINKED" }), onSuccess: () => toast({ title: "عملیات موفق بود" }) });

  return (
    <Tabs defaultValue="group-info">
      <TabsList>
        <TabsTrigger value="group-info">اطلاعات گروه</TabsTrigger>
        <TabsTrigger value="group-settings">تنظیمات گروه</TabsTrigger>
        <TabsTrigger value="group-users">کاربران گروه</TabsTrigger>
        <TabsTrigger value="group-tahesab">ته‌حساب</TabsTrigger>
      </TabsList>

      <TabsContent value="group-info"><pre className="text-xs">{JSON.stringify({ id }, null, 2)}</pre></TabsContent>
      <TabsContent value="group-settings"><div className="space-y-2"><Input value={String((settings.data as any)?.maxOpenTrades ?? "")} onChange={(e) => settings.data && ((settings.data as any).maxOpenTrades = Number(e.target.value))} /><Button onClick={() => settingsMutation.mutate()}>ذخیره</Button></div></TabsContent>
      <TabsContent value="group-users"><div className="space-y-2">{(users.data?.items ?? []).map((u: any) => <label className="block" key={u.id}><input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={(e) => setSelectedUsers((p) => e.target.checked ? [...p, u.id] : p.filter((x) => x !== u.id))} /> {u.fullName}</label>)}<label className="text-sm">انتقال به گروه</label><select value={toGroupId} onChange={(e) => setToGroupId(e.target.value)}>{(groups.data ?? []).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select><Button onClick={() => moveMutation.mutate()}>اعمال</Button></div></TabsContent>
      <TabsContent value="group-tahesab"><Button onClick={() => resyncMutation.mutate()}>ری‌سینک کاربران گروه</Button></TabsContent>
    </Tabs>
  );
}
