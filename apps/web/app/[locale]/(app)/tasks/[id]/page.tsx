import TaskDetailClient from "./TaskDetailClient";

export function generateStaticParams() { return [{id:"task_001"},{id:"task_002"},{id:"task_003"},{id:"task_004"},{id:"task_005"},{id:"task_006"},{id:"task_007"},{id:"task_008"},{id:"task_009"},{id:"task_010"},{id:"task_011"},{id:"task_012"},{id:"task_013"},{id:"task_014"},{id:"task_015"},{id:"task_016"},{id:"task_017"},{id:"task_018"},{id:"task_019"},{id:"task_020"},{id:"task_021"},{id:"task_022"},{id:"task_023"},{id:"task_024"},{id:"task_025"}] }

export default function TaskDetailPage() {
  return <TaskDetailClient />;
}
