import type { Meta, StoryObj } from "@storybook/react";
import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import { Input } from "./Input";

const meta = {
  title: "Forms/FormSection",
  component: FormSection,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FormSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Personal Information",
    description: "Enter your personal details",
    children: (
      <div className="space-y-6">
        <FormField label="First Name" required>
          <Input placeholder="John" />
        </FormField>
        <FormField label="Last Name" required>
          <Input placeholder="Doe" />
        </FormField>
        <FormField label="Email" description="We'll never share your email">
          <Input placeholder="john@example.com" type="email" />
        </FormField>
      </div>
    ),
  },
};

export const WithDescription: Story = {
  args: {
    title: "Security Settings",
    description: "Configure your account security and privacy preferences",
    children: (
      <div className="space-y-6">
        <FormField label="Password" required>
          <Input type="password" placeholder="••••••••" />
        </FormField>
        <FormField label="Confirm Password" required>
          <Input type="password" placeholder="••••••••" />
        </FormField>
      </div>
    ),
  },
};
