import type { Meta, StoryObj } from "@storybook/react";
import { FolderOpen, Users, FileSearch } from "lucide-react";
import { EmptyState } from "./EmptyState";

const meta: Meta<typeof EmptyState> = {
  title: "Data/EmptyState",
  component: EmptyState,
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    icon: <FolderOpen className="h-6 w-6" />,
    title: "No projects yet",
    description: "Create your first project to get started.",
    action: { label: "New project", onClick: () => {} },
  },
};
export const NoAction: Story = {
  args: {
    icon: <FileSearch className="h-6 w-6" />,
    title: "No results found",
    description: "Try adjusting your search or filters.",
  },
};
