import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = { title: "UI/Badge", component: Badge };
export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = { args: { children: "Default" } };
export const Success: Story = { args: { variant: "success", children: "Active" } };
export const Destructive: Story = { args: { variant: "destructive", children: "Failed" } };
export const Blue: Story = { args: { variant: "blue", children: "In Review" } };
