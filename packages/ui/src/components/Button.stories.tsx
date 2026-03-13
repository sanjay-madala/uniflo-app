import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: "primary", children: "Save changes" } };
export const Secondary: Story = { args: { variant: "secondary", children: "Cancel" } };
export const Destructive: Story = { args: { variant: "destructive", children: "Delete" } };
export const Ghost: Story = { args: { variant: "ghost", children: "Learn more" } };
