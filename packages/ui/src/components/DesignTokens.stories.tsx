import type { Meta, StoryObj } from "@storybook/react";

const tokens = {
  background: [
    { name: "--bg-primary", value: "#0D1117", description: "Main background (dark)" },
    { name: "--bg-secondary", value: "#161B22", description: "Surface/card background" },
    { name: "--bg-tertiary", value: "#1C2128", description: "Hover state" },
  ],
  accent: [
    { name: "--accent-blue", value: "#58A6FF", description: "Primary action" },
    { name: "--accent-green", value: "#3FB950", description: "Success" },
    { name: "--accent-red", value: "#F85149", description: "Error/danger" },
    { name: "--accent-yellow", value: "#D29922", description: "Warning" },
  ],
  text: [
    { name: "--text-primary", value: "#E6EDF3", description: "Primary text" },
    { name: "--text-secondary", value: "#8B949E", description: "Secondary text" },
    { name: "--text-muted", value: "#484F58", description: "Muted/placeholder" },
  ],
  border: [
    { name: "--border-default", value: "#30363D", description: "Default border" },
    { name: "--border-muted", value: "#21262D", description: "Subtle border" },
  ],
};

function TokenSwatch({ name, value, description }: { name: string; value: string; description: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: "1px solid #30363D" }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "6px", backgroundColor: value, border: "1px solid #30363D", flexShrink: 0 }} />
      <div>
        <code style={{ fontSize: "13px", color: "#58A6FF" }}>{name}</code>
        <div style={{ fontSize: "11px", color: "#8B949E" }}>{value} — {description}</div>
      </div>
    </div>
  );
}

function DesignTokens() {
  return (
    <div style={{ padding: "24px", background: "#0D1117", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ color: "#E6EDF3", fontSize: "20px", fontWeight: 700, marginBottom: "24px" }}>Uniflo Design Tokens</h1>
      {Object.entries(tokens).map(([category, list]) => (
        <div key={category} style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#8B949E", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>{category}</h2>
          {list.map((t) => <TokenSwatch key={t.name} {...t} />)}
        </div>
      ))}
    </div>
  );
}

const meta: Meta = { title: "Design System/Tokens", component: DesignTokens };
export default meta;
export const AllTokens: StoryObj = {};
