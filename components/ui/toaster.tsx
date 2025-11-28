'use client';

import { useToast } from "@/hooks/use-toast";
import { Toast, ToastDescription, ToastTitle } from "./toast";
import { AnimatePresence, motion } from "framer-motion";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed left-4 top-4 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map(({ id, title, description, ...props }) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Toast {...props}>
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </Toast>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
