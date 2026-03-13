import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";

const meta: Meta<typeof Card> = { title: "UI/Card", component: Card };
export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card style={{ width: "320px" }}>
      <CardHeader><CardTitle>Card Title</CardTitle></CardHeader>
      <CardContent><p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Card content goes here.</p></CardContent>
    </Card>
  ),
};
