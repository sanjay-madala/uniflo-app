import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const toastVariants = cva(
  "group relative flex w-full items-start gap-3 overflow-hidden rounded-lg border p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full",
  {
    variants: {
      variant: {
        success: "border-[var(--accent-green)]/30 bg-[var(--bg-secondary)]",
        error: "border-[var(--accent-red)]/30 bg-[var(--bg-secondary)]",
        warning: "border-yellow-500/30 bg-[var(--bg-secondary)]",
        info: "border-[var(--accent-blue)]/30 bg-[var(--bg-secondary)]",
      },
    },
    defaultVariants: { variant: "info" },
  }
);

const ICONS = {
  success: <CheckCircle2 className="h-4 w-4 text-[var(--accent-green)] shrink-0 mt-0.5" />,
  error: <XCircle className="h-4 w-4 text-[var(--accent-red)] shrink-0 mt-0.5" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />,
  info: <Info className="h-4 w-4 text-[var(--accent-blue)] shrink-0 mt-0.5" />,
};

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: "success" | "error" | "warning" | "info";
  duration?: number;
}

export interface ToastProps {
  title: string;
  description?: string;
  variant?: "success" | "error" | "warning" | "info";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Toast({ title, description, variant = "info", open, onOpenChange }: ToastProps) {
  const safeVariant = variant || "info";
  return (
    <ToastPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      className={cn(toastVariants({ variant: safeVariant }), "max-w-sm")}
    >
      {ICONS[safeVariant as keyof typeof ICONS]}
      <div className="flex-1 gap-1">
        <ToastPrimitive.Title className="text-sm font-medium text-[var(--text-primary)]">{title}</ToastPrimitive.Title>
        {description && (
          <ToastPrimitive.Description className="text-sm text-[var(--text-secondary)]">{description}</ToastPrimitive.Description>
        )}
      </div>
      <ToastPrimitive.Close className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors" aria-label="Dismiss">
        <X className="h-4 w-4" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {children}
      <ToastPrimitive.Viewport className="fixed top-4 end-4 z-[100] flex flex-col gap-2 w-full max-w-sm" />
    </ToastPrimitive.Provider>
  );
}

// Simple hook for imperative toasts
export type ToastVariant = "success" | "error" | "warning" | "info";

export interface UseToastReturn {
  toasts: ToastItem[];
  toast: (item: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((item: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...item, id }]);
    const duration = item.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
    }
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, toast, dismiss };
}

export function Toaster({ toasts, dismiss }: { toasts: ToastItem[]; dismiss: (id: string) => void }) {
  return (
    <>
      {toasts.map((t) => (
        <Toast key={t.id} {...t} open onOpenChange={(open) => !open && dismiss(t.id)} />
      ))}
    </>
  );
}
