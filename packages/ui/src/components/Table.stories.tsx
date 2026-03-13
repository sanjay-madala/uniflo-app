import type { Meta, StoryObj } from "@storybook/react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./Table";

const meta: Meta<typeof Table> = { title: "UI/Table", component: Table };
export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow><TableCell>#001</TableCell><TableCell>Audit checklist</TableCell><TableCell>Active</TableCell></TableRow>
        <TableRow><TableCell>#002</TableCell><TableCell>SOP review</TableCell><TableCell>Pending</TableCell></TableRow>
      </TableBody>
    </Table>
  ),
};
