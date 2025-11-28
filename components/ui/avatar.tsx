import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  src?: string;
}

export function Avatar({ name, src, className, ...props }: AvatarProps) {
  const initials = name?.slice(0, 2) ?? "";
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-l from-indigo-500 to-purple-500 text-sm font-semibold text-white shadow-soft",
        className
      )}
      {...props}
    >
      {src ? <img src={src} alt={name} className="h-full w-full rounded-full object-cover" /> : initials}
    </div>
  );
}
