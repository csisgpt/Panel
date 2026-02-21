"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export type ActionItem = {
  key: string;
  label: string;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
  disabledReason?: string;
};

export function P2PActionsMenu({ actions }: { actions: ActionItem[] }) {
  if (!actions.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((item, index) => (
          <div key={item.key}>
            {index > 0 ? <DropdownMenuSeparator key={`${item.key}-sep`} /> : null}
            <DropdownMenuItem
              onClick={item.onClick}
              destructive={item.destructive}
              disabled={item.disabled}
              title={item.disabled ? item.disabledReason : undefined}
            >
              {item.disabled && item.disabledReason ? `${item.label} — ${item.disabledReason}` : item.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
