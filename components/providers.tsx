'use client';

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/toaster";
import { AuthProvider } from "@/lib/auth-context";
import { QueryProvider } from "@/lib/query/query-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <QueryProvider>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
