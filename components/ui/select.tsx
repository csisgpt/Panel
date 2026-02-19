"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

interface SelectContextValue {
  clearable?: boolean;
  onClear?: () => void;
  loading?: boolean;
}

const SelectContext = React.createContext<SelectContextValue>({});

const triggerVariants = cva(
  "flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-xs ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-9",
        md: "h-10",
        lg: "h-11",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface SelectProps extends SelectPrimitive.SelectProps {
  clearable?: boolean;
  onClear?: () => void;
  loading?: boolean;
  className?: string;
}

export const Select = ({
  clearable,
  onClear,
  loading,
  disabled,
  onValueChange,
  className,
  children,
  ...props
}: SelectProps) => {
  const handleClear = React.useCallback(() => {
    if (onClear) return onClear();
    onValueChange?.("");
  }, [onClear, onValueChange]);

  return (
    <SelectContext.Provider value={{ clearable, onClear: handleClear, loading }}>
      <div className={cn("relative w-auto", className)}>
        <SelectPrimitive.Root disabled={disabled || loading} onValueChange={onValueChange} {...props}>
          {children}
        </SelectPrimitive.Root>
      </div>
    </SelectContext.Provider>
  );
};

Select.displayName = "Select";

export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  size?: "sm" | "md" | "lg";
}

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, size, children, ...props }, ref) => {
  const { clearable, onClear, loading } = React.useContext(SelectContext);

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(triggerVariants({ size }), className)}
      {...props}
    >
      <span className="flex flex-1 items-center gap-2 truncate">{children}</span>
      <span className="flex items-center gap-2">
        {loading ? (
          <Spinner size="sm" className="text-muted-foreground" />
        ) : null}
        {clearable ? (
          <button
            type="button"
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs text-muted-foreground hover:bg-muted"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onClear?.();
            }}
            aria-label="Clear selection"
          >
            ×
          </button>
        ) : null}
        <SelectPrimitive.Icon className="text-xs text-muted-foreground">▾</SelectPrimitive.Icon>
      </span>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Value ref={ref} className={cn("truncate text-right", className)} {...props} />
));
SelectValue.displayName = SelectPrimitive.Value.displayName;

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-dropdown max-h-64  min-w-[8rem] overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-md",
        position === "popper" && "translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-2 text-[10px]! outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText className="truncate">{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="absolute left-3 inline-flex items-center text-xs">✓</SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export const SelectGroup = SelectPrimitive.Group;
export const SelectLabel = SelectPrimitive.Label;

export const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1 text-muted-foreground", className)}
    {...props}
  >
    ▲
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

export const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1 text-muted-foreground", className)}
    {...props}
  >
    ▼
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
