"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminApplyUserProductLimits,
  adminGetEffectivePolicy,
  adminGetUserLimitReservations,
  adminGetUserLimitUsage,
  adminGetUserOverview,
  adminGetUserProductLimitsGrid,
  adminListPolicyAudit,
  adminListUserWalletAccounts,
  adminUpdateUserKyc,
  adminWalletAdjust,
  resyncUser,
} from "@/lib/api/foundation";

import type { PolicySummary } from "@/lib/contracts/foundation/dtos";
import { formatApiErrorFa } from "@/lib/contracts/errors";
import { faLabels } from "@/lib/i18n/fa";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useToast } from "@/hooks/use-toast";
// اگر LoadingOverlay را طبق نسخه‌های قبلی ساختی، این مسیر را مطابق پروژه‌ات تنظیم کن:
import { LoadingOverlay } from "@/components/ui/loading-overlay";

type TabKey =
  | "overview"
  | "wallet"
  | "kyc"
  | "settings"
  | "policy"
  | "product-limits"
  | "usage"
  | "reservations"
  | "audit"
  | "tahesab";

interface WalletAdjustForm {
  instrumentCode: string;
  amount: string;
  reason: string;
  externalRef?: string;
}

interface KycForm {
  status: "NONE" | "PENDING" | "VERIFIED" | "REJECTED";
  level: "NONE" | "BASIC" | "FULL";
  reason: string;
}

interface ProductLimitCell {
  effectiveValue: number | null;
  source: string;
}

interface ProductLimitRow {
  productId: string;
  displayName: string;
  limits: {
    buyDaily: ProductLimitCell;
    buyMonthly: ProductLimitCell;
    sellDaily: ProductLimitCell;
    sellMonthly: ProductLimitCell;
  };
}

interface ProductLimitGroup {
  groupKey: string;
  items: ProductLimitRow[];
}

interface ProductLimitsResponse {
  groups: ProductLimitGroup[];
}

type LimitField = "buyDaily" | "buyMonthly" | "sellDaily" | "sellMonthly";

