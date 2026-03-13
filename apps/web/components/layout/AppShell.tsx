import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "var(--bg-primary)" }}>
      <Sidebar locale={locale} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar locale={locale} />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
