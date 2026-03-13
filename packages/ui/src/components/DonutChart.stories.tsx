import type { Meta, StoryObj } from "@storybook/react";
import { DonutChart } from "./DonutChart";

const meta = {
  title: "Charts/DonutChart",
  component: DonutChart,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DonutChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData = [
  { name: "Open", value: 245, color: "#58A6FF" },
  { name: "In Progress", value: 128, color: "#f59e0b" },
  { name: "Closed", value: 356, color: "#10b981" },
  { name: "On Hold", value: 89, color: "#ef4444" },
];

export const Default: Story = {
  args: {
    data: sampleData,
  },
};

export const WithCenterLabel: Story = {
  args: {
    data: sampleData,
    centerLabel: "818",
  },
};

export const CustomSize: Story = {
  args: {
    data: sampleData,
    innerRadius: 80,
    outerRadius: 120,
  },
};

export const CompactSize: Story = {
  args: {
    data: sampleData,
    height: 250,
    innerRadius: 40,
    outerRadius: 80,
  },
};
