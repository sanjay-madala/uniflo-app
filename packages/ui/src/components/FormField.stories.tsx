import type { Meta, StoryObj } from "@storybook/react";
import { FormField } from "./FormField";
import { Input } from "./Input";

const meta = {
  title: "Forms/FormField",
  component: FormField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Email Address",
    description: "Enter your email address",
    children: <Input placeholder="name@example.com" />,
  },
};

export const WithError: Story = {
  args: {
    label: "Email Address",
    error: "Invalid email format",
    children: <Input placeholder="name@example.com" />,
  },
};

export const Required: Story = {
  args: {
    label: "Full Name",
    required: true,
    description: "Your full legal name",
    children: <Input placeholder="John Doe" />,
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled Field",
    disabled: true,
    children: <Input disabled placeholder="Cannot edit" />,
  },
};
