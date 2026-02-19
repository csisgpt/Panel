"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon?: React.ElementType;
  badge?: string;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;

  brand: string;
  subtitle?: string;

  navItems: NavItem[];
  sections?: NavSection[];

  collapsed?: boolean;
  onToggleCollapse?: () => void;

  mobile?: boolean;
}

export function Sidebar({
  className,
  onNavigate,
  brand,
  subtitle,
  navItems,
  sections,
  collapsed = false,
  onToggleCollapse,
  mobile = false,
}: SidebarProps) {
  const pathname = usePathname();
  const groups = sections?.length ? sections : [{ id: "main", label: "اصلی", items: navItems }];

  return (
    <aside
      data-collapsed={collapsed ? "true" : "false"}
      className={cn(
        "flex h-full w-full flex-col border-l bg-card/95",
        "transition-[padding] duration-500 ease-out",
        "will-change-[padding]",
        className
      )}
    >
      {/* Header */}
      <div className={cn("px-3 py-4", collapsed ? "px-2" : "px-3")}>
        <div className={cn("flex items-center  gap-24", collapsed ? "justify-center" : "justify-between")}>
          {/* Brand row */}
          {
            !collapsed && <div className={cn("flex min-w-0 items-center gap-2", collapsed && "justify-center grow")}>
              <div
                className={cn(
                  "min-w-0 overflow-hidden transition-[max-width,opacity,transform] duration-500 ease-out",
                  "will-change-[max-width,opacity,transform]",
                  collapsed ? "max-w-0 opacity-0 translate-x-2" : "max-w-[220px] opacity-100 translate-x-0"
                )}
                aria-hidden={collapsed}
              >
                <p className="truncate text-xs text-muted-foreground">{subtitle ?? "پنل مدیریت"}</p>
                <p className="truncate text-sm font-semibold">{brand}</p>
              </div>
            </div>
          }


          {/* Collapse button (desktop) */}
          {!mobile ? (
            <Button
              type="button"
              variant={collapsed ? "default" : "outline"}
              size="icon"
              className={cn(
                "hidden lg:inline-flex min-h-fit h-9 w-9 rounded-xl",
                "transition-colors duration-500"
              )}
              onClick={onToggleCollapse}
              aria-label="Toggle sidebar"
              aria-expanded={!collapsed}
            >
              {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          ) : null}
        </div>

        <div className="mt-4">
          <Separator />
        </div>
      </div>

      {/* Nav */}
      <nav className={cn("flex-1 overflow-y-auto pb-6", collapsed ? "px-2" : "px-3")}>
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.id} className="space-y-2">
              {/* Group label: keep DOM, animate */}
              <div className="px-2">
                <p
                  className={cn(
                    "text-[11px] font-semibold text-muted-foreground",
                    "transition-[opacity,transform,max-height] duration-500 ease-out",
                    collapsed ? "max-h-0 opacity-0 -translate-y-1 overflow-hidden" : "max-h-10 opacity-100 translate-y-0"
                  )}
                  aria-hidden={collapsed}
                >
                  {group.label}
                </p>

                {/* When collapsed show divider (stable height) */}
                <div className={cn("transition-opacity duration-500", collapsed ? "opacity-100" : "opacity-0")}>
                  <div className="h-px w-full bg-border/70" />
                </div>
              </div>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link key={item.href} href={item.href} onClick={onNavigate} className="block">
                      <div
                        className={cn(
                          "relative", // مهم: برای indicator absolute
                          "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors duration-500",
                          "hover:bg-muted/60",
                          collapsed ? "justify-center px-2" : "",
                          active
                            ? "bg-primary/10 text-primary ring-1 ring-primary/10"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                            "transition-colors duration-300",
                            active ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
                          )}
                        >
                          {Icon && <Icon className="h-5 w-5" />}
                        </div>

                        {/* Label + badge: keep DOM, animate */}
                        {
                          !collapsed && <div
                            className={cn(
                              "min-w-0 flex flex-1 items-center gap-2 overflow-hidden",
                              "transition-[max-width,opacity,transform] duration-500 ease-out will-change-[max-width,opacity,transform]",
                              collapsed ? "max-w-0 opacity-0 translate-x-2" : "max-w-[220px] opacity-100 translate-x-0"
                            )}
                            aria-hidden={collapsed}
                          >
                            <span className={cn(
                              "min-w-0 flex-1 truncate font-medium",
                              active ? "text-primary font-bold text-lg" : ""
                            )}>{item.label}</span>

                            {item.badge && (
                              <span
                                className={cn(
                                  "shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold",
                                  active ? "bg-primary/15 text-primary" : "bg-muted text-foreground"
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        }

                        {/* Active indicator */}
                        {active && (
                          <span className="absolute right-0 hidden h-8 w-1 rounded-l-full bg-primary lg:block" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}
