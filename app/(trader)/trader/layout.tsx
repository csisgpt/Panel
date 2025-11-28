"use client";

import React, { useEffect, useState } from "react";
import { Sidebar, NavItem } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/sheet";
import { LayoutDashboard, Coins, Users, ListOrdered, ScrollText, Banknote, Receipt } from "lucide-react";

const traderNav: NavItem[] = [
  { href: "/trader/dashboard", label: "داشبورد", icon: LayoutDashboard },
  { href: "/trader/prices", label: "تابلوی قیمت", icon: Coins },
  { href: "/trader/customers", label: "مشتریان", icon: Users },
  { href: "/trader/positions", label: "موقعیت‌ها", icon: ListOrdered },
  { href: "/trader/transactions", label: "تراکنش‌ها", icon: ScrollText },
  { href: "/trader/remittances", label: "حواله‌ها", icon: Receipt },
  { href: "/trader/settlement", label: "تسویه", icon: Banknote },
];

export default function TraderLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isTrader, user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;
  if (!isTrader) {
    return <div className="flex min-h-screen items-center justify-center">دسترسی ندارید</div>;
  }

  return (
    <div className="flex min-h-screen bg-muted/30" dir="rtl">
      <div className="fixed inset-y-0 right-0 hidden w-72 border-l bg-card/90 backdrop-blur lg:flex">
        <Sidebar className="h-full" navItems={traderNav} title="پنل معامله‌گر" subtitle={user?.fullName} />
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <Sidebar className="h-full" onNavigate={() => setOpen(false)} navItems={traderNav} title="پنل معامله‌گر" />
      </Sheet>

      <div className="flex min-h-screen flex-1 flex-col lg:mr-72">
        <Topbar onMenuClick={() => setOpen(true)} userName={user?.fullName} pageTitle="معامله‌گر" />
        <main className="flex-1 pb-8">
          <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-4 md:px-6 lg:px-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
