import GoalDetailClient from "./GoalDetailClient";

export function generateStaticParams() {
  return [
    { goalId: "goal_001" },
    { goalId: "goal_002" },
    { goalId: "goal_003" },
    { goalId: "goal_004" },
    { goalId: "goal_005" },
    { goalId: "goal_006" },
    { goalId: "goal_007" },
    { goalId: "goal_008" },
    { goalId: "goal_009" },
  ];
}

export default function GoalDetailPage() {
  return <GoalDetailClient />;
}
