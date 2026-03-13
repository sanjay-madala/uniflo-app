import type { Meta, StoryObj } from "@storybook/react";
import { BarChart } from "./BarChart";

const meta = {
  title: "Charts/BarChart",
  component: BarChart,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData = [
  { name: "Jan", value: 400, revenue: 2400 },
  { name: "Feb", value: 300, revenue: 1398 },
  { name: "Mar", value: 200, revenue: 9800 },
  { name: "Apr", value: 278, revenue: 3908 },
  { name: "May", value: 190, revenue: 4800 },
  { name: "Jun", value: 239, revenue: 1800 },
];

export const Default: Story = {
  args: {
    data: sampleData,
    dataKey: "value",
    xAxisKey: "name",
    color: "#58A6FF",
  },
};

export const Revenue: Story = {
  args: {
    data: sampleData,
    dataKey: "revenue",
    xAxisKey: "name",
    color: "#10b981",
  },
};

export const WithoutLegend: Story = {
  args: {
    data: sampleData,
    dataKey: "value",
    xAxisKey: "name",
    showLegend: false,
  },
};

export const CustomHeight: Story = {
  args: {
    data: sampleData,
    dataKey: "value",
    xAxisKey: "name",
    height: 500,
  },
};
