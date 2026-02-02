"use client";

import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Stepper, type StepperStep } from "./stepper";

export function WizardSheet({
  open,
  onOpenChange,
  title,
  description,
  steps,
  activeIndex,
  completedKeys,
  onBack,
  onNext,
  onSubmit,
  nextLabel = "بعدی",
  backLabel = "بازگشت",
  submitLabel = "ثبت",
  isNextDisabled,
  isSubmitDisabled,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  steps: StepperStep[];
  activeIndex: number;
  completedKeys: string[];
  onBack?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  nextLabel?: string;
  backLabel?: string;
  submitLabel?: string;
  isNextDisabled?: boolean;
  isSubmitDisabled?: boolean;
  children: React.ReactNode;
}) {
  const isLastStep = activeIndex === steps.length - 1;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-6 overflow-y-auto sm:max-w-2xl">
        <SheetHeader className="space-y-2">
          <SheetTitle>{title}</SheetTitle>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </SheetHeader>

        <Stepper steps={steps} activeIndex={activeIndex} completedKeys={completedKeys} />

        <div className="space-y-4">{children}</div>

        <SheetFooter className="mt-auto flex flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="flex gap-2">
            {onBack ? (
              <Button variant="outline" onClick={onBack} disabled={activeIndex === 0}>
                {backLabel}
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2">
            {isLastStep ? (
              <Button onClick={onSubmit} disabled={isSubmitDisabled}>
                {submitLabel}
              </Button>
            ) : (
              <Button onClick={onNext} disabled={isNextDisabled}>
                {nextLabel}
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
