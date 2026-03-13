import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./Skeleton";

const meta: Meta<typeof Skeleton> = { title: "UI/Skeleton", component: Skeleton };
export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Skeleton style={{ height: "20px", width: "200px" }} />
      <Skeleton style={{ height: "20px", width: "160px" }} />
      <Skeleton style={{ height: "20px", width: "120px" }} />
    </div>
  ),
};
