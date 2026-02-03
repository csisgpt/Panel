"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sheetVariants = cva(
  "fixed z-50 flex flex-col bg-card shadow-2xl transition",
  {
    variants: {
      side: {
        right: "inset-y-0 right-0 h-full w-80 border-l",
        left: "inset-y-0 left-0 h-full w-80 border-r",
        top: "inset-x-0 top-0 h-1/2 border-b",
        bottom: "inset-x-0 bottom-0 h-1/2 border-t",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

interface SheetContextValue {
  stickyHeader?: boolean;
  stickyFooter?: boolean;
}

const SheetContext = React.createContext<SheetContextValue>({});

export interface SheetProps extends DialogPrimitive.DialogProps {
  children: React.ReactNode;
}

export const Sheet = ({ children, ...props }: SheetProps) => {
  const childrenArray = React.Children.toArray(children);
  const hasContent = childrenArray.some((child) =>
    React.isValidElement(child) && child.type === SheetContent
  );
  const triggers = childrenArray.filter(
    (child) => React.isValidElement(child) && child.type === SheetTrigger
  );
  const contentChildren = hasContent
    ? childrenArray
    : [
        ...triggers,
        <SheetContent key="sheet-content">{childrenArray.filter((child) => !triggers.includes(child))}</SheetContent>,
      ];

  return <DialogPrimitive.Root {...props}>{contentChildren}</DialogPrimitive.Root>;
};

export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/40 backdrop-blur-sm", className)}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  stickyHeader?: boolean;
  stickyFooter?: boolean;
}

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, stickyHeader, stickyFooter, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      <SheetContext.Provider value={{ stickyHeader, stickyFooter }}>
        {children}
      </SheetContext.Provider>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { stickyHeader } = React.useContext(SheetContext);
  return (
    <div
      className={cn(
        "p-4",
        stickyHeader && "sticky top-0 z-10 border-b bg-card/95 backdrop-blur",
        className
      )}
      {...props}
    />
  );
}

export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { stickyFooter } = React.useContext(SheetContext);
  return (
    <div
      className={cn(
        "border-t p-4",
        stickyFooter && "sticky bottom-0 z-10 border-t bg-card/95 backdrop-blur",
        className
      )}
      {...props}
    />
  );
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <DialogPrimitive.Title className={cn("text-base font-semibold", className)} {...props} />;
}

export function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <DialogPrimitive.Description className={cn("text-sm text-muted-foreground", className)} {...props} />;
}
