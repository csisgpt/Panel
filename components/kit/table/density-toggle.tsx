"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export interface DensityToggleProps {
  value?: "comfortable" | "compact";
  onChange?: (value: "comfortable" | "compact") => void;
}

export function DensityToggle({ value = "comfortable", onChange }: DensityToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant={value === "comfortable" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange?.("comfortable")}
      >
        عادی
      </Button>
      <Button
        type="button"
        variant={value === "compact" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange?.("compact")}
      >
        فشرده
      </Button>
    </div>
  );
}
