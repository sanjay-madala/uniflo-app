import { Search, Bell } from "lucide-react";

export function TopBar({ locale }: { locale: string }) {
  return (
    <header
      style={{
        height: "56px",
        borderBottom: "1px solid var(--border-default)",
        backgroundColor: "var(--bg-primary)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: "16px",
        flexShrink: 0,
      }}
    >
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", maxWidth: "400px" }}>
        <Search size={14} style={{ color: "var(--text-muted)" }} />
        <input
          placeholder="Search..."
          style={{
            background: "none",
            border: "none",
            outline: "none",
            color: "var(--text-primary)",
            fontSize: "13px",
            width: "100%",
          }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto" }}>
        <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
          <Bell size={16} />
        </button>
        <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "var(--accent-blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "white", fontSize: "11px", fontWeight: 600 }}>S</span>
        </div>
      </div>
    </header>
  );
}
