"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { traderBottomNav } from "@/lib/navigation/registry";
import { useAuth } from "@/lib/auth-context";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const tabs = traderBottomNav.tabs;
  const moreItems = traderBottomNav.moreItems.filter((item) => item.featureFlag !== false);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 px-2 pb-safe pt-2 shadow-lg md:hidden">
      <div className="flex items-center justify-between">
        {tabs.map((tab) => {
          const active = tab.href !== "#more" && (pathname === tab.href || pathname.startsWith(`${tab.href}/`));
          if (tab.key === "more") {
            return (
              <button
                key={tab.key}
                onClick={() => setOpen(true)}
                className="flex flex-1 flex-col items-center gap-1 text-xs text-muted-foreground"
              >
                <tab.icon className="h-5 w-5" />
                {tab.labelFa}
              </button>
            );
          }
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 text-xs",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <tab.icon className="h-5 w-5" />
              {tab.labelFa}
            </Link>
          );
        })}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="w-full rounded-t-2xl bg-background p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold">بیشتر</p>
              <button className="text-xs text-muted-foreground" onClick={() => setOpen(false)}>
                بستن
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {moreItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    if (item.key === "logout") {
                      handleLogout();
                    } else {
                      router.push(item.href);
                    }
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.labelFa}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
