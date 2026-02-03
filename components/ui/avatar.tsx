"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  name?: string;
  src?: string;
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ name, src, className, children, ...props }, ref) => {
  const initials = name?.trim()?.slice(0, 2) || "";
  const hasChildren = React.Children.count(children) > 0;

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-l from-indigo-500 to-purple-500 text-sm font-semibold text-white shadow-soft",
        className
      )}
      {...props}
    >
      {hasChildren ? (
        children
      ) : (
        <>
          <AvatarPrimitive.Image src={src} alt={name ?? "avatar"} className="h-full w-full object-cover" />
          <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center">
            {initials}
          </AvatarPrimitive.Fallback>
        </>
      )}
    </AvatarPrimitive.Root>
  );
});
Avatar.displayName = "Avatar";

const AvatarImage = AvatarPrimitive.Image;
const AvatarFallback = AvatarPrimitive.Fallback;

export { Avatar, AvatarImage, AvatarFallback };
