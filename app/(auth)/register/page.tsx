"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { isApiError } from "@/lib/contracts/errors";
import { RegisterDto } from "@/lib/types/backend";

const mobileRegex = /^09\d{9}$/;
const passwordStrengthRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;

interface RegisterFormState {
  fullName: string;
  mobile: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

const initialState: RegisterFormState = {
  fullName: "",
  mobile: "",
  email: "",
  password: "",
  confirmPassword: "",
  termsAccepted: false,
};

export default function RegisterPage() {
  const { registerWithCredentials } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step] = useState(0);
  const [values, setValues] = useState<RegisterFormState>(initialState);

  const checks = useMemo(() => {
    return {
      mobile: mobileRegex.test(values.mobile),
      fullName: values.fullName.trim().length >= 3,
      passwordLength: values.password.length >= 6,
      passwordStrength: passwordStrengthRegex.test(values.password),
      passwordMatch: values.password.length > 0 && values.password === values.confirmPassword,
      termsAccepted: values.termsAccepted,
    };
  }, [values]);

  const isFormValid = Object.values(checks).every(Boolean);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload: RegisterDto = {
        fullName: values.fullName.trim(),
        mobile: values.mobile,
        password: values.password,
        email: values.email.trim() ? values.email.trim() : undefined,
      };
      await registerWithCredentials(payload);
      router.replace(`/login?registered=1&mobile=${encodeURIComponent(values.mobile)}`);
    } catch (err) {
      const status = getErrorStatus(err);
      if (status === 409) {
        toast({
          title: "ثبت‌نام ناموفق",
          description: "این شماره موبایل قبلاً ثبت شده است. وارد شوید.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "مشکل در ثبت‌نام",
          description: "خطایی رخ داد. لطفاً دوباره تلاش کنید.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="border-none bg-white/80 shadow-2xl backdrop-blur max-h-[calc(100vh-50px)] overflow-hidden flex flex-col">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">ساخت حساب کاربری</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            برای شروع، مشخصات خود را وارد کنید.
          </CardDescription>
        </CardHeader>
        <CardContent className="grow! overflow-auto max-h-full">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input type="hidden" value={step} readOnly />
            <div className="space-y-2">
              <Label htmlFor="fullName">نام و نام خانوادگی</Label>
              <Input
                id="fullName"
                value={values.fullName}
                onChange={(event) => setValues((prev) => ({ ...prev, fullName: event.target.value }))}
                placeholder="مثال: مریم محمدی"
                autoComplete="name"
              />
            </div>
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
            </div>
            {/* <div className="space-y-2">
              <Label htmlFor="email">ایمیل (اختیاری)</Label>
              <Input
                id="email"
                type="email"
                value={values.email}
                onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="name@example.com"
                autoComplete="email"
              />
            </div> */}
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={values.password}
                  onChange={(event) => setValues((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="رمز عبور"
                  autoComplete="new-password"
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تکرار رمز عبور</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={values.confirmPassword}
                  onChange={(event) => setValues((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  placeholder="تکرار رمز عبور"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showConfirm ? "مخفی کردن رمز" : "نمایش رمز"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
              <ul className="space-y-2">
                <ChecklistItem label="موبایل معتبر (۱۱ رقم با ۰۹)" active={checks.mobile} />
                <ChecklistItem label="نام و نام خانوادگی حداقل ۳ کاراکتر" active={checks.fullName} />
                <ChecklistItem label="رمز حداقل ۶ کاراکتر" active={checks.passwordLength} />
                <ChecklistItem label="ترکیب حداقل یک حرف و یک عدد" active={checks.passwordStrength} />
                <ChecklistItem label="تکرار رمز یکسان" active={checks.passwordMatch} />
                <ChecklistItem label="پذیرش قوانین" active={checks.termsAccepted} />
              </ul>
            </div>
            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={values.termsAccepted}
                onChange={(event) => setValues((prev) => ({ ...prev, termsAccepted: event.target.checked }))}
                className="mt-1 h-4 w-4 rounded border"
              />
              <span>با قوانین و شرایط استفاده موافقم.</span>
            </label>
            <Button type="submit" className="w-full" disabled={loading || !isFormValid}>
              {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
            </Button>
            <div className="text-center text-xs text-muted-foreground">
              حساب دارید؟
              <button
                type="button"
                className="mr-1 text-primary underline"
                onClick={() => router.push("/login")}
              >
                وارد شوید
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ChecklistItem({ label, active }: { label: string; active: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <CheckCircle2 className={`h-4 w-4 ${active ? "text-emerald-500" : "text-muted-foreground"}`} />
      <span className={active ? "text-emerald-600" : undefined}>{label}</span>
    </li>
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
