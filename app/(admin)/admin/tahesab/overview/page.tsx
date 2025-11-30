import Link from "next/link";
import { ArrowLeftRight, FileText, Map, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TahesabSyncStatusCard } from "@/components/tahesab/tahesab-sync-status-card";
import { getTahesabBalanceRecords, getTahesabDocuments, getTahesabSyncStatus } from "@/lib/api/tahesab";
import { TahesabBalanceRecord, TahesabDocumentType } from "@/lib/types/backend";

export const metadata = {
  title: "ته‌حساب | نمای کلی",
};

function summarizeBalances(records: TahesabBalanceRecord[]) {
  return records.reduce<Record<string, { internal: number; tahesab: number; diff: number }>>((acc, rec) => {
    const key = rec.assetType;
    const current = acc[key] ?? { internal: 0, tahesab: 0, diff: 0 };
    current.internal += rec.balanceInternal;
    current.tahesab += rec.balanceTahesab;
    current.diff += rec.difference;
    acc[key] = current;
    return acc;
  }, {});
}

export default async function TahesabOverviewPage() {
  const [status, balances, documents] = await Promise.all([
    getTahesabSyncStatus(),
    getTahesabBalanceRecords(),
    getTahesabDocuments(),
  ]);

  const balanceSummary = summarizeBalances(balances);
  const diffCount = balances.filter((b) => b.difference !== 0).length;
  const docsByType = documents.reduce<Record<TahesabDocumentType, number>>((acc, doc) => {
    acc[doc.type] = (acc[doc.type] ?? 0) + 1;
    return acc;
  }, {} as Record<TahesabDocumentType, number>);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">نمای کلی تاهساب</h1>
        <p className="text-sm text-muted-foreground">خلاصه وضعیت اتصال، ترازها و سندهای اخیر</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TahesabSyncStatusCard
          status={status}
          description="وضعیت همگام‌سازی و برنامه زمان‌بندی"
        />

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">خلاصه ترازها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {Object.entries(balanceSummary).map(([asset, sums]) => {
              const diff = sums.tahesab - sums.internal;
              return (
                <div key={asset} className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{asset}</p>
                    <p className="font-semibold">داخلی: {sums.internal.toLocaleString("fa-IR")}</p>
                  </div>
                  <div className="text-left">
                    <p>تاهساب: {sums.tahesab.toLocaleString("fa-IR")}</p>
                    <Badge variant={diff === 0 ? "secondary" : "destructive"} className="mt-1">
                      اختلاف: {diff.toLocaleString("fa-IR")}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">سندها و مغایرت‌ها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>حساب دارای اختلاف</span>
              <Badge variant={diffCount > 0 ? "destructive" : "secondary"}>{diffCount}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>تعداد کل سندها</span>
              <Badge variant="secondary">{documents.length}</Badge>
            </div>
            <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
              {Object.entries(docsByType).map(([type, count]) => (
                <Badge key={type} variant="outline">
                  {type}: {count}
                </Badge>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/tahesab/reconciliation">مشاهده مغایرت‌ها</Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href="/admin/tahesab/documents">سندهای اخیر</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">کنترل اتصال</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">مدیریت اتصال و تست سینک</p>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/tahesab/connection">جزئیات</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">مغایرت‌گیری</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">بررسی اختلاف تراز مشتریان</p>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/tahesab/reconciliation">مشاهده</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">سندها</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">پیگیری وضعیت ارسال اسناد</p>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/tahesab/documents">باز کردن</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <Map className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">نگاشت حساب‌ها</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">وضعیت نگاشت به کدهای تاهساب</p>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/tahesab/mapping">مدیریت</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