function Pill({
  children,
  tone = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad" | "info";
  className?: string;
}) {
  const toneClass =
    tone === "good"
      ? "bg-accent/10 text-accent-foreground border-accent/20"
      : tone === "warn"
        ? "bg-primary/10 text-foreground border-primary/20"
        : tone === "bad"
          ? "bg-destructive/10 text-destructive border-destructive/20"
          : tone === "info"
            ? "bg-muted/60 text-foreground border-border/60"
            : "bg-muted/50 text-foreground border-border/60";

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${toneClass} ${className}`}>
      {children}
    </span>
  );
}

function formatFaNumber(v: unknown) {
  if (v === null || v === undefined || v === "") return "—";
  const n = typeof v === "number" ? v : Number(String(v));
  if (!Number.isFinite(n)) return String(v);
  return new Intl.NumberFormat("fa-IR").format(n);
}

function formatFaDate(v: unknown) {
  if (!v) return "—";
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString("fa-IR");
}

function TableWrap({ children, minWidth = 900 }: { children: React.ReactNode; minWidth?: number }) {
  return (
    <div className="-mx-4 sm:mx-0 overflow-x-auto px-4 sm:px-0">
      <div style={{ minWidth }}>{children}</div>
    </div>
  );
}

export default function AdminUserDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<TabKey>("overview");
  const [traceJson, setTraceJson] = useState<string>("");

  const [adjustForm, setAdjustForm] = useState<WalletAdjustForm>({
    instrumentCode: "",
    amount: "",
    reason: "",
    externalRef: "",
  });

  const [kycForm, setKycForm] = useState<KycForm>({
    status: "PENDING",
    level: "BASIC",
    reason: "",
  });

  const [productEdits, setProductEdits] = useState<Record<string, string>>({});

  // -------- Queries (Overview always on, others lazy by tab) --------
  const overview = useQuery({
    queryKey: ["foundation-user-overview", id],
    queryFn: () => adminGetUserOverview(id, true),
    staleTime: 30_000,
  });

  const wallet = useQuery({
    queryKey: ["foundation-user-wallet", id],
    queryFn: () => adminListUserWalletAccounts(id, { page: 1, limit: 50 }),
    enabled: tab === "wallet",
    staleTime: 20_000,
  });

  const productLimits = useQuery<ProductLimitsResponse>({
    queryKey: ["foundation-user-product-limits", id],
    queryFn: () => adminGetUserProductLimitsGrid(id) as Promise<ProductLimitsResponse>,
    enabled: tab === "product-limits",
    staleTime: 20_000,
  });

  const usage = useQuery({
    queryKey: ["foundation-user-limit-usage", id],
    queryFn: () => adminGetUserLimitUsage(id, { page: 1, limit: 20 }),
    enabled: tab === "usage",
    staleTime: 10_000,
  });

  const reservations = useQuery({
    queryKey: ["foundation-user-limit-reservations", id],
    queryFn: () => adminGetUserLimitReservations(id, { page: 1, limit: 20 }),
    enabled: tab === "reservations",
    staleTime: 10_000,
  });

  const audits = useQuery({
    queryKey: ["foundation-policy-audit", id],
    queryFn: () => adminListPolicyAudit({ page: 1, limit: 20, entityId: id }),
    enabled: tab === "audit",
    staleTime: 10_000,
  });

  // -------- Mutations --------
  const adjustMutation = useMutation({
    mutationFn: () => adminWalletAdjust(id, adjustForm),
    onSuccess: () => {
      toast({ title: faLabels.common.success });
      queryClient.invalidateQueries({ queryKey: ["foundation-user-wallet", id] });
      queryClient.invalidateQueries({ queryKey: ["foundation-user-overview", id] });
    },
    onError: (error) => toast({ title: formatApiErrorFa(error), variant: "destructive" }),
  });

  const kycMutation = useMutation({
    mutationFn: () => adminUpdateUserKyc(id, kycForm),
    onSuccess: () => {
      toast({ title: faLabels.common.success });
      queryClient.invalidateQueries({ queryKey: ["foundation-user-overview", id] });
    },
    onError: (error) => toast({ title: formatApiErrorFa(error), variant: "destructive" }),
  });

  const resyncMutation = useMutation({
    mutationFn: () => resyncUser(id),
    onSuccess: () => {
      toast({ title: faLabels.common.success });
      // refresh all visible data
      queryClient.invalidateQueries({ queryKey: ["foundation-user-overview", id] });
      queryClient.invalidateQueries({ queryKey: ["foundation-user-wallet", id] });
    },
    onError: (error) => toast({ title: formatApiErrorFa(error), variant: "destructive" }),
  });

  const applyLimitsMutation = useMutation({
    mutationFn: async () => {
      const changes = Object.entries(productEdits).reduce<Array<Record<string, unknown>>>((acc, [key, value]) => {
        const [productId, field] = key.split("|") as [string, LimitField];
        const input = (value ?? "").trim();

        const groups = productLimits.data?.groups ?? [];
        const row = groups.flatMap((g) => g.items).find((i) => i.productId === productId);
        const current = row?.limits[field]?.effectiveValue;

        // خالی => اگر منبع USER بود یعنی clear override
        if (input === "") {
          if (row?.limits[field]?.source === "USER") {
            acc.push({ productId, [field]: { mode: "CLEAR" } });
          }
          return acc;
        }

        const numeric = Number(input);
        if (Number.isFinite(numeric) && numeric > 0) {
          const same = current !== null && Number(current) === numeric;
          if (!same) {
            acc.push({ productId, [field]: { mode: "SET", value: numeric } });
          }
        }
        return acc;
      }, []);

      return adminApplyUserProductLimits(id, { changes });
    },
    onSuccess: () => {
      toast({ title: faLabels.common.success });
      setProductEdits({});
      queryClient.invalidateQueries({ queryKey: ["foundation-user-product-limits", id] });
    },
    onError: (error) => toast({ title: formatApiErrorFa(error), variant: "destructive" }),
  });

  // -------- Derived UI data --------
  const summary = overview.data?.policy?.summary;

  const policyCards = useMemo(() => {
    if (!summary) return [];
    const items: Array<{ title: string; value: PolicySummary["withdraw"] }> = [
      { title: "برداشت ریالی", value: summary.withdrawIrr },
      { title: "خرید", value: summary.tradeBuyNotionalIrr },
      { title: "فروش", value: summary.tradeSellNotionalIrr },
    ];
    return items;
  }, [summary]);

  const allProductRows = useMemo(
    () => (productLimits.data?.groups ?? []).flatMap((group) => group.items),
    [productLimits.data]
  );

  const editsCount = useMemo(() => Object.keys(productEdits).length, [productEdits]);

  // -------- Page-level loading / error --------
  if (overview.isLoading) {
    return (
      <div className="relative min-h-[320px]">
        <LoadingOverlay
          loading
          mode="fixed"
          size="lg"
          title="در حال دریافت اطلاعات کاربر"
          message="لطفاً چند لحظه صبر کنید..."
          secondaryHref="/admin/users"
        />
      </div>
    );
  }

  if (overview.isError || !overview.data) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-4 sm:p-6">
        <Card className="soft-shadow">
          <CardHeader>
            <CardTitle>خطا در دریافت اطلاعات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">{formatApiErrorFa(overview.error)}</p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => router.push("/admin/users")}>
                بازگشت به لیست کاربران
              </Button>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["foundation-user-overview", id] })}>
                تلاش مجدد
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = overview.data.user;

  const kycStatus = overview.data.kyc?.status ?? "NONE";
  const kycLevel = overview.data.kyc?.level ?? "NONE";

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-background/80 backdrop-blur border-b">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/admin/users" className="hover:underline">
                کاربران
              </Link>
              <span>/</span>
              <span className="truncate">{user.fullName}</span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold truncate">{user.fullName}</h1>
              <Pill tone="info">{faLabels.userRole[user.role]}</Pill>
              <Pill tone={user.status === "ACTIVE" ? "good" : user.status === "SUSPENDED" ? "bad" : "neutral"}>
                {faLabels.userStatus[user.status]}
              </Pill>
              <Pill tone={kycStatus === "VERIFIED" ? "good" : kycStatus === "REJECTED" ? "bad" : "warn"}>
                KYC: {faLabels.kycStatus[kycStatus as keyof typeof faLabels.kycStatus] ?? String(kycStatus)}
              </Pill>
              <Pill tone={overview.data.tahesab?.enabled ? "good" : "neutral"}>
                ته‌حساب: {overview.data.tahesab?.enabled ? "فعال" : "غیرفعال"}
              </Pill>
            </div>

            <p className="mt-1 text-xs sm:text-sm text-muted-foreground truncate">
              {user.mobile} • {user.email}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["foundation-user-overview", id] })}
              isLoading={overview.isFetching}
            >
              به‌روزرسانی
            </Button>

            <Button
              onClick={() => {
                const ok = window.confirm("از همگام‌سازی کاربر مطمئن هستید؟");
                if (ok) resyncMutation.mutate();
              }}
              isLoading={resyncMutation.isPending}
            >
              {faLabels.common.resync} کاربر
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList className="w-full flex gap-2 overflow-x-auto whitespace-nowrap rounded-2xl p-1 bg-muted/40">
          <TabsTrigger className="shrink-0" value="overview">
            نمای کلی
          </TabsTrigger>
          <TabsTrigger className="shrink-0" value="wallet">
            کیف پول
          </TabsTrigger>
          <TabsTrigger className="shrink-0" value="kyc">
            احراز هویت
          </TabsTrigger>
          <TabsTrigger className="shrink-0" value="settings">
            تنظیمات
          </TabsTrigger>
          <TabsTrigger className="shrink-0" value="policy">
            پالیسی
          </TabsTrigger>
          <TabsTrigger className="shrink-0" value="product-limits">
            محدودیت‌های محصول
          </TabsTrigger>
          <TabsTrigger className="shrink-0" value="usage">
            مصرف محدودیت‌ها
          </TabsTrigger>
          <TabsTrigger className="shrink-0" value="reservations">
            رزروهای محدودیت
          </TabsTrigger>
          <TabsTrigger className="shrink-0" value="audit">
            لاگ پالیسی
          </TabsTrigger>
          <TabsTrigger className="shrink-0" value="tahesab">
            ته‌حساب
          </TabsTrigger>
        </TabsList>

        {/* -------- Overview -------- */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="soft-shadow lg:col-span-2">
              <CardHeader>
                <CardTitle>نمای کلی</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl border bg-card/60 p-3">
                  <div className="text-xs text-muted-foreground">نقش</div>
                  <div className="mt-1 font-medium">{faLabels.userRole[user.role]}</div>
                </div>
                <div className="rounded-xl border bg-card/60 p-3">
                  <div className="text-xs text-muted-foreground">وضعیت</div>
                  <div className="mt-1 font-medium">{faLabels.userStatus[user.status]}</div>
                </div>
                <div className="rounded-xl border bg-card/60 p-3">
                  <div className="text-xs text-muted-foreground">گروه مشتری</div>
                  <div className="mt-1 font-medium">{overview.data.customerGroup?.name ?? "—"}</div>
                </div>
                <div className="rounded-xl border bg-card/60 p-3">
                  <div className="text-xs text-muted-foreground">سطح KYC</div>
                  <div className="mt-1 font-medium">
                    {faLabels.kycLevel[kycLevel as keyof typeof faLabels.kycLevel] ?? String(kycLevel)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle>ته‌حساب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">وضعیت</span>
                  <Pill tone={overview.data.tahesab.enabled ? "good" : "neutral"}>
                    {overview.data.tahesab.enabled ? "فعال" : "غیرفعال"}
                  </Pill>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">کد مشتری</span>
                  <span className="font-medium">{overview.data.tahesab.customerCode ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">گروه</span>
                  <span className="font-medium">{overview.data.tahesab.groupName ?? "—"}</span>
                </div>

                <Button variant="outline" asChild className="w-full">
                  <Link href="#tahesab">مشاهده جزئیات</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {summary ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {policyCards.map((item) => (
                <Card key={item.title} className="soft-shadow">
                  <CardHeader>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="rounded-xl border bg-card/60 p-3">
                      <div className="text-xs text-muted-foreground">روزانه</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Pill tone="info">{formatFaNumber(item.value.daily.limit)}</Pill>
                        <Pill tone="neutral">KYC: {item.value.daily.kycRequiredLevel ?? "—"}</Pill>
                        <Pill tone="neutral">{faLabels.policySource[item.value.daily.source]}</Pill>
                      </div>
                    </div>
                    <div className="rounded-xl border bg-card/60 p-3">
                      <div className="text-xs text-muted-foreground">ماهانه</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Pill tone="info">{formatFaNumber(item.value.monthly.limit)}</Pill>
                        <Pill tone="neutral">KYC: {item.value.monthly.kycRequiredLevel ?? "—"}</Pill>
                        <Pill tone="neutral">{faLabels.policySource[item.value.monthly.source]}</Pill>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
        </TabsContent>

        {/* -------- Wallet -------- */}
        <TabsContent value="wallet" className="space-y-4">
          <Card className="soft-shadow relative">
            {wallet.isLoading ? (
              <LoadingOverlay
                loading
                mode="absolute"
                title="در حال دریافت کیف پول"
                message="اطلاعات حساب‌های کیف پول در حال بارگذاری است..."
                secondaryHref="/admin/users"
              />
            ) : null}

            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>کیف پول</CardTitle>
              <Button
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["foundation-user-wallet", id] })}
                isLoading={wallet.isFetching}
              >
                به‌روزرسانی
              </Button>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(wallet.data?.items ?? []).map((item) => (
                  <div key={item.id} className="rounded-2xl border bg-card/60 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {item.instrument.code} — {item.instrument.name}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground truncate">AccountId: {item.id}</div>
                      </div>
                      <Pill tone="info">{item.instrument.code}</Pill>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">موجودی</span>
                        <span className="font-medium">
                          {item.balancesHidden || item.balance === null ? "مخفی" : formatFaNumber(item.balance)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">قابل استفاده</span>
                        <span className="font-medium">{item.availableBalance === null ? "—" : formatFaNumber(item.availableBalance)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border bg-card/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">تعدیل کیف پول</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      برای اصلاح دستی موجودی (با ثبت دلیل). لطفاً با احتیاط انجام شود.
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>کد دارایی</Label>
                    <Input
                      value={adjustForm.instrumentCode}
                      placeholder="مثلاً: IRR / XAU / USDT"
                      onChange={(e) => setAdjustForm((prev) => ({ ...prev, instrumentCode: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>مبلغ</Label>
                    <Input
                      value={adjustForm.amount}
                      inputMode="decimal"
                      placeholder="مثلاً: 100000"
                      onChange={(e) => setAdjustForm((prev) => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>علت/توضیح</Label>
                    <Input
                      value={adjustForm.reason}
                      placeholder="مثلاً: اصلاح خطای ثبت تراکنش"
                      onChange={(e) => setAdjustForm((prev) => ({ ...prev, reason: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>شناسه خارجی (اختیاری)</Label>
                    <Input
                      value={adjustForm.externalRef ?? ""}
                      placeholder="مثلاً: ticket-123 / ref-xyz"
                      onChange={(e) => setAdjustForm((prev) => ({ ...prev, externalRef: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setAdjustForm({ instrumentCode: "", amount: "", reason: "", externalRef: "" })
                    }
                  >
                    پاک کردن فرم
                  </Button>
                  <Button
                    onClick={() => {
                      const ok = window.confirm("از اعمال تعدیل کیف پول مطمئن هستید؟");
                      if (ok) adjustMutation.mutate();
                    }}
                    isLoading={adjustMutation.isPending}
                    disabled={!adjustForm.instrumentCode.trim() || !adjustForm.amount.trim() || !adjustForm.reason.trim()}
                  >
                    اعمال
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------- KYC -------- */}
        <TabsContent value="kyc" className="space-y-4">
          <Card className="soft-shadow">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>احراز هویت</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Pill tone={kycStatus === "VERIFIED" ? "good" : kycStatus === "REJECTED" ? "bad" : "warn"}>
                  وضعیت فعلی: {faLabels.kycStatus[kycStatus as keyof typeof faLabels.kycStatus] ?? String(kycStatus)}
                </Pill>
                <Pill tone="neutral">
                  سطح: {faLabels.kycLevel[kycLevel as keyof typeof faLabels.kycLevel] ?? String(kycLevel)}
                </Pill>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>وضعیت</Label>
                  <Select
                    value={kycForm.status}
                    onValueChange={(value: KycForm["status"]) => setKycForm((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">{faLabels.kycStatus.NONE}</SelectItem>
                      <SelectItem value="PENDING">{faLabels.kycStatus.PENDING}</SelectItem>
                      <SelectItem value="VERIFIED">{faLabels.kycStatus.VERIFIED}</SelectItem>
                      <SelectItem value="REJECTED">{faLabels.kycStatus.REJECTED}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>سطح</Label>
                  <Select
                    value={kycForm.level}
                    onValueChange={(value: KycForm["level"]) => setKycForm((prev) => ({ ...prev, level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">{faLabels.kycLevel.NONE}</SelectItem>
                      <SelectItem value="BASIC">{faLabels.kycLevel.BASIC}</SelectItem>
                      <SelectItem value="FULL">{faLabels.kycLevel.FULL}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-1">
                  <Label>علت/توضیح</Label>
                  <Input
                    value={kycForm.reason}
                    placeholder="در صورت نیاز دلیل را وارد کنید..."
                    onChange={(e) => setKycForm((prev) => ({ ...prev, reason: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button asChild variant="outline">
                  <Link href="/admin/kyc">رفتن به صف احراز هویت</Link>
                </Button>
                <Button onClick={() => kycMutation.mutate()} isLoading={kycMutation.isPending}>
                  {faLabels.common.save}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------- Settings -------- */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="soft-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>تنظیمات موثر</CardTitle>
              <Pill tone="info">{Object.keys(overview.data.settings.effective ?? {}).length} کلید</Pill>
            </CardHeader>

            <CardContent>
              <TableWrap minWidth={800}>
                <Table>
                  <TableHeader className="sticky top-0 bg-card/90 backdrop-blur z-10">
                    <TableRow>
                      <TableHead>کلید</TableHead>
                      <TableHead>مقدار موثر</TableHead>
                      <TableHead>منبع</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {Object.entries(overview.data.settings.effective).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">
                          {faLabels.settingsKeys[key as keyof typeof faLabels.settingsKeys] ?? key}
                        </TableCell>
                        <TableCell>{String(value)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {String(overview.data.settings.sources[key as keyof typeof overview.data.settings.sources] ?? "—")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrap>
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------- Policy -------- */}
        <TabsContent value="policy" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {policyCards.map((item) => (
              <Card key={item.title} className="soft-shadow">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="rounded-xl border bg-card/60 p-3">
                    <div className="text-xs text-muted-foreground">روزانه</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Pill tone="info">{formatFaNumber(item.value.daily.limit)}</Pill>
                      <Pill tone="neutral">KYC: {item.value.daily.kycRequiredLevel ?? "—"}</Pill>
                      <Pill tone="neutral">{faLabels.policySource[item.value.daily.source]}</Pill>
                    </div>
                  </div>

                  <div className="rounded-xl border bg-card/60 p-3">
                    <div className="text-xs text-muted-foreground">ماهانه</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Pill tone="info">{formatFaNumber(item.value.monthly.limit)}</Pill>
                      <Pill tone="neutral">KYC: {item.value.monthly.kycRequiredLevel ?? "—"}</Pill>
                      <Pill tone="neutral">{faLabels.policySource[item.value.monthly.source]}</Pill>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="soft-shadow lg:col-span-3">
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>تحلیل قوانین موثر</CardTitle>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const trace = await adminGetEffectivePolicy(id);
                      setTraceJson(JSON.stringify(trace, null, 2));
                    } catch (e) {
                      toast({ title: formatApiErrorFa(e), variant: "destructive" });
                    }
                  }}
                >
                  نمایش تحلیل
                </Button>
              </CardHeader>

              <CardContent>
                {traceJson ? (
                  <details className="rounded-2xl border bg-muted/20 p-3">
                    <summary className="cursor-pointer select-none text-sm font-medium">
                      نمایش/مخفی کردن خروجی JSON
                    </summary>
                    <pre className="mt-3 max-h-[420px] overflow-auto text-xs leading-relaxed">
                      {traceJson}
                    </pre>
                  </details>
                ) : (
                  <div className="text-sm text-muted-foreground">برای مشاهده خروجی، روی «نمایش تحلیل» کلیک کنید.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* -------- Product Limits -------- */}
        <TabsContent value="product-limits" className="space-y-4">
          <Card className="soft-shadow relative">
            {productLimits.isLoading ? (
              <LoadingOverlay
                loading
                mode="absolute"
                title="در حال دریافت محدودیت‌های محصول"
                message="لطفاً چند لحظه صبر کنید..."
                secondaryHref="/admin/users"
              />
            ) : null}

            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>محدودیت‌های محصول</CardTitle>

              <div className="flex flex-wrap items-center gap-2">
                {editsCount ? <Pill tone="warn">{editsCount} تغییر</Pill> : <Pill tone="neutral">بدون تغییر</Pill>}

                <Button
                  variant="outline"
                  onClick={() => setProductEdits({})}
                  disabled={!editsCount || applyLimitsMutation.isPending}
                >
                  ریست
                </Button>

                <Button
                  onClick={() => {
                    const ok = window.confirm("تغییرات محدودیت‌ها اعمال شود؟");
                    if (ok) applyLimitsMutation.mutate();
                  }}
                  isLoading={applyLimitsMutation.isPending}
                  disabled={!editsCount}
                >
                  اعمال
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground">
                نکته: اگر منبع مقدار «USER» باشد، خالی کردن فیلد یعنی حذف override.
              </div>

              <TableWrap minWidth={1100}>
                <Table>
                  <TableHeader className="sticky top-0 bg-card/90 backdrop-blur z-10">
                    <TableRow>
                      <TableHead>محصول</TableHead>
                      <TableHead>خرید روزانه</TableHead>
                      <TableHead>خرید ماهانه</TableHead>
                      <TableHead>فروش روزانه</TableHead>
                      <TableHead>فروش ماهانه</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {allProductRows.map((row) => {
                      const fields: LimitField[] = ["buyDaily", "buyMonthly", "sellDaily", "sellMonthly"];
                      const isRowDirty = fields.some((f) => Object.prototype.hasOwnProperty.call(productEdits, `${row.productId}|${f}`));

                      return (
                        <TableRow key={row.productId} className={isRowDirty ? "bg-muted/25" : ""}>
                          <TableCell className="font-medium">{row.displayName}</TableCell>

                          {fields.map((field) => {
                            const editKey = `${row.productId}|${field}`;
                            const cell = row.limits[field];
                            const effective = cell.effectiveValue;
                            const source = cell.source;

                            return (
                              <TableCell key={editKey}>
                                <div className="space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Pill tone="info">{effective === null ? "—" : formatFaNumber(effective)}</Pill>
                                    <Pill tone={source === "USER" ? "warn" : "neutral"}>{source}</Pill>
                                  </div>

                                  <Input
                                    value={productEdits[editKey] ?? ""}
                                    inputMode="decimal"
                                    placeholder={source === "USER" ? "خالی = حذف override" : "مقدار جدید"}
                                    onChange={(e) => setProductEdits((prev) => ({ ...prev, [editKey]: e.target.value }))}
                                  />
                                </div>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableWrap>
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------- Usage -------- */}
        <TabsContent value="usage" className="space-y-4">
          <Card className="soft-shadow relative">
            {usage.isLoading ? (
              <LoadingOverlay loading mode="absolute" title="در حال دریافت مصرف محدودیت‌ها" message="..." secondaryHref="/admin/users" />
            ) : null}

            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>مصرف محدودیت‌ها</CardTitle>
              <Button
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["foundation-user-limit-usage", id] })}
                isLoading={usage.isFetching}
              >
                به‌روزرسانی
              </Button>
            </CardHeader>

            <CardContent>
              <TableWrap minWidth={1100}>
                <Table>
                  <TableHeader className="sticky top-0 bg-card/90 backdrop-blur z-10">
                    <TableRow>
                      <TableHead>دوره</TableHead>
                      <TableHead>اکشن</TableHead>
                      <TableHead>متریک</TableHead>
                      <TableHead>مصرف شده</TableHead>
                      <TableHead>رزرو شده</TableHead>
                      <TableHead>کلید دارایی</TableHead>
                      <TableHead>تاریخ</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {((usage.data?.items as Array<Record<string, unknown>> | undefined) ?? []).map((row, index) => (
                      <TableRow key={`usage-${index}`}>
                        <TableCell>{String(row.periodKey ?? row.period ?? "—")}</TableCell>
                        <TableCell>{String(row.action ?? "—")}</TableCell>
                        <TableCell>{String(row.metric ?? "—")}</TableCell>
                        <TableCell className="font-medium">{formatFaNumber(row.usedAmount ?? "—")}</TableCell>
                        <TableCell>{formatFaNumber(row.reservedAmount ?? "—")}</TableCell>
                        <TableCell>{String(row.instrumentKey ?? "—")}</TableCell>
                        <TableCell className="text-muted-foreground">{formatFaDate(row.createdAt ?? row.updatedAt ?? "—")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrap>
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------- Reservations -------- */}
        <TabsContent value="reservations" className="space-y-4">
          <Card className="soft-shadow relative">
            {reservations.isLoading ? (
              <LoadingOverlay loading mode="absolute" title="در حال دریافت رزروها" message="..." secondaryHref="/admin/users" />
            ) : null}

            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>رزروهای محدودیت</CardTitle>
              <Button
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["foundation-user-limit-reservations", id] })}
                isLoading={reservations.isFetching}
              >
                به‌روزرسانی
              </Button>
            </CardHeader>

            <CardContent>
              <TableWrap minWidth={1000}>
                <Table>
                  <TableHeader className="sticky top-0 bg-card/90 backdrop-blur z-10">
                    <TableRow>
                      <TableHead>وضعیت</TableHead>
                      <TableHead>مبلغ</TableHead>
                      <TableHead>اکشن</TableHead>
                      <TableHead>متریک</TableHead>
                      <TableHead>کلید دارایی</TableHead>
                      <TableHead>تاریخ</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {((reservations.data?.items as Array<Record<string, unknown>> | undefined) ?? []).map((row, index) => (
                      <TableRow key={`reservation-${index}`}>
                        <TableCell>{String(row.status ?? "—")}</TableCell>
                        <TableCell className="font-medium">{formatFaNumber(row.amount ?? "—")}</TableCell>
                        <TableCell>{String(row.action ?? "—")}</TableCell>
                        <TableCell>{String(row.metric ?? "—")}</TableCell>
                        <TableCell>{String(row.instrumentKey ?? "—")}</TableCell>
                        <TableCell className="text-muted-foreground">{formatFaDate(row.createdAt ?? row.updatedAt ?? "—")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrap>
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------- Audit -------- */}
        <TabsContent value="audit" className="space-y-4">
          <Card className="soft-shadow relative">
            {audits.isLoading ? (
              <LoadingOverlay loading mode="absolute" title="در حال دریافت لاگ پالیسی" message="..." secondaryHref="/admin/users" />
            ) : null}

            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>لاگ تغییرات پالیسی</CardTitle>
              <Button
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["foundation-policy-audit", id] })}
                isLoading={audits.isFetching}
              >
                به‌روزرسانی
              </Button>
            </CardHeader>

            <CardContent>
              <TableWrap minWidth={1050}>
                <Table>
                  <TableHeader className="sticky top-0 bg-card/90 backdrop-blur z-10">
                    <TableRow>
                      <TableHead>نوع موجودیت</TableHead>
                      <TableHead>شناسه موجودیت</TableHead>
                      <TableHead>اکشن</TableHead>
                      <TableHead>کاربر انجام‌دهنده</TableHead>
                      <TableHead>زمان</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {((audits.data?.items as Array<Record<string, unknown>> | undefined) ?? []).map((row, index) => (
                      <TableRow key={`audit-${index}`}>
                        <TableCell>{String(row.entityType ?? "—")}</TableCell>
                        <TableCell className="font-medium">{String(row.entityId ?? "—")}</TableCell>
                        <TableCell>{String(row.action ?? row.event ?? "—")}</TableCell>
                        <TableCell>{String(row.actorId ?? "—")}</TableCell>
                        <TableCell className="text-muted-foreground">{formatFaDate(row.createdAt ?? "—")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrap>
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------- Tahesab -------- */}
        <TabsContent value="tahesab" className="space-y-4" id="tahesab">
          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle>ته‌حساب</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border bg-card/60 p-4">
                  <div className="text-xs text-muted-foreground">فعال</div>
                  <div className="mt-1 font-medium">{overview.data.tahesab.enabled ? "بله" : "خیر"}</div>
                </div>

                <div className="rounded-2xl border bg-card/60 p-4">
                  <div className="text-xs text-muted-foreground">کد مشتری</div>
                  <div className="mt-1 font-medium">{overview.data.tahesab.customerCode ?? "—"}</div>
                </div>

                <div className="rounded-2xl border bg-card/60 p-4 sm:col-span-2">
                  <div className="text-xs text-muted-foreground">گروه</div>
                  <div className="mt-1 font-medium">{overview.data.tahesab.groupName ?? "—"}</div>
                </div>
              </div>

              <details className="rounded-2xl border bg-muted/20 p-3">
                <summary className="cursor-pointer select-none text-sm font-medium">
                  آخرین Outbox
                </summary>
                <pre className="mt-3 max-h-[420px] overflow-auto text-xs leading-relaxed">
                  {JSON.stringify(overview.data.tahesab.lastOutbox, null, 2)}
                </pre>
              </details>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" asChild>
                  <Link href="/admin/users">بازگشت به لیست کاربران</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
