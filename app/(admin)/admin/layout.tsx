"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import { useAuth } from "@/lib/auth-context";
import { isAdmin } from "@/lib/auth/roles";
import { adminNavItems, getVisibleNav } from "@/lib/navigation/registry";

import { AppShell } from "@/components/layout/app-shell";
import { Sidebar, type NavSection } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { PageShell } from "@/components/layout/page-shell";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const COLLAPSE_KEY = "shell-sidebar-collapsed";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, hydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // restore collapse on mount (client only)
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "true");
    } catch {}
  }, []);

  // persist collapse
  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? "true" : "false");
    } catch {}
  }, [collapsed]);

  const navSections = useMemo(() => {
    const visible = getVisibleNav(adminNavItems);

    const mapItem = (item: typeof visible[number]) => ({
      href: item.href,
      label: item.labelFa,
      icon: item.icon,
      badge: (item as any).badge as string | undefined, // اگر در registry دارید
    });

    const byKey = (keys: string[]) => visible.filter((i) => keys.includes(i.key)).map(mapItem);

    const sections: NavSection[] = [
      {
        id: "ops",
        label: "عملیات",
        items: byKey(["dashboard", "deposits", "withdrawals", "p2p-ops", "p2p-withdrawals", "p2p-allocations" , "p2p-system-destinations"]),
      },
      {
        id: "management",
        label: "مدیریت",
        items: byKey(["users", "customer-groups", "kyc", "policy-rules", "instruments"]),
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
      { id: "risk", label: "ریسک", items: byKey(["risk-settings", "risk-monitor"]) },
      { id: "system", label: "سیستم", items: byKey(["files", "settings"]) },
    ];

    return sections.filter((s) => s.items.length > 0);
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

  if (!hydrated) {
    return (
      <LoadingOverlay
        mode="fixed"
        loading
        size="lg"
        title="در حال همگام‌سازی"
        message="در حال دریافت داده‌ها از سرور..."
        secondaryHref="/admin"
      />
    );
  }

  if (!isAuthenticated || !isAdmin(user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6" dir="rtl">
        <div className="max-w-md space-y-4 rounded-2xl border bg-card p-6 text-center shadow-sm">
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

  const flatItems = navSections.flatMap((s) => s.items);

  return (
    <div dir="rtl">
      <AppShell
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((x) => !x)}
        sidebar={
          <Sidebar
            brand="پنل ادمین"
            subtitle={user?.fullName ?? "پنل مدیریت"}
            sections={navSections}
            navItems={flatItems}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((x) => !x)}
          />
        }
        topbar={
          <Topbar
            onMenuClick={() => setMobileOpen(true)}
            userName={user?.fullName}
            pageTitle="ادمین"
          />
        }
      >
        <PageShell>{children}</PageShell>
      </AppShell>

      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="p-0">
          <Sidebar
            brand="پنل ادمین"
            subtitle={user?.fullName ?? "پنل مدیریت"}
            sections={navSections}
            navItems={flatItems}
            collapsed={false}
            mobile
            onNavigate={() => setMobileOpen(false)}
            onToggleCollapse={() => setCollapsed((x) => !x)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
