import type { Meta, StoryObj } from "@storybook/react";
import { BreadcrumbBar } from "./BreadcrumbBar";

const meta: Meta<typeof BreadcrumbBar> = {
  title: "Navigation/BreadcrumbBar",
  component: BreadcrumbBar,
};
export default meta;
type Story = StoryObj<typeof BreadcrumbBar>;

export const Default: Story = {
  args: { items: [{ label: "Home", href: "/" }, { label: "Projects", href: "/projects" }, { label: "Uniflo" }] },
};
export const Truncated: Story = {
  args: {
    items: [
      { label: "Home", href: "/" }, { label: "Org", href: "/org" },
      { label: "Projects", href: "/projects" }, { label: "Sprint 4", href: "/sprint" }, { label: "Current" },
    ],
    maxItems: 3,
  },
};
export const RTL: Story = {
  args: {
    dir: "rtl",
    items: [{ label: "الرئيسية", href: "/" }, { label: "المشاريع", href: "/projects" }, { label: "يونيفلو" }],
  },
};
