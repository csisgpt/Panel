"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-transparent text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-l from-indigo-500 to-purple-500 text-white shadow-soft hover:brightness-110",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border-input bg-background text-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const assertSingleElementChild = (
  children: React.ReactNode
): React.ReactElement => {
  const childArray = React.Children.toArray(children);
  if (childArray.length !== 1 || !React.isValidElement(childArray[0])) {
    throw new Error(
      "Button: when asChild is true, it must receive exactly one React element child (e.g. <Link />)."
    );
  }
  return childArray[0];
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild,
      isLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const loadingStyles = isLoading ? "opacity-50 cursor-not-allowed" : "";

    if (asChild) {
      assertSingleElementChild(children);
      return (
        <Comp
          ref={ref}
          className={cn(
            buttonVariants({ variant, size, className }),
            loadingStyles
          )}
          aria-busy={isLoading || undefined}
          data-loading={isLoading ? "true" : undefined}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        ref={ref}
        className={cn(
          buttonVariants({ variant, size, className }),
          loadingStyles
        )}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        data-loading={isLoading ? "true" : undefined}
        {...props}
      >
        {isLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
