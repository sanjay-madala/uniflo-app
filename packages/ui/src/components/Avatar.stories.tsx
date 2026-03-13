import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback } from "./Avatar";

const meta: Meta<typeof Avatar> = { title: "UI/Avatar", component: Avatar };
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = { render: () => <Avatar><AvatarFallback>SJ</AvatarFallback></Avatar> };
