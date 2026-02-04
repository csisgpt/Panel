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

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
  title?: string;
  subtitle?: string;
  navItems: NavItem[];
  sections?: NavSection[];
}

export function Sidebar({ className, onNavigate, title, subtitle, navItems, sections }: SidebarProps) {
  const pathname = usePathname();
  const groups = sections?.length ? sections : [{ id: "main", label: "اصلی", items: navItems }];

  return (
    <aside className={cn("flex h-full w-full flex-col border-l bg-card/95 px-4 py-6", className)}>
      <div className="mb-6 flex items-center justify-between border-b pb-4">
        <div>
          <p className="text-xs text-muted-foreground">{subtitle ?? "پنل مدیریت"}</p>
          <p className="text-lg font-semibold text-foreground">{title ?? "Gold Panel"}</p>
        </div>
      </div>
      <nav className="space-y-6 overflow-y-auto pb-6">
        {groups.map((group) => (
          <div key={group.id} className="space-y-2">
            <p className="px-2 text-xs font-semibold text-muted-foreground">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link key={item.href} href={item.href} onClick={onNavigate}>
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                        active
                          ? "border-r-2 border-primary bg-primary/10 text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      )}
                    >
                      {Icon ? (
                        <Icon className={cn("h-5 w-5 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                      ) : null}
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
