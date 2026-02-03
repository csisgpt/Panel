"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon?: React.ElementType;
}

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
  title?: string;
  subtitle?: string;
  navItems: NavItem[];
}

export function Sidebar({ className, onNavigate, title, subtitle, navItems }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn("flex h-full w-72 flex-col border-l bg-card/95 px-5 py-6 shadow-xl", className)}>
      <div className="mb-6 flex items-center justify-between border-b pb-4">
        <div>
          <p className="text-xs text-muted-foreground">{subtitle ?? "پنل مدیریت"}</p>
          <p className="text-lg font-semibold text-foreground">{title ?? "Gold Panel"}</p>
        </div>
      </div>
      <nav className="space-y-1 overflow-y-auto pb-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {Icon ? <Icon className="h-5 w-5 shrink-0 text-muted-foreground" /> : null}
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
