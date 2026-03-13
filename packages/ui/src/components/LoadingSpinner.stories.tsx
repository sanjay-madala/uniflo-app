import type { Meta, StoryObj } from "@storybook/react";
import { LoadingSpinner } from "./LoadingSpinner";

const meta: Meta<typeof LoadingSpinner> = {
  title: "Feedback/LoadingSpinner",
  component: LoadingSpinner,
};
export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

export const Small: Story = { args: { size: "sm" } };
export const Medium: Story = { args: { size: "md" } };
export const Large: Story = { args: { size: "lg" } };
export const AllSizes = () => (
  <div className="flex items-center gap-6 p-4">
    <LoadingSpinner size="sm" />
    <LoadingSpinner size="md" />
    <LoadingSpinner size="lg" />
  </div>
);
