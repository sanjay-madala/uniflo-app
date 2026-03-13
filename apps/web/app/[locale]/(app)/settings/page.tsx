"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useToast, Toaster } from "@uniflo/ui";
import { Plus, X } from "lucide-react";

const moduleList = [
  { id: "tickets", label: "Tickets", description: "Track and resolve support tickets" },
  { id: "sops", label: "SOPs", description: "Standard operating procedures" },
  { id: "audits", label: "Audits", description: "Compliance and quality audits" },
  { id: "capa", label: "CAPA", description: "Corrective and preventive actions" },
  { id: "tasks", label: "Tasks", description: "Task management and assignment" },
  { id: "analytics", label: "Analytics", description: "Reporting and data insights" },
  { id: "sla", label: "SLA", description: "Service level agreements" },
  { id: "knowledge", label: "Knowledge Base", description: "Documentation and articles" },
  { id: "workflow", label: "Workflow", description: "Automation and workflows" },
  { id: "goals", label: "Goals", description: "OKRs and goal tracking" },
  { id: "customer", label: "Customer Portal", description: "External customer access" },
  { id: "comms", label: "Communications", description: "Internal messaging" },
  { id: "training", label: "Training", description: "LMS and training programs" },
];

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

const initialMembers: TeamMember[] = [
  { id: "1", name: "Alex Morgan", email: "alex.morgan@uniflo.io", role: "Admin" },
  { id: "2", name: "Sarah Chen", email: "sarah.chen@uniflo.io", role: "Manager" },
  { id: "3", name: "Marcus Johnson", email: "marcus.j@uniflo.io", role: "Operator" },
  { id: "4", name: "Priya Sharma", email: "p.sharma@uniflo.io", role: "Viewer" },
];

