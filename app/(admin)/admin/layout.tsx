"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { Sidebar, NavItem } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Users,
  Tags,
  FileStack,
  Cog,
  Activity,
  Link as LinkIcon,
  NotepadText,
  Layers,
  LayoutDashboard,
  FileText,
  Scale,
} from "lucide-react";

const adminNav: NavItem[] = [
  { href: "/admin/dashboard", label: "داشبورد", icon: Shield },
  { href: "/admin/users", label: "کاربران", icon: Users },
  { href: "/admin/instruments", label: "ابزارها", icon: Tags },
  { href: "/admin/pricing", label: "قیمت‌گذاری", icon: NotepadText },
  { href: "/admin/pricing/logs", label: "گزارش قیمت", icon: Activity },
  { href: "/admin/tahesab/overview", label: "مرور ته‌حساب", icon: LayoutDashboard },
  { href: "/admin/tahesab/connection", label: "اتصال تاهساب", icon: LinkIcon },
  { href: "/admin/tahesab/mapping", label: "نگاشت", icon: Layers },
  { href: "/admin/tahesab/reconciliation", label: "مغایرت‌ها", icon: Scale },
  { href: "/admin/tahesab/documents", label: "سندهای تاهساب", icon: FileText },
  { href: "/admin/tahesab/logs", label: "گزارش تاهساب", icon: FileStack },
  { href: "/admin/risk/settings", label: "تنظیمات ریسک", icon: Cog },
  { href: "/admin/risk/monitor", label: "پایش ریسک", icon: Activity },
  { href: "/admin/files", label: "فایل‌ها", icon: FileStack },
  { href: "/admin/settings", label: "تنظیمات", icon: Cog },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6" dir="rtl">
        <div className="max-w-md space-y-4 rounded-lg border bg-card p-6 text-center shadow-sm">
          <p className="text-lg font-semibold">ابتدا وارد شوید</p>
          <p className="text-sm text-muted-foreground">
            برای دسترسی به بخش ادمین باید وارد سامانه شوید. از یکی از گزینه‌های زیر استفاده کنید.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="default">
              <Link href="/login">بازگشت به صفحه ورود</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/trader/dashboard">مشاهده پنل معامله‌گر</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6" dir="rtl">
        <div className="max-w-md space-y-4 rounded-lg border bg-card p-6 text-center shadow-sm">
          <p className="text-lg font-semibold">دسترسی ندارید</p>
          <p className="text-sm text-muted-foreground">
            برای مشاهده بخش ادمین باید با نقش ادمین وارد شوید یا به صفحه معامله‌گر بروید.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="default">
              <Link href="/login">بازگشت به صفحه ورود</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/trader/dashboard">مشاهده پنل معامله‌گر</Link>
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
          navItems={adminNav}
          title="پنل ادمین"
          subtitle={user?.fullName}
        />
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <Sidebar className="h-full" onNavigate={() => setOpen(false)} navItems={adminNav} title="پنل ادمین" />
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
