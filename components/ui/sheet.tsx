"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sheetWidthClasses = {
  sm: "w-full sm:max-w-[20rem]", // 320px
  md: "w-full sm:max-w-[420px]",
  lg: "w-full sm:max-w-[640px]",
  xl: "w-full sm:max-w-[820px]",
} as const;

const sheetHeightClasses = {
  sm: "h-[40dvh]",
  md: "h-[60dvh]",
  lg: "h-[75dvh]",
  xl: "h-[85dvh]",
} as const;

type SheetSize = keyof typeof sheetWidthClasses;

const sheetVariants = cva(
  cn(
    // layout
    "fixed z-sheet flex max-h-dvh flex-col overflow-hidden bg-card shadow-2xl outline-none will-change-transform",
    // focus
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    // animation (needs tailwindcss-animate for best results; otherwise harmless)
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=open]:duration-300 data-[state=closed]:duration-200"
  ),
  {
    variants: {
      side: {
        right: cn(
          "inset-y-0 right-0 border-l",
          "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
          "rounded-l-2xl sm:rounded-l-2xl"
        ),
        left: cn(
          "inset-y-0 left-0 border-r",
          "data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
          "rounded-r-2xl sm:rounded-r-2xl"
        ),
        top: cn(
          "inset-x-0 top-0 w-full border-b",
          "data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top",
          "rounded-b-2xl"
        ),
        bottom: cn(
          "inset-x-0 bottom-0 w-full border-t",
          "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
          "rounded-t-2xl"
        ),
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

const overlayClasses = cn(
  "fixed inset-0 z-sheet bg-black/40 backdrop-blur-sm",
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
  "data-[state=open]:duration-300 data-[state=closed]:duration-200"
);

interface SheetContextValue {
  stickyHeader?: boolean;
  stickyFooter?: boolean;
}
const SheetContext = React.createContext<SheetContextValue>({});

function flattenChildren(children: React.ReactNode): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (!child) return;
    if (React.isValidElement(child) && child.type === React.Fragment) {
      out.push(...flattenChildren(child.props.children));
    } else {
      out.push(child);
    }
  });
  return out;
}

export interface SheetProps extends DialogPrimitive.DialogProps {
  children: React.ReactNode;

  /**
   * فقط زمانی اعمال می‌شود که شما SheetContent را دستی نیاورده باشید
   * (یعنی حالت auto-wrap فعال باشد)
   */
  contentProps?: Omit<SheetContentProps, "children">;
}

export const Sheet = ({ children, contentProps, ...props }: SheetProps) => {
  const childrenArray = flattenChildren(children);

  const hasContent = childrenArray.some(
    (child) => React.isValidElement(child) && child.type === SheetContent
  );

  const triggers = childrenArray.filter(
    (child) => React.isValidElement(child) && child.type === SheetTrigger
  );

  const rest = childrenArray.filter((child) => !triggers.includes(child));

  const contentChildren = hasContent
    ? childrenArray
    : [
      ...triggers,
      <SheetContent key="sheet-content" {...contentProps}>
        {rest}
      </SheetContent>,
    ];

  return <DialogPrimitive.Root {...props}>{contentChildren}</DialogPrimitive.Root>;
};

export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} className={cn(overlayClasses, className)} {...props} />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
  VariantProps<typeof sheetVariants> {
  size?: SheetSize;

  /** فقط برای top/bottom */
  height?: SheetSize;

  stickyHeader?: boolean;
  stickyFooter?: boolean;

  /** دکمه بستن آماده */
  showCloseButton?: boolean;
  closeLabel?: string;
}

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(
  (
    {
      side = "right",
      size = "md",
      height = "md",
      className,
      children,
      stickyHeader,
      stickyFooter,
      showCloseButton = true,
      closeLabel = "بستن",
      ...props
    },
    ref
  ) => {
    const isVertical = side === "top" || side === "bottom";

    return (
      <DialogPrimitive.Portal>
        <SheetOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            sheetVariants({ side }),
            "p-4",
            !isVertical && sheetWidthClasses[size],
            isVertical && sheetHeightClasses[height],
            className
          )}
          {...props}
        >
          <SheetContext.Provider value={{ stickyHeader, stickyFooter }}>
            {showCloseButton && (
              <SheetClose asChild>
                <button
                  type="button"
                  aria-label={closeLabel}
                  className={cn(
                    "absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl",
                    "text-muted-foreground hover:text-foreground",
                    "hover:bg-muted/60 transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  )}
                >
                  <span aria-hidden className="text-xl leading-none">
                    ×
                  </span>
                </button>
              </SheetClose>
            )}

            {children}
          </SheetContext.Provider>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    );
  }
);
SheetContent.displayName = DialogPrimitive.Content.displayName;

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { stickyHeader } = React.useContext(SheetContext);
  return (
    <div
      className={cn(
        "shrink-0 p-4",
        stickyHeader && "sticky top-0 z-10 border-b bg-card/95 backdrop-blur",
        className
      )}
      {...props}
    />
  );
}

export function SheetBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex-1 overflow-y-auto p-4", className)}
      {...props}
    />
  );
}

export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { stickyFooter } = React.useContext(SheetContext);
  return (
    <div
      className={cn(
        "shrink-0 border-t p-4 pb-0 w-full flex justify-end items-center",
        stickyFooter && "sticky bottom-0 z-10 bg-card/95 backdrop-blur",
        className
      )}
      {...props}
    />
  );
}

export function SheetTitle({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("text-base font-semibold", className)} {...props} />;
}

export function SheetDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("text-sm text-muted-foreground", className)} {...props} />;
}
