"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Sidebar, NavItem } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Sheet } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { clearSession } from "@/lib/session";
import { isAdmin, isUserPanel } from "@/lib/auth/roles";
import { getVisibleNav, traderNavItems } from "@/lib/navigation/registry";
import BottomNav from "@/components/navigation/BottomNav";

export default function TraderLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const { isAuthenticated, user, hydrated } = useAuth();

  const navItems: NavItem[] = useMemo(() => {
    const visible = getVisibleNav(traderNavItems);
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
    if (isAdmin(user)) {
      router.replace("/admin");
      return;
    }
    if (!isUserPanel(user)) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, pathname, router, user]);

  const initials = useMemo(() => (user?.fullName ? user.fullName.slice(0, 2) : ""), [user?.fullName]);

  if (!user) return null;

  const handleLogout = () => {
    clearSession();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-muted/30" dir="rtl">
      <div className="fixed inset-y-0 right-0 hidden w-72 border-l bg-card/90 backdrop-blur lg:flex">
        <Sidebar className="h-full" navItems={navItems} title="پنل کاربری" subtitle={user.fullName} />
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <Sidebar className="h-full" onNavigate={() => setOpen(false)} navItems={navItems} title="پنل کاربری" />
      </Sheet>

      <div className="flex min-h-screen flex-1 flex-col lg:mr-72">
        <Topbar
          onMenuClick={() => setOpen(true)}
          userName={user.fullName}
          userRole="کاربر"
          pageTitle="پنل کاربری"
          badge={initials}
          onLogout={handleLogout}
        />
        <main className="flex-1 pb-24">
          <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-4 md:px-6 lg:px-10">{children}</div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
