import type { Meta, StoryObj } from "@storybook/react";
import { LayoutDashboard, Users, Settings, FileText, BarChart2, Bell, Inbox } from "lucide-react";
import { Sidebar } from "./Sidebar";

const meta: Meta<typeof Sidebar> = {
  title: "Layout/Sidebar",
  component: Sidebar,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div className="h-screen flex"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const groups = [
  {
    id: "main",
    label: "Main",
    items: [
      { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, active: true },
      { id: "inbox", label: "Inbox", icon: <Inbox className="h-4 w-4" />, badge: 3 },
      { id: "reports", label: "Reports", icon: <BarChart2 className="h-4 w-4" /> },
      { id: "docs", label: "Documents", icon: <FileText className="h-4 w-4" /> },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    items: [
      { id: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
      { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
      { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
    ],
  },
];

export const Default: Story = { args: { groups } };
export const Collapsed: Story = { args: { groups, collapsed: true } };
export const RTL: Story = { args: { groups, dir: "rtl" } };
