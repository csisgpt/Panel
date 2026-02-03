"use client";

import * as React from "react";
import * as Primitive from "@radix-ui/react-primitive";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background transition placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-9",
        md: "h-10",
        lg: "h-11",
      },
      error: {
        true: "border-destructive focus-visible:ring-destructive",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      error: false,
    },
  }
);

export interface InputProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.input>,
    VariantProps<typeof inputVariants> {
  error?: boolean | string;
}

const Input = React.forwardRef<
  React.ElementRef<typeof Primitive.input>,
  InputProps
>(({ className, size, error, ...props }, ref) => (
  <Primitive.input
    ref={ref}
    className={cn(inputVariants({ size, error: Boolean(error), className }))}
    aria-invalid={Boolean(error)}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
