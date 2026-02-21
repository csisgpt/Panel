"use client";

import { toast } from "@/hooks/use-toast";
import type { WithdrawalDestination } from "@/lib/contracts/p2p";

function fallbackCopy(value: string) {
  if (typeof document === "undefined") return false;
  const el = document.createElement("textarea");
  el.value = value;
  el.setAttribute("readonly", "");
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(el);
  return ok;
}

export async function copyText(text: string) {
  if (!text) return false;
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      toast({ title: "کپی شد" } as any);
      return true;
    }
    const ok = fallbackCopy(text);
    toast({ title: ok ? "کپی شد" : "امکان کپی در این مرورگر/محیط موجود نیست", variant: ok ? "default" : "destructive" } as any);
    return ok;
  } catch {
    toast({ title: "امکان کپی در این مرورگر/محیط موجود نیست", variant: "destructive" } as any);
    return false;
  }
}

export function destinationValue(destination?: Partial<WithdrawalDestination> | null) {
  return destination?.fullValue ?? destination?.masked ?? "";
}

export function destinationAllText(destination?: Partial<WithdrawalDestination> | null) {
  if (!destination) return "";
  const value = destinationValue(destination);
  return [destination.title, destination.bankName, destination.ownerName, value].filter(Boolean).join("\n");
}

export async function copyDestinationAll(destination?: Partial<WithdrawalDestination> | null, fallbackText?: string | null) {
  return copyText(fallbackText || destinationAllText(destination));
}

export async function copyDestinationValue(destination?: Partial<WithdrawalDestination> | null) {
  return copyText(destinationValue(destination));
}
