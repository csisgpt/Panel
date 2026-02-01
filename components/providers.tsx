'use client';

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/toaster";
import { AuthProvider } from "@/lib/auth-context";
import SessionBootstrap from "@/components/session-bootstrap";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthProvider>
        <SessionBootstrap />
        {children}
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
