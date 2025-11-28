'use client';

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

interface LoginFormValues {
  username: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState } = useForm<LoginFormValues>({
    defaultValues: { username: "", password: "" }
  });

  const handleValidSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      router.replace("/dashboard");
    } catch (err) {
      toast({
        title: "خطا در ورود",
        description: "نام کاربری یا رمز عبور را بررسی کنید.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvalid = () => {
    toast({
      title: "ورود نامعتبر",
      description: "نام کاربری و رمز عبور الزامی است.",
      variant: "destructive"
    });
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
            <form className="space-y-4" onSubmit={handleSubmit(handleValidSubmit, handleInvalid)}>
              <div className="space-y-2">
                <Label htmlFor="username">نام کاربری</Label>
                <Input id="username" {...register("username", { required: true })} placeholder="نام کاربری" />
                {formState.errors.username && <p className="text-xs text-destructive">این فیلد اجباری است.</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور</Label>
                <Input id="password" type="password" {...register("password", { required: true })} placeholder="رمز عبور" />
                {formState.errors.password && <p className="text-xs text-destructive">این فیلد اجباری است.</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "در حال ورود..." : "ورود"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
