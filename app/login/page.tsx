"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { UserRole } from "@/lib/types/backend";

interface LoginFormValues {
  mobile: string;
  password: string;
  role: UserRole;
}

export default function LoginPage() {
  const { loginWithCredentials, loginAsRole } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState,
    setValue,
    watch,
  } = useForm<LoginFormValues>({
    defaultValues: { mobile: "09121111111", password: "mock", role: UserRole.TRADER },
  });
  const selectedRole = watch("role");

  const handleValidSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await loginWithCredentials(values.mobile, values.password, values.role);
      router.replace(values.role === UserRole.ADMIN ? "/admin/dashboard" : "/trader/dashboard");
    } catch (err) {
      toast({
        title: "خطا در ورود",
        description: "نام کاربری، رمز یا نقش را بررسی کنید.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setLoading(true);
    try {
      await loginAsRole(role);
      router.replace(role === UserRole.ADMIN ? "/admin/dashboard" : "/trader/dashboard");
    } catch (err) {
      toast({
        title: "ورود سریع ناموفق",
        description: "لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <Card className="w-full max-w-md border-none bg-white/80 shadow-2xl backdrop-blur">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold">ورود به پنل</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              لطفاً اطلاعات خود را وارد کنید. داده‌ها صرفاً نمایشی هستند.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(handleValidSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="mobile">موبایل</Label>
                <Input id="mobile" {...register("mobile", { required: true })} placeholder="0912xxxxxxx" />
                {formState.errors.mobile && <p className="text-xs text-destructive">این فیلد اجباری است.</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور</Label>
                <Input id="password" type="password" {...register("password", { required: true })} placeholder="رمز عبور" />
                {formState.errors.password && <p className="text-xs text-destructive">این فیلد اجباری است.</p>}
              </div>
              <div className="space-y-2">
                <Label>نقش</Label>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {[UserRole.ADMIN, UserRole.TRADER, UserRole.CLIENT].map((role) => (
                    <Button
                      key={role}
                      type="button"
                      variant={selectedRole === role ? "default" : "outline"}
                      className={selectedRole === role ? undefined : "bg-background"}
                      onClick={() => setValue("role", role as UserRole, { shouldValidate: true })}
                    >
                      {role === UserRole.ADMIN ? "ادمین" : role === UserRole.TRADER ? "معامله‌گر" : "مشتری"}
                    </Button>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "در حال ورود..." : "ورود"}
              </Button>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <button type="button" onClick={() => handleQuickLogin(UserRole.ADMIN)} className="underline">
                  ورود سریع ادمین
                </button>
                <button type="button" onClick={() => handleQuickLogin(UserRole.TRADER)} className="underline">
                  ورود سریع معامله‌گر
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
