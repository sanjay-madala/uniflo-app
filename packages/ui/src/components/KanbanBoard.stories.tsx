import type { Meta } from "@storybook/react";
import { KanbanBoard } from "./KanbanBoard";

const meta: Meta = { title: "Data/KanbanBoard", parameters: { layout: "fullscreen" } };
export default meta;

const columns = [
  {
    id: "backlog",
    title: "Backlog",
    color: "#8B949E",
    cards: [
      { id: "c1", title: "Set up CI pipeline", description: "Configure GitHub Actions for automated testing and deployment", labels: ["infra"] },
      { id: "c2", title: "Design onboarding flow", labels: ["design", "ux"] },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "#58A6FF",
    cards: [
      { id: "c3", title: "Build component library", description: "Step 1 of the frontend build plan", labels: ["frontend"], assignee: "sanjay" },
      { id: "c4", title: "Auth integration", assignee: "alice" },
    ],
  },
  {
    id: "review",
    title: "In Review",
    color: "#D29922",
    cards: [
      { id: "c5", title: "API rate limiting", description: "Implement token bucket algorithm" },
    ],
  },
  {
    id: "done",
    title: "Done",
    color: "#3FB950",
    cards: [
      { id: "c6", title: "Monorepo scaffold", description: "Turborepo + pnpm setup complete", labels: ["infra"] },
    ],
  },
];

export const Default = () => (
  <div className="p-6">
    <KanbanBoard columns={columns} onAddCard={(colId) => console.log("Add to", colId)} />
  </div>
);
