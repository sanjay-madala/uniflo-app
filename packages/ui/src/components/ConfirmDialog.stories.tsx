import * as React from "react";
import type { Meta } from "@storybook/react";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button } from "./Button";

const meta: Meta = { title: "Feedback/ConfirmDialog" };
export default meta;

export const Default = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="p-4">
      <Button variant="destructive" onClick={() => setOpen(true)}>Delete project</Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this project?"
        description="All data will be permanently removed. This action cannot be undone."
        onConfirm={() => { console.log("confirmed"); setOpen(false); }}
      />
    </div>
  );
};
