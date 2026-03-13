import { AppShell } from "../../components/layout/AppShell";

const modules = [
  { id: "01", label: "Platform Foundation", status: "active", phase: "MVP" },
  { id: "02", label: "SOP Management", status: "active", phase: "DEMO" },
  { id: "03", label: "Audit & Compliance", status: "active", phase: "DEMO" },
  { id: "04", label: "CAPA", status: "active", phase: "DEMO" },
  { id: "05", label: "Ticket Management", status: "active", phase: "DEMO" },
  { id: "06", label: "Workflow Automation", status: "active", phase: "DEMO" },
  { id: "07", label: "Knowledge Base", status: "upcoming", phase: "MVP" },
  { id: "08", label: "Analytics & Reporting", status: "upcoming", phase: "MVP" },
  { id: "09", label: "Task Management", status: "upcoming", phase: "MVP" },
  { id: "10", label: "SLA Management", status: "upcoming", phase: "MVP" },
  { id: "11", label: "Mobile Platform", status: "upcoming", phase: "DEMO" },
  { id: "12", label: "Goals & OKRs", status: "planned", phase: "ALPHA" },
  { id: "13", label: "Customer Portal", status: "planned", phase: "ALPHA" },
  { id: "14", label: "Communication", status: "planned", phase: "ALPHA" },
  { id: "15", label: "Training & LMS", status: "planned", phase: "ALPHA" },
];

const phaseColors: Record<string, string> = {
  DEMO: "#58A6FF",
  MVP: "#3FB950",
  ALPHA: "#D29922",
  BETA: "#8B949E",
};

const statusColors: Record<string, string> = {
  active: "#3FB950",
  upcoming: "#58A6FF",
  planned: "#8B949E",
};

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <AppShell locale={locale}>
      <div style={{ maxWidth: "1200px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "6px", background: "var(--accent-blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontWeight: 700, fontSize: "14px" }}>U</span>
            </div>
            <h1 style={{ color: "var(--text-primary)", fontSize: "24px", fontWeight: 700, margin: 0 }}>Uniflo Platform</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>
            Unified ops + support SaaS for distributed enterprises — QSR, Retail, Hospitality, Pharma
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "32px" }}>
          {[
            { label: "Total Modules", value: "15", color: "var(--accent-blue)" },
            { label: "In DEMO Phase", value: "6", color: "var(--accent-green)" },
            { label: "In MVP Phase", value: "5", color: "var(--accent-green)" },
            { label: "Planned Alpha", value: "4", color: "#D29922" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "4px",
                padding: "16px",
              }}
            >
              <div style={{ color: stat.color, fontSize: "24px", fontWeight: 700 }}>{stat.value}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "4px" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Module grid */}
        <div>
          <h2 style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>All Modules</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "8px" }}>
            {modules.map((mod) => (
              <div
                key={mod.id}
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "4px",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
              >
                <div style={{ color: "var(--text-muted)", fontSize: "11px", fontFamily: "monospace", flexShrink: 0, width: "32px" }}>#{mod.id}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "var(--text-primary)", fontSize: "13px", fontWeight: 500 }}>{mod.label}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                  <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "2px", fontWeight: 600, color: phaseColors[mod.phase] || "#8B949E", border: `1px solid ${phaseColors[mod.phase] || "#8B949E"}30`, backgroundColor: `${phaseColors[mod.phase] || "#8B949E"}10` }}>{mod.phase}</span>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: statusColors[mod.status] || "#8B949E" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
