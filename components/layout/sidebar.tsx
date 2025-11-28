'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Users, CreditCard, Receipt, Settings, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/dashboard", label: "داشبورد", icon: Home },
  { href: "/customers", label: "مشتریان", icon: Users },
  { href: "/accounts", label: "حساب‌ها", icon: CreditCard },
  { href: "/transactions", label: "تراکنش‌ها", icon: Receipt },
  { href: "/settings", label: "تنظیمات", icon: Settings }
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className={cn("flex h-full w-64 flex-col border-l bg-card/95 px-4 py-6 shadow-xl", className)}>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">پنل مدیریت مالی</p>
          <p className="text-lg font-semibold">تاهساب | Panel</p>
        </div>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/70"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <Button variant="outline" className="flex w-full items-center justify-center gap-2" onClick={logout}>
          <LogOut className="h-4 w-4" />
          <span>خروج</span>
        </Button>
      </div>
    </aside>
  );
}
