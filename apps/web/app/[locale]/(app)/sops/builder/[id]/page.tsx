import SOPBuilderEditClient from "./SOPBuilderEditClient";

export function generateStaticParams() { return [{id:"sop_001"},{id:"sop_002"},{id:"sop_003"},{id:"sop_004"},{id:"sop_005"}] }

export default function SOPBuilderEditPage() {
  return <SOPBuilderEditClient />;
}
