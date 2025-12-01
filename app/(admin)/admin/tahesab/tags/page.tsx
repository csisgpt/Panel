"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getTahesabTags, type TahesabTag } from "@/lib/api/tahesab";

type Filters = {
  fromCode: string;
  toCode: string;
  updatedFrom: string;
  withPhoto: boolean;
};

export default function TahesabTagsPage() {
  const [tags, setTags] = useState<TahesabTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ fromCode: "", toCode: "", updatedFrom: "", withPhoto: false });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getTahesabTags({
          fromCode: filters.fromCode || undefined,
          toCode: filters.toCode || undefined,
          updatedFrom: filters.updatedFrom || undefined,
          withPhoto: filters.withPhoto,
        });
        setTags(data);
        setError(null);
      } catch (err) {
        setError("خطا در دریافت اتیکت‌ها");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters.fromCode, filters.toCode, filters.updatedFrom, filters.withPhoto]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">اتیکت‌ها</h1>
        <p className="text-sm text-muted-foreground">لیست برچسب‌ها و اطلاعات قیمت</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>فیلتر</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="از کد"
            value={filters.fromCode}
            onChange={(e) => setFilters((prev) => ({ ...prev, fromCode: e.target.value }))}
            className="w-32"
          />
          <Input
            placeholder="تا کد"
            value={filters.toCode}
            onChange={(e) => setFilters((prev) => ({ ...prev, toCode: e.target.value }))}
            className="w-32"
          />
          <Input
            type="date"
            value={filters.updatedFrom}
            onChange={(e) => setFilters((prev) => ({ ...prev, updatedFrom: e.target.value }))}
            className="w-44"
          />
          <Button
            variant={filters.withPhoto ? "secondary" : "outline"}
            onClick={() => setFilters((prev) => ({ ...prev, withPhoto: !prev.withPhoto }))}
          >
            {filters.withPhoto ? "فقط دارای عکس" : "همه"}
          </Button>
          <Button variant="ghost" onClick={() => setFilters({ fromCode: "", toCode: "", updatedFrom: "", withPhoto: false })}>
            ریست
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>لیست اتیکت‌ها</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="p-2">کد</th>
                <th className="p-2">کد کار</th>
                <th className="p-2">نام</th>
                <th className="p-2">عیار</th>
                <th className="p-2">وزن</th>
                <th className="p-2">اجرت</th>
                <th className="p-2">قیمت آنلاین</th>
                <th className="p-2">موجودی</th>
                <th className="p-2">عکس</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.code} className="border-t transition hover:bg-muted/40">
                  <td className="p-2 font-semibold">
                    <Link href={`/admin/tahesab/tags/${tag.code}`} className="underline">
                      {tag.code}
                    </Link>
                  </td>
                  <td className="p-2">{tag.workCode ?? "-"}</td>
                  <td className="p-2">{tag.name ?? "-"}</td>
                  <td className="p-2">{tag.ayar ?? "-"}</td>
                  <td className="p-2">{tag.weight ?? "-"}</td>
                  <td className="p-2">{tag.makingCost ?? "-"}</td>
                  <td className="p-2">{tag.onlinePrice ?? tag.displayPrice ?? "-"}</td>
                  <td className="p-2">{tag.isInStock ? <Badge variant="secondary">موجود</Badge> : "ناموجود"}</td>
                  <td className="p-2">{tag.hasPhoto ? "✅" : "-"}</td>
                </tr>
              ))}
              {tags.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-muted-foreground">
                    موردی یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
