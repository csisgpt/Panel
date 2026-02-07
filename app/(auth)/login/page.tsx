"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { isApiError } from "@/lib/contracts/errors";
import { resolvePostLoginRedirect } from "@/lib/auth/redirects";

const mobileRegex = /^09\d{9}$/;

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-sm text-muted-foreground">در حال آماده\u000cسازی...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const { loginWithCredentials, hydrated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [values, setValues] = useState({
    mobile: "",
    password: "",
  });

  const returnTo = useMemo(() => searchParams.get("returnTo") ?? "", [searchParams]);

  useEffect(() => {
    const prefillMobile = searchParams.get("mobile");
    if (prefillMobile) {
      setValues((prev) => ({ ...prev, mobile: prefillMobile }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("registered") === "1") {
      toast({
        title: "ثبت‌نام انجام شد",
        description: "لطفاً وارد شوید.",
      });
    }
  }, [searchParams, toast]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const user = await loginWithCredentials(values.mobile, values.password);
      const target = resolvePostLoginRedirect({ userRole: user.role, returnTo });
      router.replace(target);
    } catch (err) {
      const status = getErrorStatus(err);
      if (status === 401) {
        toast({
          title: "ورود ناموفق",
          description: "شماره موبایل یا رمز عبور اشتباه است.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "خطا در ورود",
          description: "ارتباط با سرور برقرار نشد. دوباره تلاش کنید.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-none bg-white/80 shadow-2xl backdrop-blur">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">ورود به پنل کاربری</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            برای دسترسی به امکانات، وارد حساب خود شوید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="mobile">شماره موبایل</Label>
              <Input
                id="mobile"
                value={values.mobile}
                onChange={(event) => setValues((prev) => ({ ...prev, mobile: event.target.value }))}
                placeholder="0912xxxxxxx"
                inputMode="numeric"
                autoComplete="tel"
              />
              {!mobileRegex.test(values.mobile) && values.mobile.length > 0 ? (
                <p className="text-xs text-destructive">شماره موبایل معتبر نیست.</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={values.password}
                  onChange={(event) => setValues((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="رمز عبور"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showPassword ? "مخفی کردن رمز" : "نمایش رمز"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {values.password.length === 0 ? (
                <p className="text-xs text-muted-foreground">رمز عبور خود را وارد کنید.</p>
              ) : null}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !mobileRegex.test(values.mobile) || values.password.length < 6}
            >
              {loading ? "در حال ورود..." : "ورود"}
            </Button>
            <div className="text-center text-xs text-muted-foreground">
              حساب ندارید؟
              <button
                type="button"
                className="mr-1 text-primary underline"
                onClick={() => router.push("/register")}
              >
                ثبت‌نام کنید
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function getErrorStatus(error: unknown) {
  if (isApiError(error)) return error.status;
  if (typeof error === "object" && error && "status" in error) {
    const value = (error as { status?: number }).status;
    if (typeof value === "number") return value;
  }
  return null;
}
