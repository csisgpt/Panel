"use client";

import { toast } from "@/hooks/use-toast";

export async function copyToClipboard(text: string, successMessage = "کپی شد") {
  if (!text) return false;
  try {
    if (typeof navigator === "undefined" || !navigator.clipboard) throw new Error("not_supported");
    await navigator.clipboard.writeText(text);
    toast({ title: successMessage, variant: "success" } as any);
    return true;
  } catch {
    toast({ title: "کپی انجام نشد", variant: "destructive" } as any);
    return false;
  }
}
