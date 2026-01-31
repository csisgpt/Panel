"use client";

import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/format/clipboard";
import { toast } from "@/hooks/use-toast";

export function CopyButton({ value, label = "کپی" }: { value: string; label?: string }) {
  const handleCopy = async () => {
    const ok = await copyToClipboard(value);
    toast({
      title: ok ? "کپی شد" : "کپی ناموفق",
      description: ok ? value : "مرورگر از کپی پشتیبانی نمی‌کند",
      variant: ok ? "default" : "destructive",
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {label}
    </Button>
  );
}
