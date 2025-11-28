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
  const pageTitle = titles[pathname] ?? "پنل";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-sm font-semibold">{pageTitle}</p>
          <p className="text-xs text-muted-foreground">نمایش وضعیت لحظه‌ای</p>
        </div>
        <Badge className="ml-2" variant="outline">
          محیط نمایشی
        </Badge>
      </div>
      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="hidden w-80 items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-sm lg:flex">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="جستجو در سیستم" className="border-none bg-transparent shadow-none focus-visible:ring-0" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full border"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <div className="flex items-center gap-2 rounded-full border px-3 py-1">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">خوش آمدید</p>
            <p className="text-sm font-semibold">{userName ?? "کاربر"}</p>
          </div>
          <Avatar name={userName ?? "کاربر"} />
        </div>
      </div>
    </header>
  );
}
