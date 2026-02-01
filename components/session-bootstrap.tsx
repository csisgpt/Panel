"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { isAdmin, isUserPanel } from "@/lib/auth/roles";

const AUTH_PATHS = ["/login", "/register"];

function buildLoginUrl(pathname: string) {
  const encoded = encodeURIComponent(pathname);
  return `/login?returnTo=${encoded}`;
}

export default function SessionBootstrap() {
  const { bootstrap, hydrated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const hasBootstrapped = useRef(false);
  const hadToken = useRef(false);

  useEffect(() => {
    if (!hydrated || hasBootstrapped.current) return;
    hasBootstrapped.current = true;
    if (typeof window !== "undefined") {
      hadToken.current = Boolean(localStorage.getItem("panel_token_v2"));
    }
    bootstrap()
      .then((profile) => {
        if (!profile) {
          if (hadToken.current) {
            toast({
              title: "نشست شما منقضی شد",
              description: "لطفاً دوباره وارد شوید.",
              variant: "destructive",
            });
          }
          if (!AUTH_PATHS.includes(pathname)) {
            router.replace(buildLoginUrl(pathname));
          }
          return;
        }
        if (pathname.startsWith("/admin") && !isAdmin(profile)) {
          router.replace(isUserPanel(profile) ? "/trader" : buildLoginUrl(pathname));
        }
        if (pathname.startsWith("/trader") && !isUserPanel(profile)) {
          router.replace(isAdmin(profile) ? "/admin" : buildLoginUrl(pathname));
        }
      })
      .catch((err) => {
        if (err instanceof Error && err.message.toLowerCase().includes("unauthorized")) {
          router.replace(buildLoginUrl(pathname));
        }
      });
  }, [bootstrap, hydrated, pathname, router, toast]);

  useEffect(() => {
    if (!user || AUTH_PATHS.includes(pathname)) return;
  }, [user, pathname]);

  return null;
}
