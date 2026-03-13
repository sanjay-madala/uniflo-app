import type { Meta, StoryObj } from "@storybook/react";
import { SkeletonLoader } from "./SkeletonLoader";

const meta: Meta<typeof SkeletonLoader> = {
  title: "Feedback/SkeletonLoader",
  component: SkeletonLoader,
};
export default meta;
type Story = StoryObj<typeof SkeletonLoader>;

export const TextLines: Story = { args: { variant: "text", lines: 4 } };
export const Card: Story = { args: { variant: "card" } };
export const TableRow: Story = { args: { variant: "table-row" } };
export const AllVariants = () => (
  <div className="p-4 space-y-6">
    <SkeletonLoader variant="text" />
    <SkeletonLoader variant="card" />
    <SkeletonLoader variant="table-row" />
    <SkeletonLoader variant="table-row" />
    <SkeletonLoader variant="table-row" />
  </div>
);
