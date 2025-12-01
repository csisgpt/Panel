"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import {
  getTahesabBankBalances,
  getTahesabFinishedInventory,
  getTahesabGoldInventory,
  getTahesabTarazSummary,
  type TahesabBankBalance,
  type TahesabFinishedInventoryItem,
  type TahesabGoldInventoryItem,
  type TahesabTarazSummary,
} from "@/lib/api/tahesab";

type LoadState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
};

export default function TahesabBalancesPage() {
  const [bankFilters, setBankFilters] = useState({ fromDate: "", toDate: "" });
  const [goldFilters, setGoldFilters] = useState<{ metal: string; ayar: string }>({ metal: "", ayar: "" });
  const [banks, setBanks] = useState<LoadState<TahesabBankBalance[]>>({ data: [], loading: true, error: null });
  const [goldInventory, setGoldInventory] = useState<LoadState<TahesabGoldInventoryItem[]>>({
    data: [],
    loading: true,
    error: null,
  });
  const [finished, setFinished] = useState<LoadState<TahesabFinishedInventoryItem[]>>({
    data: [],
    loading: true,
    error: null,
  });
  const [taraz, setTaraz] = useState<LoadState<TahesabTarazSummary | null>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const loadBanks = async () => {
      setBanks((prev) => ({ ...prev, loading: true }));
      try {
        const data = (await getTahesabBankBalances({
          fromDate: bankFilters.fromDate || undefined,
          toDate: bankFilters.toDate || undefined,
        })) as TahesabBankBalance[];
        setBanks({ data, loading: false, error: null });
      } catch (err) {
        setBanks({ data: [], loading: false, error: "خطا در دریافت موجودی بانک" });
      }
    };
    loadBanks();
  }, [bankFilters.fromDate, bankFilters.toDate]);

  useEffect(() => {
    const loadGold = async () => {
      setGoldInventory((prev) => ({ ...prev, loading: true }));
      try {
        const data = (await getTahesabGoldInventory({
          metal: goldFilters.metal || undefined,
          ayar: goldFilters.ayar ? Number(goldFilters.ayar) : undefined,
        })) as TahesabGoldInventoryItem[];
        setGoldInventory({ data, loading: false, error: null });
      } catch (err) {
        setGoldInventory({ data: [], loading: false, error: "خطا در دریافت موجودی طلا" });
      }
    };
    loadGold();
  }, [goldFilters.metal, goldFilters.ayar]);

  useEffect(() => {
    const loadFinished = async () => {
      setFinished((prev) => ({ ...prev, loading: true }));
      try {
        const data = (await getTahesabFinishedInventory()) as TahesabFinishedInventoryItem[];
        setFinished({ data, loading: false, error: null });
      } catch (err) {
        setFinished({ data: [], loading: false, error: "خطا در دریافت کارساخته" });
      }
    };
    loadFinished();
  }, []);

  useEffect(() => {
    const loadTaraz = async () => {
      setTaraz((prev) => ({ ...prev, loading: true }));
      try {
        const data = await getTahesabTarazSummary();
        setTaraz({ data, loading: false, error: null });
      } catch (err) {
        setTaraz({ data: null, loading: false, error: "خطا در دریافت تراز" });
      }
    };
    loadTaraz();
  }, []);

  const totalGoldWeight = useMemo(() => taraz.data?.totalGoldWeight ?? 0, [taraz.data]);

  const tabItems = useMemo(
    () => [
      {
        value: "banks",
        label: "بانک",
        content: (
          <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>فیلتر تاریخ</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Input
                type="date"
                value={bankFilters.fromDate}
                onChange={(e) => setBankFilters((prev) => ({ ...prev, fromDate: e.target.value }))}
                className="w-40"
              />
              <Input
                type="date"
                value={bankFilters.toDate}
                onChange={(e) => setBankFilters((prev) => ({ ...prev, toDate: e.target.value }))}
                className="w-40"
              />
              <Button variant="ghost" onClick={() => setBankFilters({ fromDate: "", toDate: "" })}>
                ریست
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>حساب‌های بانکی</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {banks.loading ? (
                <Skeleton className="h-40 w-full" />
              ) : banks.error ? (
                <p className="text-sm text-destructive">{banks.error}</p>
              ) : banks.data.length === 0 ? (
                <p className="text-sm text-muted-foreground">داده‌ای یافت نشد.</p>
              ) : (
                <table className="w-full text-right text-sm">
                  <thead className="text-xs text-muted-foreground">
                    <tr>
                      <th className="p-2">بانک</th>
                      <th className="p-2">شماره حساب</th>
                      <th className="p-2">موجودی</th>
                      <th className="p-2">واریز</th>
                      <th className="p-2">برداشت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banks.data.map((bank) => (
                      <tr key={`${bank.bankName}-${bank.accountNumber ?? "n/a"}`} className="border-t">
                        <td className="p-2 font-semibold">{bank.bankName}</td>
                        <td className="p-2">{bank.accountNumber ?? "-"}</td>
                        <td className="p-2">{bank.balance.toLocaleString("fa-IR")}</td>
                        <td className="p-2">{bank.totalDeposit?.toLocaleString("fa-IR") ?? "-"}</td>
                        <td className="p-2">{bank.totalWithdraw?.toLocaleString("fa-IR") ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
        ),
      },
      {
        value: "gold",
        label: "طلا / متفرقه",
        content: (
          <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>فیلتر موجودی طلا</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Input
                placeholder="فلز"
                value={goldFilters.metal}
                onChange={(e) => setGoldFilters((prev) => ({ ...prev, metal: e.target.value }))}
                className="w-40"
              />
              <Input
                placeholder="عیار"
                value={goldFilters.ayar}
                onChange={(e) => setGoldFilters((prev) => ({ ...prev, ayar: e.target.value }))}
                className="w-32"
              />
              <Button variant="ghost" onClick={() => setGoldFilters({ metal: "", ayar: "" })}>
                ریست
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>موجودی طلا و متفرقه</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {goldInventory.loading ? (
                <Skeleton className="h-40 w-full" />
              ) : goldInventory.error ? (
                <p className="text-sm text-destructive">{goldInventory.error}</p>
              ) : goldInventory.data.length === 0 ? (
                <p className="text-sm text-muted-foreground">داده‌ای موجود نیست.</p>
              ) : (
                <table className="w-full text-right text-sm">
                  <thead className="text-xs text-muted-foreground">
                    <tr>
                      <th className="p-2">فلز</th>
                      <th className="p-2">عیار</th>
                      <th className="p-2">وزن</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goldInventory.data.map((item) => (
                      <tr key={`${item.metal}-${item.ayar}`} className="border-t">
                        <td className="p-2">{item.metal}</td>
                        <td className="p-2">{item.ayar}</td>
                        <td className="p-2">{item.weight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
        ),
      },
      {
        value: "finished",
        label: "کارساخته",
        content: (
          <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>موجودی کارساخته</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {finished.loading ? (
                <Skeleton className="h-40 w-full" />
              ) : finished.error ? (
                <p className="text-sm text-destructive">{finished.error}</p>
              ) : finished.data.length === 0 ? (
                <p className="text-sm text-muted-foreground">داده‌ای یافت نشد.</p>
              ) : (
                <table className="w-full text-right text-sm">
                  <thead className="text-xs text-muted-foreground">
                    <tr>
                      <th className="p-2">نام کار</th>
                      <th className="p-2">فلز</th>
                      <th className="p-2">وزن قابل فروش</th>
                      <th className="p-2">تعداد موجود</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finished.data.map((item) => (
                      <tr key={`${item.workName}-${item.metal}`} className="border-t">
                        <td className="p-2 font-semibold">{item.workName}</td>
                        <td className="p-2">{item.metal}</td>
                        <td className="p-2">{item.availableWeight}</td>
                        <td className="p-2">{item.availableCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
        ),
      },
      {
        value: "taraz",
        label: "تراز",
        content: (
          <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>خلاصه تراز</CardTitle>
            </CardHeader>
            <CardContent>
              {taraz.loading ? (
                <Skeleton className="h-24 w-full" />
              ) : taraz.error ? (
                <p className="text-sm text-destructive">{taraz.error}</p>
              ) : !taraz.data ? (
                <p className="text-sm text-muted-foreground">داده‌ای موجود نیست.</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">وزن کل طلا</p>
                    <p className="text-lg font-bold">{taraz.data.totalGoldWeight}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">ارزش طلا</p>
                    <p className="text-lg font-bold">{taraz.data.totalGoldValue.toLocaleString("fa-IR")}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">ارزش ارزی</p>
                    <p className="text-lg font-bold">{taraz.data.totalCurrencyValue.toLocaleString("fa-IR")}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  سکه‌ها <Badge variant="secondary">{taraz.data?.coins.length ?? 0}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {taraz.loading ? (
                  <Skeleton className="h-32 w-full" />
                ) : taraz.error ? (
                  <p className="text-sm text-destructive">{taraz.error}</p>
                ) : !taraz.data || taraz.data.coins.length === 0 ? (
                  <p className="text-sm text-muted-foreground">داده‌ای وجود ندارد.</p>
                ) : (
                  <table className="w-full text-right text-sm">
                    <thead className="text-xs text-muted-foreground">
                      <tr>
                        <th className="p-2">نوع</th>
                        <th className="p-2">تعداد</th>
                        <th className="p-2">ارزش</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taraz.data.coins.map((coin) => (
                        <tr key={coin.name} className="border-t">
                          <td className="p-2">{coin.name}</td>
                          <td className="p-2">{coin.quantity}</td>
                          <td className="p-2">{coin.value.toLocaleString("fa-IR")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ارزها <Badge variant="secondary">{taraz.data?.currencies.length ?? 0}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {taraz.loading ? (
                  <Skeleton className="h-32 w-full" />
                ) : taraz.error ? (
                  <p className="text-sm text-destructive">{taraz.error}</p>
                ) : !taraz.data || taraz.data.currencies.length === 0 ? (
                  <p className="text-sm text-muted-foreground">داده‌ای وجود ندارد.</p>
                ) : (
                  <table className="w-full text-right text-sm">
                    <thead className="text-xs text-muted-foreground">
                      <tr>
                        <th className="p-2">کد</th>
                        <th className="p-2">تعداد</th>
                        <th className="p-2">ارزش</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taraz.data.currencies.map((currency) => (
                        <tr key={currency.code} className="border-t">
                          <td className="p-2">{currency.code}</td>
                          <td className="p-2">{currency.quantity}</td>
                          <td className="p-2">{currency.value.toLocaleString("fa-IR")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>

          {taraz.data && (
            <p className="text-xs text-muted-foreground">آخرین وزن کل طلا: {totalGoldWeight}</p>
          )}
        </div>
        ),
      },
    ],
    [
      bankFilters.fromDate,
      bankFilters.toDate,
      banks.data,
      banks.error,
      banks.loading,
      finished.data,
      finished.error,
      finished.loading,
      goldFilters.ayar,
      goldFilters.metal,
      goldInventory.data,
      goldInventory.error,
      goldInventory.loading,
      taraz.data,
      taraz.error,
      taraz.loading,
      totalGoldWeight,
    ],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">موجودی و تراز</h1>
        <p className="text-sm text-muted-foreground">مرور موجودی بانک، طلا، کارساخته و خلاصه تراز</p>
      </div>

      <Tabs defaultValue="banks" items={tabItems} />
    </div>
  );
}
