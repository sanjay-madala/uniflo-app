import type { Meta, StoryObj } from "@storybook/react";
import { Mail, Lock } from "lucide-react";
import { TextField } from "./TextField";

const meta: Meta<typeof TextField> = {
  title: "Inputs/TextField",
  component: TextField,
};
export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = { args: { label: "Email", placeholder: "you@example.com" } };
export const WithError: Story = { args: { label: "Email", value: "bad", error: "Invalid email address" } };
export const WithIcons: Story = { args: { label: "Password", type: "password", prefixIcon: <Lock className="h-4 w-4" />, placeholder: "••••••••" } };
export const Disabled: Story = { args: { label: "Email", value: "locked@example.com", disabled: true } };
export const WithHint: Story = { args: { label: "Username", hint: "Must be 3–20 characters", placeholder: "sanjay" } };
