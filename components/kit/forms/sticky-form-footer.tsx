import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export function StickyFormFooter({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("sticky bottom-0 z-20 border-t bg-background/95 px-4 py-3 backdrop-blur", className)}>{children}</div>;
}
