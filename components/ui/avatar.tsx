import * as React from "react";

import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  src?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(({ name, src, className, ...props }, ref) => {
  const initials = name?.trim()?.slice(0, 2) || "";

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-l from-indigo-500 to-purple-500 text-sm font-semibold text-white shadow-soft",
        className
      )}
      {...props}
    >
      {src ? <img src={src} alt={name ?? "avatar"} className="h-full w-full object-cover" /> : initials}
    </div>
  );
});
Avatar.displayName = "Avatar";

export { Avatar };
