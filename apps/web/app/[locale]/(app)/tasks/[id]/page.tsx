import TaskDetailClient from "./TaskDetailClient";

export function generateStaticParams() { return [{id:"task_001"},{id:"task_002"},{id:"task_003"},{id:"task_004"},{id:"task_005"}] }

export default function TaskDetailPage() {
  return <TaskDetailClient />;
}
