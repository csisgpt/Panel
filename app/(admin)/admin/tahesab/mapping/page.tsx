"use client";

import { useEffect, useState } from "react";
import { getTahesabMappings, updateTahesabMapping } from "@/lib/api/tahesab";
import { TahesabMapping } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const statusLabel: Record<TahesabMapping["status"], string> = {
  ACTIVE: "فعال",
  DISABLED: "غیرفعال",
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

  const handleStatusChange = async (id: string, status: TahesabMapping["status"]) => {
    const updated = await updateTahesabMapping(id, { status });
    setMappings((prev) => prev.map((m) => (m.id === id ? updated : m)));
    toast({ title: "وضعیت نگاشت بروزرسانی شد" });
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
    return <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">نگاشت حساب‌های تاهساب</h1>
        <p className="text-sm text-muted-foreground">کنترل وضعیت اتصال حساب‌های داخلی به تاهساب</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>لیست نگاشت‌ها</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-muted-foreground">
                <th className="p-2">حساب داخلی</th>
                <th className="p-2">کد تاهساب</th>
                <th className="p-2">نوع</th>
                <th className="p-2">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((map) => (
                <tr key={map.id} className="border-t">
                  <td className="p-2 font-semibold">{map.internalAccount}</td>
                  <td className="p-2">{map.tahesabCode}</td>
                  <td className="p-2">
                    <Badge variant={map.type === "HOUSE" ? "secondary" : "outline"}>
                      {map.type === "HOUSE" ? "خانه" : "مشتری"}
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={map.status === "ACTIVE" ? "success" : "destructive"}>{statusLabel[map.status]}</Badge>
                      <Select value={map.status} onValueChange={(v) => handleStatusChange(map.id, v as TahesabMapping["status"])}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">فعال</SelectItem>
                          <SelectItem value="DISABLED">غیرفعال</SelectItem>
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
