import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Vazirmatn } from "next/font/google";




const vazirmatn = Vazirmatn({
  subsets: ["arabic"],         // برای فارسی مهمه
  weight: ["100","200","300","400","500","600","700","800","900"],
  display: "swap",
});
export const metadata: Metadata = {
  title: "پنل مدیریت مالی",
  description: "داشبورد مالی مدرن"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body  className={vazirmatn.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
