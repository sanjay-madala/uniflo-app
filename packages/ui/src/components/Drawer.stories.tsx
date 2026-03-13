import * as React from "react";
import type { Meta } from "@storybook/react";
import { Drawer } from "./Drawer";
import { Button } from "./Button";

const meta: Meta = { title: "Feedback/Drawer", parameters: { layout: "fullscreen" } };
export default meta;

export const Default = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open drawer</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        title="Project details"
        description="View and edit project information."
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => setOpen(false)}>Save</Button></>}
      >
        <p className="text-sm text-[var(--text-secondary)]">Drawer content goes here.</p>
      </Drawer>
    </div>
  );
};
