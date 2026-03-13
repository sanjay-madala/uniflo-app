import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./Textarea";

const meta = {
  title: "Inputs/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Enter your message here...",
  },
};

export const WithValue: Story = {
  args: {
    value: "This is some text in the textarea.",
    placeholder: "Enter your message here...",
    rows: 5,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled textarea",
    disabled: true,
  },
};

export const LargeTextarea: Story = {
  args: {
    placeholder: "A larger textarea for longer content...",
    rows: 8,
  },
};
