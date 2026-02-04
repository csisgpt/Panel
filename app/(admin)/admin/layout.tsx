"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Sidebar, NavSection } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { adminNavItems, getVisibleNav } from "@/lib/navigation/registry";
import { isAdmin } from "@/lib/auth/roles";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, hydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = useMemo(() => {
    const visible = getVisibleNav(adminNavItems);
    const mapItem = (item: typeof visible[number]) => ({
      href: item.href,
      label: item.labelFa,
      icon: item.icon,
    });
    const byKey = (keys: string[]) => visible.filter((item) => keys.includes(item.key)).map(mapItem);
    const sections: NavSection[] = [
      {
        id: "ops",
        label: "عملیات",
        items: byKey(["dashboard", "p2p-ops", "p2p-withdrawals", "p2p-allocations"]),
      },
      {
        id: "management",
        label: "مدیریت",
        items: byKey(["users", "instruments", "pricing", "pricing-logs"]),
      },
      {
        id: "tahesab",
        label: "ته‌حساب",
        items: byKey([
          "tahesab-overview",
          "tahesab-connection",
          "tahesab-mapping",
          "tahesab-reconciliation",
          "tahesab-documents",
          "tahesab-raw-documents",
          "tahesab-customers",
          "tahesab-balances",
          "tahesab-master-data",
          "tahesab-tags",
          "tahesab-manual-documents",
          "tahesab-logs",
        ]),
      },
      {
        id: "risk",
        label: "ریسک",
        items: byKey(["risk-settings", "risk-monitor"]),
      },
      {
        id: "system",
        label: "سیستم",
        items: byKey(["files", "settings"]),
      },
    ];
    return sections.filter((section) => section.items.length > 0);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!isAdmin(user)) {
      router.replace("/trader/dashboard");
    }
  }, [hydrated, isAuthenticated, pathname, router, user]);

  if (!isAuthenticated || !isAdmin(user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6" dir="rtl">
        <div className="max-w-md space-y-4 rounded-lg border bg-card p-6 text-center shadow-sm">
          <p className="text-lg font-semibold">دسترسی محدود</p>
          <p className="text-sm text-muted-foreground">برای مشاهده پنل ادمین ابتدا وارد حساب کاربری خود شوید.</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="default">
              <Link href="/login">بازگشت به صفحه ورود</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <AppShell
        sidebar={
          <Sidebar
            className="h-full"
            sections={navItems}
            navItems={navItems.flatMap((section) => section.items)}
            title="پنل ادمین"
            subtitle={user?.fullName}
          />
        }
        topbar={<Topbar onMenuClick={() => setOpen(true)} userName={user?.fullName} pageTitle="ادمین" />}
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </AppShell>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" size="sm" className="p-0">
          <Sidebar
            className="h-full"
            onNavigate={() => setOpen(false)}
            sections={navItems}
            navItems={navItems.flatMap((section) => section.items)}
            title="پنل ادمین"
            subtitle={user?.fullName}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
