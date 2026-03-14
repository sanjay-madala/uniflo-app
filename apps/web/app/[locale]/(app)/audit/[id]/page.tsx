import AuditDetailClient from "./AuditDetailClient";

export function generateStaticParams() { return [{id:"audit_001"},{id:"audit_002"},{id:"audit_003"},{id:"audit_004"},{id:"audit_005"}] }

export default function AuditDetailPage() {
  return <AuditDetailClient />;
}
