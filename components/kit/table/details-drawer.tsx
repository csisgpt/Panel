"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export interface DetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

export function DetailsDrawer({ open, onOpenChange, title, children, actions }: DetailsDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" size="lg" className="flex w-full flex-col max-w-[40%]" stickyHeader stickyFooter>
        <SheetHeader className="space-y-2">
          {title ? <SheetTitle>{title}</SheetTitle> : null}
        </SheetHeader>
        <div className="flex-1 overflow-auto p-4">{children}</div>
        <SheetFooter>
          {actions ? actions : <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>بستن</Button>}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
