import type { Meta } from "@storybook/react";
import { ListView } from "./ListView";
import { Badge } from "./Badge";

const meta: Meta = { title: "Data/ListView" };
export default meta;

interface Project { id: string; name: string; status: string; owner: string; }

const items: Project[] = [
  { id: "1", name: "Uniflo Platform", status: "active", owner: "Sanjay" },
  { id: "2", name: "Auth Service", status: "pending", owner: "Alice" },
  { id: "3", name: "Analytics", status: "closed", owner: "Bob" },
];

const columns = [
  { key: "name", header: "Name", render: (item: Project) => <span className="text-sm font-medium text-[var(--text-primary)]">{item.name}</span> },
  { key: "status", header: "Status", width: "w-24", render: (item: Project) => <Badge variant={item.status === "active" ? "success" : item.status === "pending" ? "warning" : "default"}>{item.status}</Badge> },
  { key: "owner", header: "Owner", width: "w-32", render: (item: Project) => <span className="text-sm text-[var(--text-secondary)]">{item.owner}</span> },
];

const actions = [
  { label: "Edit", onClick: (item: Project) => console.log("Edit", item) },
  { label: "Delete", onClick: (item: Project) => console.log("Delete", item), destructive: true },
];

export const Default = () => (
  <div className="p-4">
    <ListView items={items} columns={columns} actions={actions} />
  </div>
);
