"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepperStep {
  key: string;
  title: string;
  description?: string;
}

export function Stepper({
  steps,
  activeIndex,
  completedKeys,
  onStepClick,
}: {
  steps: StepperStep[];
  activeIndex: number;
  completedKeys: string[];
  onStepClick?: (key: string, index: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const isCompleted = completedKeys.includes(step.key);
          return (
            <button
              key={step.key}
              type="button"
              onClick={() => onStepClick?.(step.key, index)}
              className={cn(
                "flex min-w-[180px] items-center gap-3 rounded-lg border px-3 py-2 text-right transition",
                isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                onStepClick ? "cursor-pointer" : "cursor-default"
              )}
              disabled={!onStepClick}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold",
                  isCompleted ? "border-primary bg-primary text-primary-foreground" : "border-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span className="space-y-1">
                <span className="block text-sm font-medium text-foreground">{step.title}</span>
                {step.description ? (
                  <span className="block text-xs text-muted-foreground">{step.description}</span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
