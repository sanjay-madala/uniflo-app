import type { Meta, StoryObj } from "@storybook/react";
import { UserTag } from "./UserTag";

const meta: Meta<typeof UserTag> = {
  title: "Display/UserTag",
  component: UserTag,
};
export default meta;
type Story = StoryObj<typeof UserTag>;

export const Default: Story = { args: { name: "Sanjay Madala" } };
export const Small: Story = { args: { name: "Alice Chen", size: "sm" } };
