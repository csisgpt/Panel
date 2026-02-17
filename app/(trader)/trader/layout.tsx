"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Sidebar, NavSection } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { isAdmin, isUserPanel } from "@/lib/auth/roles";
import { getVisibleNav, traderNavItems } from "@/lib/navigation/registry";
import BottomNav from "@/components/navigation/BottomNav";

export default function TraderLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const { isAuthenticated, user, hydrated } = useAuth();

  const navItems = useMemo(() => {
    const visible = getVisibleNav(traderNavItems);
    const mapItem = (item: typeof visible[number]) => ({
      href: item.href,
      label: item.labelFa,
      icon: item.icon,
    });
    const byKey = (keys: string[]) => visible.filter((item) => keys.includes(item.key)).map(mapItem);
    const sections: NavSection[] = [
      { id: "main", label: "اصلی", items: byKey(["dashboard", "requests", "history"]) },
      { id: "p2p", label: "عملیات P2P", items: byKey(["payer", "receiver"]) },
      { id: "settings", label: "سایر", items: byKey(["destinations", "profile"]) },
    ];
    return sections.filter((section) => section.items.length > 0);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }
    if (isAdmin(user)) {
      router.replace("/admin/dashboard");
      return;
    }
    if (!isUserPanel(user)) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, pathname, router, user]);

  const initials = useMemo(() => (user?.fullName ? user.fullName.slice(0, 2) : ""), [user?.fullName]);

  if (!user) return null;

  return (
    <div dir="rtl">
      <AppShell
        sidebar={
          <Sidebar
            className="h-full"
            sections={navItems}
            navItems={navItems.flatMap((section) => section.items)}
            title="پنل کاربری"
            subtitle={user.fullName}
          />
        }
        topbar={
          <Topbar
            onMenuClick={() => setOpen(true)}
            userName={user.fullName}
            userRole="کاربر"
            pageTitle="پنل کاربری"
            badge={initials}
          />
        }
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        <BottomNav />
      </AppShell>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" size="sm" className="p-0">
          <Sidebar
            className="h-full"
            onNavigate={() => setOpen(false)}
            sections={navItems}
            navItems={navItems.flatMap((section) => section.items)}
            title="پنل کاربری"
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
