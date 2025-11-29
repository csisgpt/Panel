import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTahesabBalances, getTahesabDocuments, getTahesabSyncStatus } from "@/lib/api/tahesab";
import { TahesabBalanceRecord, TahesabDocumentType } from "@/lib/types/backend";

export const metadata = {
  title: "ته‌حساب | نمای کلی",
};

function summarizeBalances(records: TahesabBalanceRecord[]) {
  const summary: Record<string, { internal: number; tahesab: number }> = {};
  records.forEach((r) => {
    if (!summary[r.assetType]) summary[r.assetType] = { internal: 0, tahesab: 0 };
    summary[r.assetType].internal += r.balanceInternal;
    summary[r.assetType].tahesab += r.balanceTahesab;
  });
  return summary;
}

export default async function TahesabOverviewPage() {
  const [syncStatus, balances, documents] = await Promise.all([
    getTahesabSyncStatus(),
    getTahesabBalances(),
    getTahesabDocuments(),
  ]);

  const balanceSummary = summarizeBalances(balances);
  const diffCount = balances.filter((b) => b.difference !== 0).length;
  const docsToday = documents.filter((d) => new Date(d.date).toDateString() === new Date().toDateString()).length;

  const docsByType = documents.reduce<Record<TahesabDocumentType, number>>((acc, doc) => {
    acc[doc.type] = (acc[doc.type] ?? 0) + 1;
    return acc;
  }, {} as Record<TahesabDocumentType, number>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">نمای کلی تاهساب</h1>
        <p className="text-sm text-muted-foreground">خلاصه وضعیت اتصال، ترازها و سندهای اخیر</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">وضعیت اتصال</CardTitle>
            <Badge variant={syncStatus.connected ? "success" : "destructive"}>
              {syncStatus.connected ? "متصل" : "قطع"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">آخرین سینک</span>
              <span className="font-semibold">{new Date(syncStatus.lastSyncedAt).toLocaleString("fa-IR")}</span>
            </div>
            {syncStatus.nextScheduledAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">سینک بعدی</span>
                <span className="font-semibold">{new Date(syncStatus.nextScheduledAt).toLocaleString("fa-IR")}</span>
              </div>
            )}
            {syncStatus.queueLength !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">صف انتظار</span>
                <span className="font-semibold">{syncStatus.queueLength} مورد</span>
              </div>
            )}
            <Button asChild variant="outline" size="sm" className="mt-2 w-full">
              <Link href="/admin/tahesab/connection">نمایش وضعیت اتصال</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">خلاصه ترازها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {Object.entries(balanceSummary).map(([asset, sums]) => {
              const diff = sums.tahesab - sums.internal;
              return (
                <div key={asset} className="flex items-center justify-between rounded-lg bg-muted/40 p-2">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{asset}</p>
                    <p className="font-semibold">داخلی: {sums.internal.toLocaleString("fa-IR")}</p>
                  </div>
                  <div className="text-left">
                    <p>تاهساب: {sums.tahesab.toLocaleString("fa-IR")}</p>
                    <p className={diff === 0 ? "text-muted-foreground text-xs" : "text-destructive text-xs font-semibold"}>
                      اختلاف: {diff.toLocaleString("fa-IR")}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">مغایرت‌ها و سندها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>حساب دارای اختلاف</span>
              <Badge variant={diffCount > 0 ? "destructive" : "secondary"}>{diffCount}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>سندهای امروز</span>
              <Badge variant="secondary">{docsToday}</Badge>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {Object.entries(docsByType).map(([type, count]) => (
                <Badge key={type} variant="outline">
                  {type}: {count}
                </Badge>
              ))}
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/tahesab/reconciliation">مشاهده مغایرت‌ها</Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href="/admin/tahesab/documents">مشاهده سندها</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
