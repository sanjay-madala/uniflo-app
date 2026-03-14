import EditSLAPolicyClient from "./EditSLAPolicyClient";

export function generateStaticParams() {
  return [
    { policyId: "sla_001" },
    { policyId: "sla_002" },
    { policyId: "sla_003" },
    { policyId: "sla_004" },
    { policyId: "sla_005" },
    { policyId: "sla_006" },
  ];
}

export default function EditSLAPolicyPage() {
  return <EditSLAPolicyClient />;
}
