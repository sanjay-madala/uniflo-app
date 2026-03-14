import SOPBuilderEditClient from "./SOPBuilderEditClient";

export function generateStaticParams() { return [{id:"sop_001"},{id:"sop_002"},{id:"sop_003"},{id:"sop_004"},{id:"sop_005"},{id:"sop_006"},{id:"sop_007"},{id:"sop_008"},{id:"sop_011"},{id:"sop_012"},{id:"sop_013"},{id:"sop_014"},{id:"sop_015"},{id:"sop_016"},{id:"sop_017"},{id:"sop_018"},{id:"sop_019"},{id:"sop_020"},{id:"sop_021"},{id:"sop_022"}] }

export default function SOPBuilderEditPage() {
  return <SOPBuilderEditClient />;
}
