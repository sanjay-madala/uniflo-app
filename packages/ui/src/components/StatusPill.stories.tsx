import type { Meta, StoryObj } from "@storybook/react";
import { StatusPill } from "./StatusPill";

const meta: Meta<typeof StatusPill> = {
  title: "Display/StatusPill",
  component: StatusPill,
};
export default meta;
type Story = StoryObj<typeof StatusPill>;

export const Open: Story = { args: { status: "open" } };
export const Closed: Story = { args: { status: "closed" } };
export const Pending: Story = { args: { status: "pending" } };
export const Critical: Story = { args: { status: "critical" } };
export const Info: Story = { args: { status: "info" } };
export const AllStatuses = () => (
  <div className="flex flex-wrap gap-2 p-4">
    <StatusPill status="open" />
    <StatusPill status="closed" />
    <StatusPill status="pending" />
    <StatusPill status="critical" />
    <StatusPill status="info" />
  </div>
);
