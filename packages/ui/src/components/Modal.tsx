import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const modalContentVariants = cva(
  "fixed start-[50%] top-[50%] z-50 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
  {
    variants: {
      size: {
        sm: "w-full max-w-sm",
        md: "w-full max-w-lg",
        lg: "w-full max-w-2xl",
      },
    },
    defaultVariants: { size: "md" },
  }
);

export interface ModalProps extends VariantProps<typeof modalContentVariants> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  showClose?: boolean;
  dir?: "ltr" | "rtl";
}

export function Modal({ open, onOpenChange, title, description, children, footer, size, showClose = true, dir }: ModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          dir={dir}
          className={cn(modalContentVariants({ size }))}
        >
          {/* Header */}
          {(title || showClose) && (
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-default)] px-6 py-4">
              <div>
                {title && (
                  <DialogPrimitive.Title className="text-base font-semibold text-[var(--text-primary)]">
                    {title}
                  </DialogPrimitive.Title>
                )}
                {description && (
                  <DialogPrimitive.Description className="mt-1 text-sm text-[var(--text-secondary)]">
                    {description}
                  </DialogPrimitive.Description>
                )}
              </div>
              {showClose && (
                <DialogPrimitive.Close className="rounded-md p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors" aria-label="Close modal">
                  <X className="h-4 w-4" />
                </DialogPrimitive.Close>
              )}
            </div>
          )}

          {/* Body */}
          {children && (
            <div className="px-6 py-4">
              {children}
            </div>
          )}

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-[var(--border-default)] px-6 py-4">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export { DialogPrimitive as ModalPrimitive };
