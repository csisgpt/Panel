"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/kit/common/EmptyState";
import { P2PStatusBadge } from "@/components/kit/p2p/p2p-status-badge";
import { listAdminP2PSystemDestinations } from "@/lib/api/p2p";

export default function AdminSystemDestinationsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "ACTIVE" | "DISABLED">("all");

  const destinationsQuery = useQuery({
    queryKey: ["admin", "p2p", "system-destinations"],
    queryFn: () => listAdminP2PSystemDestinations(),
  });

  console.log(destinationsQuery)
  const rows = useMemo(() => {
    return (destinationsQuery.data ?? []).filter((row) => {
      const resolvedStatus = row.status ?? (row.isActive ? "ACTIVE" : "DISABLED");
      const byStatus = status === "all" ? true : resolvedStatus === status;
      const bySearch = search
        ? `${row.title ?? ""} ${row.maskedValue} ${row.bankName ?? ""}`.toLowerCase().includes(search.toLowerCase())
        : true;
      return byStatus && bySearch;
    });
  }, [destinationsQuery.data, search, status]);

  return (
    <div className="space-y-4 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">مقاصد سیستمی</h1>
        <Button disabled title="ایجاد مقصد سیستمی هنوز در بک‌اند فعال نیست.">افزودن مقصد</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input placeholder="جستجو" value={search} onChange={(event) => setSearch(event.target.value)} className="w-full sm:w-72" />
        <Select value={status} onValueChange={(value) => setStatus(value as "all" | "ACTIVE" | "DISABLED")}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه</SelectItem>
            <SelectItem value="ACTIVE">فعال</SelectItem>
            <SelectItem value="DISABLED">غیرفعال</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {rows.length ? (
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="flex items-start justify-between rounded-xl border p-3 text-sm">
              <div className="space-y-1">
                <p className="font-medium">{row.title ?? row.id}</p>
                <p>{row.maskedValue}</p>
                <p className="text-muted-foreground">{row.bankName ?? "-"}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{row.type}</span>
                  <P2PStatusBadge status={row.status ?? (row.isActive ? "ACTIVE" : "DISABLED")} />
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(row.maskedValue)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="مقصد سیستمی یافت نشد" description="فیلترها را تغییر دهید یا دوباره تلاش کنید." />
      )}
    </div>
  );
}
