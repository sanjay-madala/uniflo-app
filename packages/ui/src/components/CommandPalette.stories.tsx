import * as React from "react";
import type { Meta } from "@storybook/react";
import { LayoutDashboard, Users, Settings, FileText, BarChart2 } from "lucide-react";
import { CommandPalette, useCommandPalette } from "./CommandPalette";
import { Button } from "./Button";

const meta: Meta = { title: "Navigation/CommandPalette" };
export default meta;

const items = [
  { id: "1", label: "Go to Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, group: "Navigation", onSelect: () => console.log("dashboard") },
  { id: "2", label: "Manage Users", icon: <Users className="h-4 w-4" />, group: "Navigation", onSelect: () => {} },
  { id: "3", label: "View Reports", icon: <BarChart2 className="h-4 w-4" />, group: "Navigation", onSelect: () => {} },
  { id: "4", label: "Create Document", description: "Start a new document", icon: <FileText className="h-4 w-4" />, group: "Actions", onSelect: () => {} },
  { id: "5", label: "Open Settings", icon: <Settings className="h-4 w-4" />, group: "Actions", onSelect: () => {} },
];

export const Default = () => {
  const { open, setOpen } = useCommandPalette();
  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open palette <kbd className="ms-2 text-xs opacity-60">⌘K</kbd></Button>
      <CommandPalette open={open} onOpenChange={setOpen} items={items} />
    </div>
  );
};
