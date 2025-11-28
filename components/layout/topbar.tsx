'use client';

import { Search, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar } from "../ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface TopbarProps {
  onMenuClick?: () => void;
  userName?: string;
}

const titles: Record<string, string> = {
  "/dashboard": "داشبورد",
  "/customers": "مشتریان",
  "/accounts": "حساب‌ها",
  "/transactions": "تراکنش‌ها",
  "/settings": "تنظیمات"
};

export function Topbar({ onMenuClick, userName }: TopbarProps) {
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();
  const pageTitle = Object.entries(titles).find(([key]) => pathname.startsWith(key))?.[1] ?? "پنل";

  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="flex w-full flex-col gap-3 px-3 py-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="باز کردن منو">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground">نمای کلی</p>
              <p className="text-lg font-semibold">{pageTitle}</p>
            </div>
            <Badge className="ml-1" variant="outline">
              محیط نمایشی
            </Badge>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full border"
              aria-label="تغییر تم"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <div className="hidden items-center gap-2 rounded-full border px-3 py-1 sm:flex">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">خوش آمدید</p>
                <p className="text-sm font-semibold">{userName ?? "کاربر"}</p>
              </div>
              <Avatar name={userName ?? "کاربر"} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div
            className={cn(
              "flex w-full items-center gap-2 rounded-2xl border bg-card px-3 py-2 shadow-sm",
              "lg:max-w-xl"
            )}
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="جستجو در سیستم"
              className="border-none bg-transparent text-sm shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              <span className="text-[11px]">وضعیت: پایدار</span>
            </Badge>
            <div className="flex items-center gap-2 rounded-full border px-3 py-1 sm:hidden">
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">خوش آمدید</p>
                <p className="text-xs font-semibold">{userName ?? "کاربر"}</p>
              </div>
              <Avatar name={userName ?? "کاربر"} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
