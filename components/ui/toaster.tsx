"use client";

import { AnimatePresence, motion } from "framer-motion";

import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastTitle } from "./toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed left-4 top-4 z-50 flex max-h-screen flex-col gap-3 overflow-hidden">
      <AnimatePresence initial={false}>
        {toasts.map(({ id, title, description, action, ...props }) => (
          <motion.div
            key={id}
            layout
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <Toast {...props}>
              <div className="flex flex-1 items-start gap-3">
                <div className="flex flex-col gap-1">
                  {title && <ToastTitle>{title}</ToastTitle>}
                  {description && <ToastDescription>{description}</ToastDescription>}
                </div>
                {action}
                <ToastClose onClick={() => dismiss(id)} />
              </div>
            </Toast>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
