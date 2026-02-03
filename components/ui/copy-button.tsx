"use client";

import * as React from "react";
import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { toast } from "@/hooks/use-toast";

export interface CopyButtonProps {
  value: string;
  label?: string;
  iconOnly?: boolean;
  size?: "sm" | "default" | "lg" | "icon";
  className?: string;
}

export function CopyButton({ value, label = "کپی", iconOnly, size = "sm", className }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast({ description: "کپی شد", variant: "success" });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ description: "کپی نشد", variant: "error" });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size={iconOnly ? "icon" : size}
            onClick={handleCopy}
            className={className}
            aria-label={label}
          >
            {iconOnly ? "⧉" : label}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copied ? "کپی شد" : "کپی"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
