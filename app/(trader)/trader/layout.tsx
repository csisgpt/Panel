"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Sidebar, NavItem } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Sheet } from "@/components/ui/sheet";
import { LayoutDashboard, ScrollText, Receipt, Users, Banknote } from "lucide-react";
import { useRouter } from "next/navigation";

import { getMockUser } from "@/lib/mock-data";
import { clearSession, getSession } from "@/lib/session";
import { BackendUser } from "@/lib/types/backend";

const traderNav: NavItem[] = [
  { href: "/trader/dashboard", label: "داشبورد", icon: LayoutDashboard },
  { href: "/trader/transactions", label: "تراکنش‌ها", icon: ScrollText },
  { href: "/trader/remittances", label: "حواله‌ها", icon: Receipt },
  { href: "/trader/customers", label: "مشتریان", icon: Users },
  { href: "/trader/settlement", label: "تسویه", icon: Banknote },
];

export default function TraderLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<BackendUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== "TRADER") {
      router.replace("/login");
      return;
    }
    getMockUser(session.userId)
      .then((u) => setUser(u))
      .catch(() => {
        clearSession();
        router.replace("/login");
      });
  }, [router]);

  const initials = useMemo(() => (user?.fullName ? user.fullName.slice(0, 2) : ""), [user?.fullName]);

  if (!user) return null;

  const handleLogout = () => {
    clearSession();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-muted/30" dir="rtl">
      <div className="fixed inset-y-0 right-0 hidden w-72 border-l bg-card/90 backdrop-blur lg:flex">
        <Sidebar className="h-full" navItems={traderNav} title="پنل معامله‌گر" subtitle={user.fullName} />
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <Sidebar className="h-full" onNavigate={() => setOpen(false)} navItems={traderNav} title="پنل معامله‌گر" />
      </Sheet>

      <div className="flex min-h-screen flex-1 flex-col lg:mr-72">
        <Topbar
          onMenuClick={() => setOpen(true)}
          userName={user.fullName}
          userRole="معامله‌گر"
          pageTitle="معامله‌گر"
          badge={initials}
          onLogout={handleLogout}
        />
        <main className="flex-1 pb-8">
          <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-4 md:px-6 lg:px-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
