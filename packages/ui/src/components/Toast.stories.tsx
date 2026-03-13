import * as React from "react";
import type { Meta } from "@storybook/react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { Toast, ToastProvider, useToast, Toaster } from "./Toast";
import { Button } from "./Button";

const meta: Meta = { title: "Feedback/Toast" };
export default meta;

export const AllVariants = () => (
  <ToastPrimitive.Provider>
    <div className="flex flex-col gap-3 p-4 max-w-sm">
      <Toast title="Changes saved" description="Your project has been updated." variant="success" open />
      <Toast title="Something went wrong" description="Please try again later." variant="error" open />
      <Toast title="Action required" description="You have 3 pending approvals." variant="warning" open />
      <Toast title="New update available" description="Version 2.1.0 is ready." variant="info" open />
    </div>
    <ToastPrimitive.Viewport />
  </ToastPrimitive.Provider>
);

export const Interactive = () => {
  const { toasts, toast, dismiss } = useToast();
  return (
    <ToastProvider>
      <div className="p-4 flex gap-2 flex-wrap">
        <Button size="sm" onClick={() => toast({ title: "Saved!", variant: "success" })}>Success</Button>
        <Button size="sm" variant="destructive" onClick={() => toast({ title: "Error!", description: "Something failed.", variant: "error" })}>Error</Button>
        <Button size="sm" variant="ghost" onClick={() => toast({ title: "Heads up", variant: "warning" })}>Warning</Button>
        <Button size="sm" variant="secondary" onClick={() => toast({ title: "FYI", variant: "info" })}>Info</Button>
      </div>
      <Toaster toasts={toasts} dismiss={dismiss} />
    </ToastProvider>
  );
};
