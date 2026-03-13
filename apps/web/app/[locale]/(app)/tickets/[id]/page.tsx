import TicketDetailClient from "./TicketDetailClient";

export function generateStaticParams() { return [{id:"TKT-001"},{id:"TKT-002"},{id:"TKT-003"},{id:"TKT-004"},{id:"TKT-005"}] }

export default function TicketDetailPage() {
  return <TicketDetailClient />;
}
