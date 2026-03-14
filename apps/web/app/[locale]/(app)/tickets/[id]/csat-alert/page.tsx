import CSATAuditAlertClient from "./CSATAuditAlertClient";

export function generateStaticParams() {
  return [
    { id: "tkt_00045" },
    { id: "tkt_00041" },
    { id: "tkt_00035" },
    { id: "tkt_00038" },
  ];
}

export default function CSATAuditAlertPage() {
  return <CSATAuditAlertClient />;
}
