import QuizClient from "./QuizClient";

export function generateStaticParams() {
  return [
    { moduleId: "trn_001" },
    { moduleId: "trn_002" },
    { moduleId: "trn_003" },
    { moduleId: "trn_004" },
    { moduleId: "trn_005" },
    { moduleId: "trn_006" },
    { moduleId: "trn_007" },
    { moduleId: "trn_008" },
    { moduleId: "trn_009" },
    { moduleId: "trn_010" },
    { moduleId: "trn_011" },
    { moduleId: "trn_012" },
  ];
}

export default function QuizPage() {
  return <QuizClient />;
}
