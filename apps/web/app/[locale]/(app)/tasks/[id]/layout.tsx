import { tasks } from "@uniflo/mock-data";

export function generateStaticParams() {
  return (tasks as Array<{ id: string }>).map(t => ({ id: t.id }));
}

export default function TaskLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