export default function SettingsPage() {
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const { user } = useAuth();
  const { toasts, toast, dismiss } = useToast();

  const [tab, setTab] = useState<"general" | "team" | "modules" | "billing">("general");
  const [orgName, setOrgName] = useState(user.org);
  const [industry, setIndustry] = useState("QSR");
  const [orgTimezone, setOrgTimezone] = useState("UTC");
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [enabledModules, setEnabledModules] = useState<Set<string>>(
    new Set(["tickets", "sops", "audits", "capa", "tasks", "analytics"])
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Operator");

  const tabs = [
    { id: "general" as const, label: "General" },
    { id: "team" as const, label: "Team" },
    { id: "modules" as const, label: "Modules" },
    { id: "billing" as const, label: "Billing" },
  ];

  const toggleModule = (id: string) => {
    const next = new Set(enabledModules);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setEnabledModules(next);
    toast({ title: next.has(id) ? `${id} enabled` : `${id} disabled`, variant: "info" });
  };

  const addMember = () => {
    if (!newEmail.trim()) return;
    const name = newEmail.split("@")[0].replace(/[._]/g, " ");
    setMembers([...members, {
      id: String(members.length + 1),
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: newEmail,
      role: newRole,
    }]);
    setNewEmail("");
    setNewRole("Operator");
    setShowAddModal(false);
    toast({ title: "Team member added", variant: "success" });
  };

  return (
    <>
      <div style={{ maxWidth: "800px" }}>
      <h1 style={{ color: "var(--text-primary)", fontSize: "24px", fontWeight: 600, margin: "0 0 24px 0" }}>
        Settings
      </h1>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "0", borderBottom: "1px solid var(--border-default)", marginBottom: "24px" }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: "8px 16px",
                  background: "none",
                  border: "none",
                  borderBottom: tab === t.id ? "2px solid var(--accent-blue)" : "2px solid transparent",
                  color: tab === t.id ? "var(--accent-blue)" : "var(--text-secondary)",
                  fontSize: "13px",
                  fontWeight: tab === t.id ? 600 : 400,
                  cursor: "pointer",
                  marginBottom: "-1px",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* General Tab */}
          {tab === "general" && (
            <div
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "8px",
                padding: "24px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Organization Name</label>
                  <input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    style={{ ...inputStyle, minWidth: "200px" }}
                  >
                    {["QSR", "Retail", "Hospitality", "Pharma", "Other"].map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Timezone</label>
                  <select
                    value={orgTimezone}
                    onChange={(e) => setOrgTimezone(e.target.value)}
                    style={{ ...inputStyle, minWidth: "200px" }}
                  >
                    {["UTC", "US/Eastern", "US/Central", "US/Pacific", "Europe/London", "Asia/Tokyo"].map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Logo</label>
                  <div
                    style={{
                      padding: "24px",
                      border: "1px dashed var(--border-default)",
                      borderRadius: "6px",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: 0 }}>
                      Click to upload or drag and drop
                    </p>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => toast({ title: "Settings saved", variant: "success" })}
                    style={{
                      height: "36px",
                      padding: "0 16px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: "var(--accent-blue)",
                      color: "white",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Save changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Team Tab */}
          {tab === "team" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{members.length} members</span>
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    height: "32px",
                    padding: "0 12px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "var(--accent-blue)",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={14} />
                  Add member
                </button>
              </div>

              <div
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Email</th>
                      <th style={thStyle}>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.id} style={{ borderBottom: "1px solid var(--border-muted)" }}>
                        <td style={tdStyle}>{m.name}</td>
                        <td style={{ ...tdStyle, color: "var(--text-muted)" }}>{m.email}</td>
                        <td style={tdStyle}>
                          <select
                            value={m.role}
                            onChange={(e) => {
                              setMembers(members.map((x) => x.id === m.id ? { ...x, role: e.target.value } : x));
                              toast({ title: `${m.name} role updated to ${e.target.value}`, variant: "info" });
                            }}
                            style={{
                              height: "28px",
                              padding: "0 8px",
                              borderRadius: "4px",
                              border: "1px solid var(--border-default)",
                              backgroundColor: "var(--bg-primary)",
                              color: "var(--text-primary)",
                              fontSize: "12px",
                              outline: "none",
                            }}
                          >
                            {["Admin", "Manager", "Operator", "Viewer"].map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add member modal */}
              {showAddModal && (
                <>
                  <div
                    style={{
                      position: "fixed",
                      inset: 0,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      zIndex: 50,
                    }}
                    onClick={() => setShowAddModal(false)}
                  />
                  <div
                    style={{
                      position: "fixed",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "400px",
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "12px",
                      zIndex: 51,
                      boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-default)" }}>
                      <span style={{ color: "var(--text-primary)", fontSize: "15px", fontWeight: 600 }}>Add Team Member</span>
                      <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                        <X size={16} />
                      </button>
                    </div>
                    <div style={{ padding: "20px" }}>
                      <div style={{ marginBottom: "12px" }}>
                        <label style={labelStyle}>Email</label>
                        <input
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="colleague@company.com"
                          style={inputStyle}
                          autoFocus
                        />
                      </div>
                      <div style={{ marginBottom: "16px" }}>
                        <label style={labelStyle}>Role</label>
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          style={inputStyle}
                        >
                          {["Admin", "Manager", "Operator", "Viewer"].map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        <button
                          onClick={() => setShowAddModal(false)}
                          style={{
                            height: "32px",
                            padding: "0 12px",
                            borderRadius: "6px",
                            border: "1px solid var(--border-default)",
                            backgroundColor: "transparent",
                            color: "var(--text-secondary)",
                            fontSize: "13px",
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={addMember}
                          style={{
                            height: "32px",
                            padding: "0 12px",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: "var(--accent-blue)",
                            color: "white",
                            fontSize: "13px",
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                        >
                          Add member
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Modules Tab */}
          {tab === "modules" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {moduleList.map((mod) => {
                const enabled = enabledModules.has(mod.id);
                return (
                  <button
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      border: `1px solid ${enabled ? "var(--accent-blue)" : "var(--border-default)"}`,
                      backgroundColor: enabled ? "rgba(88,166,255,0.08)" : "var(--bg-secondary)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ color: enabled ? "var(--accent-blue)" : "var(--text-primary)", fontSize: "14px", fontWeight: 500 }}>
                        {mod.label}
                      </span>
                      <div
                        style={{
                          width: "36px",
                          height: "20px",
                          borderRadius: "10px",
                          backgroundColor: enabled ? "var(--accent-blue)" : "var(--bg-tertiary)",
                          position: "relative",
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        <div
                          style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            backgroundColor: "white",
                            position: "absolute",
                            top: "2px",
                            left: enabled ? "18px" : "2px",
                            transition: "left 0.2s ease",
                          }}
                        />
                      </div>
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: 0 }}>{mod.description}</p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Billing Tab */}
          {tab === "billing" && (
            <div
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "8px",
                padding: "48px 24px",
                textAlign: "center",
              }}
            >
              <p style={{ color: "var(--text-muted)", fontSize: "15px", margin: "0 0 16px 0" }}>
                Billing is not yet available
              </p>
              <button
                style={{
                  height: "36px",
                  padding: "0 20px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-default)",
                  backgroundColor: "transparent",
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
                onClick={() => toast({ title: "Contact sales at hello@uniflo.io", variant: "info" })}
              >
                Contact sales
              </button>
            </div>
          )}
        </div>
        <Toaster toasts={toasts} dismiss={dismiss} />
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 500,
  color: "var(--text-secondary)",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "36px",
  padding: "0 10px",
  borderRadius: "6px",
  border: "1px solid var(--border-default)",
  backgroundColor: "var(--bg-primary)",
  color: "var(--text-primary)",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 16px",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--text-muted)",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  color: "var(--text-primary)",
};
