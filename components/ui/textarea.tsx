"use client";

import * as React from "react";
import * as Primitive from "@radix-ui/react-primitive";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "flex min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background transition placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "min-h-[96px]",
        md: "min-h-[120px]",
        lg: "min-h-[160px]",
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

export interface TextareaProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.textarea>,
    VariantProps<typeof textareaVariants> {
  error?: boolean | string;
}

const Textarea = React.forwardRef<
  React.ElementRef<typeof Primitive.textarea>,
  TextareaProps
>(({ className, size, error, ...props }, ref) => (
  <Primitive.textarea
    ref={ref}
    className={cn(textareaVariants({ size, error: Boolean(error), className }))}
    aria-invalid={Boolean(error)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
