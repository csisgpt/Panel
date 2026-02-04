"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-xl border border-input bg-background text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-9 w-9",
        md: "h-10 w-10",
        lg: "h-11 w-11",
      },
      variant: {
        default: "",
        ghost: "border-transparent bg-transparent hover:bg-muted",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "ghost",
    },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size, variant, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(iconButtonVariants({ size, variant, className }))}
      {...props}
    />
  )
);
IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };
