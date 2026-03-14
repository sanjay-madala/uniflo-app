import AuditConductClient from "./AuditConductClient";

export function generateStaticParams() { return [{id:"aud_001"},{id:"aud_002"},{id:"aud_003"},{id:"aud_004"},{id:"aud_005"},{id:"aud_006"},{id:"aud_007"},{id:"aud_008"},{id:"aud_009"},{id:"aud_010"},{id:"aud_011"},{id:"aud_012"}] }

export default function AuditConductPage() {
  return <AuditConductClient />;
}
