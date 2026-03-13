import * as React from "react";
import type { Meta } from "@storybook/react";
import { Modal } from "./Modal";
import { Button } from "./Button";

const meta: Meta = { title: "Feedback/Modal" };
export default meta;

export const Default = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Edit project"
        description="Make changes to your project settings."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Save changes</Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">Modal body content goes here.</p>
      </Modal>
    </div>
  );
};

export const Large = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open large modal</Button>
      <Modal open={open} onOpenChange={setOpen} title="Large modal" size="lg" footer={<Button onClick={() => setOpen(false)}>Close</Button>}>
        <p className="text-sm text-[var(--text-secondary)]">Large modal with more content space.</p>
      </Modal>
    </div>
  );
};

export const RTL = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>افتح النافذة</Button>
      <Modal open={open} onOpenChange={setOpen} title="تعديل المشروع" description="قم بإجراء تغييرات على إعدادات مشروعك." dir="rtl" footer={<Button onClick={() => setOpen(false)}>حفظ</Button>}>
        <p className="text-sm text-[var(--text-secondary)]">محتوى النافذة هنا.</p>
      </Modal>
    </div>
  );
};
