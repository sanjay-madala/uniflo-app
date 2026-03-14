import EditRuleClient from "./EditRuleClient";

export function generateStaticParams() { return [{ruleId:"rule_001"},{ruleId:"rule_002"},{ruleId:"rule_003"}] }

export default function EditRulePage() {
  return <EditRuleClient />;
}
