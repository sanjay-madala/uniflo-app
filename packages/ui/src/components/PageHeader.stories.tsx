import type { Meta, StoryObj } from "@storybook/react";
import { PageHeader } from "./PageHeader";
import { Button } from "./Button";
import { BreadcrumbBar } from "./BreadcrumbBar";

const meta: Meta<typeof PageHeader> = {
  title: "Layout/PageHeader",
  component: PageHeader,
};
export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: { title: "Projects", subtitle: "Manage your active projects" },
};
export const WithActions: Story = {
  args: {
    title: "Projects",
    subtitle: "Manage your active projects",
    actions: <Button size="sm">New project</Button>,
    breadcrumb: <BreadcrumbBar items={[{ label: "Home", href: "/" }, { label: "Projects" }]} />,
  },
};
