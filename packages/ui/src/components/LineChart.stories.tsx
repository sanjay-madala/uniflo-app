import type { Meta, StoryObj } from "@storybook/react";
import { LineChart } from "./LineChart";

const meta = {
  title: "Charts/LineChart",
  component: LineChart,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData = [
  { name: "Jan", value: 400, users: 2400 },
  { name: "Feb", value: 300, users: 1398 },
  { name: "Mar", value: 200, users: 9800 },
  { name: "Apr", value: 278, users: 3908 },
  { name: "May", value: 190, users: 4800 },
  { name: "Jun", value: 239, users: 1800 },
  { name: "Jul", value: 349, users: 2290 },
];

export const Default: Story = {
  args: {
    data: sampleData,
    dataKey: "value",
    xAxisKey: "name",
    color: "#58A6FF",
  },
};

export const WithFill: Story = {
  args: {
    data: sampleData,
    dataKey: "value",
    xAxisKey: "name",
    color: "#10b981",
    fill: true,
  },
};

export const Users: Story = {
  args: {
    data: sampleData,
    dataKey: "users",
    xAxisKey: "name",
    color: "#f59e0b",
  },
};

export const WithoutGrid: Story = {
  args: {
    data: sampleData,
    dataKey: "value",
    xAxisKey: "name",
    showGrid: false,
  },
};
