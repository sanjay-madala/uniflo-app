import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs";

const meta: Meta<typeof Tabs> = { title: "UI/Tabs", component: Tabs };
export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Overview</TabsTrigger>
        <TabsTrigger value="tab2">Details</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1"><p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Overview content</p></TabsContent>
      <TabsContent value="tab2"><p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Details content</p></TabsContent>
    </Tabs>
  ),
};
