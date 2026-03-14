import TicketStatusClient from "./TicketStatusClient";

export function generateStaticParams() {
  return [
    { ticketId: "pt_001" },
    { ticketId: "pt_002" },
    { ticketId: "pt_003" },
    { ticketId: "pt_004" },
    { ticketId: "pt_005" },
  ];
}

export default function TicketStatusPage() {
  return <TicketStatusClient />;
}
