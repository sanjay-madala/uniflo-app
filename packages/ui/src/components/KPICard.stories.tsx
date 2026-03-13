import type { Meta, StoryObj } from "@storybook/react";
import { KPICard } from "./KPICard";

const meta = {
  title: "Display/KPICard",
  component: KPICard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof KPICard>;

export default meta;
type Story = StoryObj<typeof meta>;

const sparklineData = [
  { name: "1", value: 100 },
  { name: "2", value: 120 },
  { name: "3", value: 110 },
  { name: "4", value: 140 },
  { name: "5", value: 130 },
  { name: "6", value: 150 },
];

export const Default: Story = {
  args: {
    title: "Total Revenue",
    value: 45000,
    unit: "USD",
    trend: 12.5,
    trendLabel: "vs last month",
    sparklineData,
    color: "#10b981",
  },
};

export const NegativeTrend: Story = {
  args: {
    title: "Churn Rate",
    value: 3.2,
    unit: "%",
    trend: -2.1,
    trendLabel: "vs last month",
    sparklineData,
    color: "#ef4444",
    isPositive: false,
  },
};

export const NoTrend: Story = {
  args: {
    title: "Active Users",
    value: 12450,
    sparklineData,
    color: "#58A6FF",
  },
};

export const CompactCard: Story = {
  args: {
    title: "Conversion Rate",
    value: 4.8,
    unit: "%",
    trend: 1.3,
    trendLabel: "vs last week",
    color: "#f59e0b",
  },
};
