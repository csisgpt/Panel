"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getCustomerGroupSettings, listCustomerGroupUsers, listCustomerGroups, moveCustomerGroupUsers, putCustomerGroupSettings } from "@/lib/api/admin-customer-groups";
import { resyncTahesabGroupUsers } from "@/lib/api/admin-tahesab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function GroupDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const settings = useQuery({ queryKey: ["group-settings", id], queryFn: () => getCustomerGroupSettings(id) });
  const users = useQuery({ queryKey: ["group-users", id], queryFn: () => listCustomerGroupUsers(id, { page: 1, limit: 20 }) });
  const groups = useQuery({ queryKey: ["groups-all"], queryFn: listCustomerGroups });
  const [toGroupId, setToGroupId] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const saveSettings = useMutation({ mutationFn: () => putCustomerGroupSettings(id, settings.data || {}) });
  const moveMutation = useMutation({ mutationFn: () => moveCustomerGroupUsers(id, { userIds: selected, toGroupId }) });
  const resyncMutation = useMutation({ mutationFn: () => resyncTahesabGroupUsers(id) });

  return <Tabs defaultValue="settings"><TabsList><TabsTrigger value="settings">Settings</TabsTrigger><TabsTrigger value="members">Members</TabsTrigger></TabsList>
  <TabsContent value="settings"><div className="space-y-2"><Input value={String(settings.data?.maxOpenTrades || "")} onChange={(e) => settings.data && (settings.data.maxOpenTrades = Number(e.target.value))} /><Button onClick={() => saveSettings.mutate()}>Save</Button></div></TabsContent>
  <TabsContent value="members"><div className="space-y-2">{users.data?.items?.map((u) => <label className="block" key={u.id}><input type="checkbox" checked={selected.includes(u.id)} onChange={(e) => setSelected((p) => e.target.checked ? [...p, u.id] : p.filter((x) => x !== u.id))} /> {u.fullName}</label>)}<select value={toGroupId} onChange={(e) => setToGroupId(e.target.value)}>{(groups.data || []).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select><Button onClick={() => moveMutation.mutate()}>Move</Button><Button variant="outline" onClick={() => resyncMutation.mutate()}>Resync linked users</Button></div></TabsContent>
  </Tabs>;
}
