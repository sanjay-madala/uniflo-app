import EditRuleClient from "./EditRuleClient";

export function generateStaticParams() { return [{ruleId:"rule_001"},{ruleId:"rule_002"},{ruleId:"rule_003"},{ruleId:"rule_004"},{ruleId:"rule_005"},{ruleId:"rule_006"},{ruleId:"rule_007"},{ruleId:"rule_008"},{ruleId:"rule_009"},{ruleId:"rule_010"}] }

export default function EditRulePage() {
  return <EditRuleClient />;
}
