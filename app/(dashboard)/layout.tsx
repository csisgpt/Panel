'use client';

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui/sheet";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-muted/30" dir="rtl">
      <div className="fixed inset-y-0 right-0 hidden w-72 border-l bg-card/90 backdrop-blur lg:flex">
        <Sidebar className="h-full" />
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <Sidebar className="h-full" onNavigate={() => setOpen(false)} />
      </Sheet>

      <div className="flex min-h-screen flex-1 flex-col lg:mr-72">
        <Topbar onMenuClick={() => setOpen(true)} userName={user?.name} />
        <main className="flex-1 pb-8">
          <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-4 md:px-6 lg:px-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
