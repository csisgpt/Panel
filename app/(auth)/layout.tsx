import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50" dir="rtl">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
        <header className="mb-8 text-center">
          <p className="text-sm text-muted-foreground">پنل کاربری</p>
          <h1 className="text-2xl font-bold text-foreground">ورود و ثبت‌نام</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            لطفاً برای ادامه، اطلاعات خود را وارد کنید.
          </p>
        </header>
        {children}
      </div>
    </div>
  );
}
