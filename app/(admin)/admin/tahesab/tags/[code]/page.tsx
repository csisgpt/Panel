"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  clearTahesabTagRFID,
  getTahesabTagByCode,
  type TahesabTagDetail,
} from "@/lib/api/tahesab";

export default function TahesabTagDetailPage({ params }: { params: { code: string } }) {
  const [tag, setTag] = useState<TahesabTagDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getTahesabTagByCode(params.code, { withPhoto: true });
        setTag(data);
        setError(null);
      } catch (err) {
        setError("خطا در دریافت اطلاعات اتیکت");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.code]);

  const handleClear = async () => {
    if (!tag) return;
    setClearing(true);
    try {
      await clearTahesabTagRFID(tag.code);
      toast({ title: "RFID پاک شد", description: `کد ${tag.code}` });
    } catch (err) {
      toast({ title: "خطا", description: "عملیات ناموفق بود", variant: "destructive" });
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-64" />;
  }

  if (error || !tag) {
    return <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error ?? "اتیکت یافت نشد"}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">اتیکت {tag.code}</h1>
          <p className="text-sm text-muted-foreground">کد کار: {tag.workCode ?? "-"}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/tahesab/tags">بازگشت به لیست</Link>
          </Button>
          <Button onClick={handleClear} disabled={clearing} variant="destructive">
            {clearing ? "در حال پاک‌سازی" : "پاک کردن RFID"}
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>اطلاعات اتیکت</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">نام</p>
            <p className="font-semibold">{tag.name ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">عیار</p>
            <p className="font-semibold">{tag.ayar ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">وزن</p>
            <p className="font-semibold">{tag.weight ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">اجرت</p>
            <p className="font-semibold">{tag.makingCost ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">قیمت آنلاین</p>
            <p className="font-semibold">{tag.onlinePrice ?? tag.displayPrice ?? "-"}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">وضعیت</p>
            {tag.isInStock ? <Badge variant="secondary">موجود</Badge> : <Badge variant="outline">ناموجود</Badge>}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">RFID</p>
            <p className="font-semibold">{tag.rfid ?? "-"}</p>
          </div>
        </CardContent>
      </Card>

      {(tag.imageUrl || tag.imageBase64) && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>تصویر</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={tag.imageUrl ?? (tag.imageBase64 ? `data:image/jpeg;base64,${tag.imageBase64}` : undefined)}
              alt={tag.name ?? tag.code}
              className="max-h-80 rounded-lg border object-contain"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
