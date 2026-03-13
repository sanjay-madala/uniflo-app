import type { Meta, StoryObj } from "@storybook/react";
import { TopNav } from "./TopNav";

const meta: Meta<typeof TopNav> = {
  title: "Layout/TopNav",
  component: TopNav,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof TopNav>;

const orgs = [
  { id: "1", name: "Acme Corp" },
  { id: "2", name: "Globex" },
];

export const Default: Story = {
  args: {
    orgs,
    currentOrg: orgs[0],
    user: { name: "Sanjay Madala", email: "sanjay@example.com" },
    notificationCount: 3,
  },
};
export const NoNotifications: Story = {
  args: {
    currentOrg: orgs[0],
    user: { name: "Jane Doe", email: "jane@example.com" },
    notificationCount: 0,
  },
};
