"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import {
  getTahesabBankAccounts,
  getTahesabCoinTypes,
  getTahesabWorkNames,
  type TahesabBankAccount,
  type TahesabCoinType,
  type TahesabWorkName,
} from "@/lib/api/tahesab";

type LoadState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
};

export default function TahesabMasterDataPage() {
  const [coins, setCoins] = useState<LoadState<TahesabCoinType[]>>({ data: [], loading: true, error: null });
  const [bankAccounts, setBankAccounts] = useState<LoadState<TahesabBankAccount[]>>({ data: [], loading: true, error: null });
  const [workNames, setWorkNames] = useState<LoadState<TahesabWorkName[]>>({ data: [], loading: true, error: null });
  const [coinQuery, setCoinQuery] = useState("");

  useEffect(() => {
    const loadCoins = async () => {
      setCoins((prev) => ({ ...prev, loading: true }));
      try {
        const data = await getTahesabCoinTypes();
        setCoins({ data, loading: false, error: null });
      } catch (err) {
        setCoins({ data: [], loading: false, error: "خطا در دریافت اطلاعات سکه" });
      }
    };
    loadCoins();
  }, []);

  useEffect(() => {
    const loadBanks = async () => {
      setBankAccounts((prev) => ({ ...prev, loading: true }));
      try {
        const data = await getTahesabBankAccounts();
        setBankAccounts({ data, loading: false, error: null });
      } catch (err) {
        setBankAccounts({ data: [], loading: false, error: "خطا در دریافت حساب‌های بانکی" });
      }
    };
    loadBanks();
  }, []);

  useEffect(() => {
    const loadWorkNames = async () => {
      setWorkNames((prev) => ({ ...prev, loading: true }));
      try {
        const data = await getTahesabWorkNames();
        setWorkNames({ data, loading: false, error: null });
      } catch (err) {
        setWorkNames({ data: [], loading: false, error: "خطا در دریافت نام کار" });
      }
    };
    loadWorkNames();
  }, []);

  const filteredCoins = useMemo(
    () => coins.data.filter((coin) => coin.name.toLowerCase().includes(coinQuery.toLowerCase())),
    [coinQuery, coins.data]
  );

  const tabItems = useMemo(
    () => [
      {
        value: "coins",
        label: "انواع سکه",
        content: (
          <div className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>جستجوی سکه</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="نام سکه"
                  value={coinQuery}
                  onChange={(e) => setCoinQuery(e.target.value)}
                  className="max-w-sm"
                />
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>لیست سکه‌ها</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {coins.loading ? (
                  <Skeleton className="h-40 w-full" />
                ) : coins.error ? (
                  <p className="text-sm text-destructive">{coins.error}</p>
                ) : filteredCoins.length === 0 ? (
                  <p className="text-sm text-muted-foreground">موردی یافت نشد.</p>
                ) : (
                  <table className="w-full text-right text-sm">
                    <thead className="text-xs text-muted-foreground">
                      <tr>
                        <th className="p-2">نام</th>
                        <th className="p-2">وزن</th>
                        <th className="p-2">عیار</th>
                        <th className="p-2">توضیحات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCoins.map((coin) => (
                        <tr key={coin.name} className="border-t">
                          <td className="p-2 font-semibold">{coin.name}</td>
                          <td className="p-2">{coin.weight ?? "-"}</td>
                          <td className="p-2">{coin.ayar ?? "-"}</td>
                          <td className="p-2">{coin.description ?? "-"}</td>
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
        value: "banks",
        label: "حساب‌های بانکی",
        content: (
          <div className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>حساب‌های بانکی</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {bankAccounts.loading ? (
                  <Skeleton className="h-40 w-full" />
                ) : bankAccounts.error ? (
                  <p className="text-sm text-destructive">{bankAccounts.error}</p>
                ) : bankAccounts.data.length === 0 ? (
                  <p className="text-sm text-muted-foreground">موردی وجود ندارد.</p>
                ) : (
                  <table className="w-full text-right text-sm">
                    <thead className="text-xs text-muted-foreground">
                      <tr>
                        <th className="p-2">بانک</th>
                        <th className="p-2">شماره حساب</th>
                        <th className="p-2">شبا</th>
                        <th className="p-2">شعبه</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bankAccounts.data.map((account) => (
                        <tr key={`${account.bankName}-${account.accountNumber}`} className="border-t">
                          <td className="p-2 font-semibold">{account.bankName}</td>
                          <td className="p-2">{account.accountNumber}</td>
                          <td className="p-2">{account.sheba ?? "-"}</td>
                          <td className="p-2">{account.branch ?? "-"}</td>
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
        value: "works",
        label: "نام کار",
        content: (
          <div className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>نام‌های کارساخته</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {workNames.loading ? (
                  <Skeleton className="h-40 w-full" />
                ) : workNames.error ? (
                  <p className="text-sm text-destructive">{workNames.error}</p>
                ) : workNames.data.length === 0 ? (
                  <p className="text-sm text-muted-foreground">موردی وجود ندارد.</p>
                ) : (
                  <table className="w-full text-right text-sm">
                    <thead className="text-xs text-muted-foreground">
                      <tr>
                        <th className="p-2">نام کار</th>
                        <th className="p-2">فلز</th>
                        <th className="p-2">دسته</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workNames.data.map((work) => (
                        <tr key={`${work.workName}-${work.metal}`} className="border-t">
                          <td className="p-2 font-semibold">{work.workName}</td>
                          <td className="p-2">{work.metal}</td>
                          <td className="p-2">{work.category ?? "-"}</td>
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
    ],
    [bankAccounts, coins, filteredCoins, coinQuery, workNames]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">اطلاعات پایه تاهساب</h1>
        <p className="text-sm text-muted-foreground">انواع سکه، حساب‌های بانکی و نام کارساخته</p>
      </div>

      <Tabs defaultValue="coins" items={tabItems} />
    </div>
  );
}
