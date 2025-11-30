"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getTahesabMappings, updateTahesabMapping, type TahesabMapping } from "@/lib/api/tahesab";

const statusLabel: Record<TahesabMapping["status"], string> = {
  MAPPED: "متصل",
  UNMAPPED: "بدون نگاشت",
  IGNORED: "نادیده گرفته شده",
};

const statusVariant: Record<TahesabMapping["status"], "success" | "destructive" | "outline"> = {
  MAPPED: "success",
  UNMAPPED: "destructive",
  IGNORED: "outline",
};

export default function TahesabMappingPage() {
  const [mappings, setMappings] = useState<TahesabMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTahesabMappings();
        setMappings(data);
        setError(null);
      } catch (err) {
        setError("خطا در دریافت نگاشت‌ها");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const summary = useMemo(() => {
    const mapped = mappings.filter((m) => m.status === "MAPPED").length;
    const unmapped = mappings.filter((m) => m.status === "UNMAPPED").length;
    const ignored = mappings.filter((m) => m.status === "IGNORED").length;
    return { mapped, unmapped, ignored, total: mappings.length };
  }, [mappings]);

  const handleStatusChange = async (id: string, status: TahesabMapping["status"]) => {
    setMappings((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    try {
      await updateTahesabMapping(id, { status });
      toast({ title: "وضعیت نگاشت بروزرسانی شد" });
    } catch (err) {
      toast({ title: "خطا در بروزرسانی", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">نگاشت حساب‌های تاهساب</h1>
        <p className="text-sm text-muted-foreground">کنترل وضعیت اتصال حساب‌ها و ابزارها با کدهای تاهساب</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>خلاصه</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 text-sm">
          <Badge variant="secondary">کل: {summary.total}</Badge>
          <Badge variant="success">متصل: {summary.mapped}</Badge>
          <Badge variant="destructive">بدون نگاشت: {summary.unmapped}</Badge>
          <Badge variant="outline">نادیده: {summary.ignored}</Badge>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>لیست نگاشت‌ها</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-muted-foreground">
                <th className="p-2">نام داخلی</th>
                <th className="p-2">کد داخلی</th>
                <th className="p-2">کد تاهساب</th>
                <th className="p-2">نوع</th>
                <th className="p-2">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((map) => (
                <tr key={map.id} className="border-t">
                  <td className="p-2 font-semibold">{map.internalName}</td>
                  <td className="p-2 text-xs text-muted-foreground">{map.internalCode}</td>
                  <td className="p-2">{map.tahesabCode ?? "-"}</td>
                  <td className="p-2">
                    <Badge variant="secondary">{map.type}</Badge>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={statusVariant[map.status]}>{statusLabel[map.status]}</Badge>
                      <Select value={map.status} onValueChange={(v) => handleStatusChange(map.id, v as TahesabMapping["status"])}>
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MAPPED">متصل</SelectItem>
                          <SelectItem value="UNMAPPED">بدون نگاشت</SelectItem>
                          <SelectItem value="IGNORED">نادیده</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
