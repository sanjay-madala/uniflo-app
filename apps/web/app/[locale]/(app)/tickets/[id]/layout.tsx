import { tickets } from "@uniflo/mock-data";

export function generateStaticParams() {
  return (tickets as Array<{ id: string }>).map(t => ({ id: t.id }));
}

export default function TicketLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
