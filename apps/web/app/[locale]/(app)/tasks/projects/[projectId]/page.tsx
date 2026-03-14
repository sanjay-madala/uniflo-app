import ProjectScopedTasksClient from "./ProjectScopedTasksClient";

export function generateStaticParams() { return [{projectId:"proj_001"},{projectId:"proj_002"},{projectId:"proj_003"}] }

export default function ProjectScopedTasksPage() {
  return <ProjectScopedTasksClient />;
}
