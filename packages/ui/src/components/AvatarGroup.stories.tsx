import type { Meta, StoryObj } from "@storybook/react";
import { AvatarGroup } from "./AvatarGroup";

const meta: Meta<typeof AvatarGroup> = {
  title: "Display/AvatarGroup",
  component: AvatarGroup,
};
export default meta;
type Story = StoryObj<typeof AvatarGroup>;

const avatars = [
  { name: "Alice Chen" },
  { name: "Bob Smith" },
  { name: "Carol Jones" },
  { name: "David Kim" },
  { name: "Eve Liu" },
  { name: "Frank Wu" },
];

export const Default: Story = { args: { avatars, max: 4 } };
export const Small: Story = { args: { avatars, max: 3, size: "sm" } };
export const Large: Story = { args: { avatars, max: 5, size: "lg" } };
