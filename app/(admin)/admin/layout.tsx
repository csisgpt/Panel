"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { Sidebar, NavItem } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { adminNavItems, getVisibleNav } from "@/lib/navigation/registry";
import { isAdmin } from "@/lib/auth/roles";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, hydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems: NavItem[] = useMemo(() => {
    const visible = getVisibleNav(adminNavItems);
    return visible.map((item) => ({
      href: item.href,
      label: item.labelFa,
      icon: item.icon,
    }));
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
    <div className="flex min-h-screen bg-muted/30" dir="rtl">
      <div className="fixed inset-y-0 right-0 hidden w-72 border-l bg-card/90 backdrop-blur lg:flex">
        <Sidebar
          className="h-full"
          navItems={navItems}
          title="پنل ادمین"
          subtitle={user?.fullName}
        />
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <Sidebar className="h-full" onNavigate={() => setOpen(false)} navItems={navItems} title="پنل ادمین" />
      </Sheet>

      <div className="flex min-h-screen flex-1 flex-col lg:mr-72">
        <Topbar onMenuClick={() => setOpen(true)} userName={user?.fullName} pageTitle="ادمین" />
        <main className="flex-1 pb-8">
          <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-4 md:px-6 lg:px-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
