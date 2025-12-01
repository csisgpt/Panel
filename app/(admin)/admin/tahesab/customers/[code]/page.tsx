import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getTahesabCustomerBalances,
  getTahesabCustomerByCode,
  getTahesabCustomerDocuments,
} from "@/lib/api/tahesab";

export const metadata = {
  title: "پروفایل مشتری تاهساب",
};

export default async function TahesabCustomerDetailPage({ params }: { params: { code: string } }) {
  const customer = await getTahesabCustomerByCode(params.code);

  if (!customer) {
    notFound();
  }

  const [balances, documents] = await Promise.all([
    getTahesabCustomerBalances(params.code),
    getTahesabCustomerDocuments(params.code),
  ]);

  const balanceEntries = Array.isArray(balances) ? balances : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <p className="text-sm text-muted-foreground">کد: {customer.code}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/tahesab/customers">بازگشت به لیست</Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/tahesab/customers/${customer.code}/edit`}>ویرایش</Link>
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>اطلاعات مشتری</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <p className="text-muted-foreground">نام</p>
            <p className="font-semibold">{customer.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">گروه</p>
            <p className="font-semibold">{customer.groupName ?? customer.groupId ?? "-"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">موبایل</p>
            <p className="font-semibold">{customer.mobile ?? "-"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">کد ملی</p>
            <p className="font-semibold">{customer.nationalId ?? "-"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">شهر</p>
            <p className="font-semibold">{customer.city ?? "-"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">آدرس</p>
            <p className="font-semibold">{customer.address ?? "-"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">فلز پیش‌فرض</p>
            <p className="font-semibold">{customer.defaultMetal ?? "-"}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>ترازهای فعلی</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {balanceEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">تراز ثبت نشده است.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {balanceEntries.map((balance) => (
                <div key={`${balance.currency ?? balance.metal ?? ""}-${balance.type ?? ""}`} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">نوع</p>
                      <p className="font-semibold">{balance.type ?? balance.currency ?? balance.metal ?? "تراز"}</p>
                    </div>
                    {balance.currency && <Badge variant="secondary">{balance.currency}</Badge>}
                  </div>
                  <div className="my-2 border-t" />
                  <div className="space-y-1 text-sm">
                    {balance.monetaryBalance !== undefined && (
                      <p>مبلغ: {balance.monetaryBalance.toLocaleString("fa-IR")}</p>
                    )}
                    {balance.goldWeightBalance !== undefined && <p>وزن طلا: {balance.goldWeightBalance}</p>}
                    {balance.silverWeightBalance !== undefined && <p>وزن نقره: {balance.silverWeightBalance}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>اسناد مرتبط</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">سندی یافت نشد.</p>
          ) : (
            <table className="w-full text-right text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="p-2">تاریخ</th>
                  <th className="p-2">شماره سند</th>
                  <th className="p-2">نوع</th>
                  <th className="p-2">مبلغ/وزن</th>
                  <th className="p-2">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-t">
                    <td className="p-2 text-xs text-muted-foreground">{new Date(doc.date).toLocaleDateString("fa-IR")}</td>
                    <td className="p-2 font-semibold">{doc.documentNumber}</td>
                    <td className="p-2">{doc.type}</td>
                    <td className="p-2">{doc.totalAmount ?? doc.totalWeight ?? "-"}</td>
                    <td className="p-2">{doc.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
