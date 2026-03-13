import { AppShell } from "../../../components/layout/AppShell";

export default async function TasksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <AppShell locale={locale}>
      <div style={{ padding: "48px 0" }}>
        <h1 style={{ color: "var(--text-primary)", fontSize: "24px", fontWeight: 600, marginBottom: "8px" }}>Task Management</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Coming in Step 9 of the Uniflo build plan.</p>
      </div>
    </AppShell>
  );
}
