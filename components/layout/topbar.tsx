"use client";

import { Search, Sun, Moon, Menu, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar } from "../ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface TopbarProps {
  onMenuClick?: () => void;
  userName?: string;
  userRole?: string;
  pageTitle?: string;
  badge?: string;
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
}

export function Topbar({
  onMenuClick,
  userName,
  userRole,
  pageTitle,
  badge,
  breadcrumbs,
  actions,
}: TopbarProps) {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="flex w-full flex-col gap-3 px-3 py-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMenuClick}
              aria-label="باز کردن منو"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div
              className={cn(
                "flex w-full items-center gap-2 rounded-2xl border bg-card/80 px-3 py-0 shadow-sm",
                "lg:max-w-xl"
              )}
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو در سیستم"
                className="border-none bg-transparent text-sm shadow-none focus-visible:ring-0"
              />
            </div>
            <Badge
              variant="secondary"
              className="hidden sm:inline-flex min-w-fit py-2"
            >
              <span className="text-[11px]">وضعیت : پایدار</span>
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
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden items-center gap-2 rounded-full border px-2 py-1 sm:flex">
                  <Avatar name={userName ?? "کاربر"} className="h-8 w-8" />
                  <span className="text-sm font-semibold">{userName ?? "کاربر"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2 text-right">
                  <p className="text-xs text-muted-foreground">{userRole ?? "کاربر سیستم"}</p>
                  <p className="text-sm font-semibold text-foreground">{userName ?? "کاربر"}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                  <User className="h-4 w-4 text-muted-foreground" />
                  پروفایل
                </DropdownMenuItem>
                <DropdownMenuItem destructive onSelect={(event) => {
                  event.preventDefault();
                  handleLogout();
                }}>
                  <LogOut className="h-4 w-4" />
                  خروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {/* {pageTitle || breadcrumbs || actions ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              {breadcrumbs ? <div className="text-xs text-muted-foreground">{breadcrumbs}</div> : null}
              {pageTitle ? <div className="text-sm font-semibold text-foreground">{pageTitle}</div> : null}
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
          </div>
        ) : null} */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:hidden">
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <div className="flex items-center gap-2 rounded-full border px-3 py-1 sm:hidden">
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">
                  {userRole ?? "کاربر"}
                </p>
                <p className="text-xs font-semibold">{userName ?? "کاربر"}</p>
              </div>
              <Avatar name={userName ?? "کاربر"} />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
