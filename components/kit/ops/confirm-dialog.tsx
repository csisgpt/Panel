"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function ConfirmDialog({
  triggerLabel,
  title,
  description,
  confirmLabel = "تایید",
  phrase,
  onConfirm,
}: {
  triggerLabel: string;
  title: string;
  description?: string;
  confirmLabel?: string;
  phrase?: string;
  onConfirm: () => void;
}) {
  const [value, setValue] = useState("");
  const disabled = phrase ? value.trim() !== phrase : false;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {phrase ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">برای تایید عبارت زیر را وارد کنید:</p>
            <p className="rounded-md bg-muted px-3 py-2 text-sm font-medium">{phrase}</p>
            <Input value={value} onChange={(event) => setValue(event.target.value)} />
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="destructive" onClick={onConfirm} disabled={disabled}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
