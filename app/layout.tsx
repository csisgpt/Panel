import type { Metadata } from "next";
import "./globals.css";
import { Vazirmatn } from "next/font/google";
import { Providers } from "@/components/providers";

const vazir = Vazirmatn({ subsets: ["arabic"], variable: "--font-vazirmatn" });

export const metadata: Metadata = {
  title: "پنل مدیریت مالی",
  description: "داشبورد مالی مدرن"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${vazir.variable} font-sans`}> 
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
