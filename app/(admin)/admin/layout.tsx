"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Sidebar, NavItem } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Sheet } from "@/components/ui/sheet";
import { Shield, Users, Tags, FileStack, Cog, Activity, Link as LinkIcon, NotepadText, Layers } from "lucide-react";

const adminNav: NavItem[] = [
  { href: "/admin/dashboard", label: "داشبورد", icon: Shield },
  { href: "/admin/users", label: "کاربران", icon: Users },
  { href: "/admin/instruments", label: "ابزارها", icon: Tags },
  { href: "/admin/pricing", label: "قیمت‌گذاری", icon: NotepadText },
  { href: "/admin/pricing/logs", label: "گزارش قیمت", icon: Activity },
  { href: "/admin/tahesab/connection", label: "اتصال تاهساب", icon: LinkIcon },
  { href: "/admin/tahesab/mapping", label: "نگاشت", icon: Layers },
  { href: "/admin/tahesab/logs", label: "گزارش تاهساب", icon: FileStack },
  { href: "/admin/risk/settings", label: "تنظیمات ریسک", icon: Cog },
  { href: "/admin/risk/monitor", label: "پایش ریسک", icon: Activity },
  { href: "/admin/files", label: "فایل‌ها", icon: FileStack },
  { href: "/admin/settings", label: "تنظیمات", icon: Cog },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;
  if (!isAdmin) {
    return <div className="flex min-h-screen items-center justify-center">دسترسی ندارید</div>;
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
