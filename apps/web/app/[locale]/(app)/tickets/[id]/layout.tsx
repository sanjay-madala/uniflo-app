import { tickets } from "@uniflo/mock-data";

export function generateStaticParams() {
  return tickets.map((t: { id: string }) => ({ id: t.id }));
}

export default function TicketLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
