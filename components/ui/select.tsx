"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  value?: string;
  setValue: (value: string) => void;
  selectedLabel?: string;
  setSelectedLabel: (label: string) => void;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext(component: string): SelectContextValue {
  const ctx = React.useContext(SelectContext);
  if (!ctx) {
    throw new Error(`<${component}> must be used within <Select>`);
  }
  return ctx;
}

export interface SelectProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

export const Select = ({
  value,
  defaultValue,
  onValueChange,
  disabled,
  className,
  children,
  ...rest
}: SelectProps) => {
  const [internalValue, setInternalValue] = React.useState<string | undefined>(
    defaultValue ?? value
  );
  const [open, setOpen] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleSetValue = (val: string) => {
    setInternalValue(val);
    if (onValueChange) onValueChange(val);
    setOpen(false);
  };

  const ctx: SelectContextValue = {
    open,
    setOpen,
    value: internalValue,
    setValue: handleSetValue,
    selectedLabel,
    setSelectedLabel,
    onValueChange,
    disabled,
  };

  return (
    <SelectContext.Provider value={ctx}>
      <div className={cn("relative w-auto", className)} {...rest}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

Select.displayName = "Select";

export interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen, disabled } = useSelectContext("SelectTrigger");
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        {...props}
      >
        {children}
        <span className="ms-2 text-xs text-muted-foreground">▾</span>
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

export interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string;
}

export const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ className, placeholder, ...props }, ref) => {
    const { selectedLabel } = useSelectContext("SelectValue");
    return (
      <span
        ref={ref}
        className={cn(
          "truncate text-right text-sm",
          !selectedLabel && "text-muted-foreground",
          className
        )}
        {...props}
      >
        {selectedLabel ?? placeholder}
      </span>
    );
  }
);
SelectValue.displayName = "SelectValue";

export interface SelectContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open } = useSelectContext("SelectContent");
    if (!open) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-xl border bg-popover p-1 text-popover-foreground shadow-md bg-[#F7F7F7]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectContent.displayName = "SelectContent";

export interface SelectItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const SelectItem = React.forwardRef<HTMLButtonElement, SelectItemProps>(
  ({ className, children, value, ...props }, ref) => {
    const { value: selectedValue, setValue, setSelectedLabel } = useSelectContext(
      "SelectItem"
    );

    const label =
      typeof children === "string"
        ? children
        : String(children);

    const isSelected = selectedValue === value;

    return (
      <button
        ref={ref}
        type="button"
        role="option"
        aria-selected={isSelected}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-right hover:bg-accent hover:text-accent-foreground",
          isSelected && "bg-accent text-accent-foreground",
          className
        )}
        onClick={() => {
          setSelectedLabel(label);
          setValue(value);
        }}
        {...props}
      >
        <span className="truncate">{children}</span>
      </button>
    );
  }
);
SelectItem.displayName = "SelectItem";
