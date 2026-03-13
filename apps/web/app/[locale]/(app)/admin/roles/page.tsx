"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
const roles = ["Admin", "Manager", "Operator", "Viewer"];
const modules = ["Tickets", "SOPs", "Audits", "CAPA", "Tasks", "Knowledge Base", "Analytics", "Goals", "Training"];
const operations = ["Create", "Read", "Update", "Delete"];

type Perms = Record<string, Record<string, Record<string, boolean>>>;

function initPerms(): Perms {
  const perms: Perms = {};
  for (const role of roles) {
    perms[role] = {};
    for (const mod of modules) {
      perms[role][mod] = {};
      for (const op of operations) {
        if (role === "Admin") {
          perms[role][mod][op] = true;
        } else if (role === "Manager") {
          perms[role][mod][op] = true;
        } else if (role === "Operator") {
          perms[role][mod][op] = op !== "Delete";
        } else {
          perms[role][mod][op] = op === "Read";
        }
      }
    }
  }
  return perms;
}

function Toggle({ checked, disabled, onChange }: { checked: boolean; disabled?: boolean; onChange: () => void }) {
  return (
    <button
      onClick={disabled ? undefined : onChange}
      style={{
        width: "32px",
        height: "18px",
        borderRadius: "9px",
        border: "none",
        backgroundColor: checked ? "var(--accent-green)" : "var(--bg-tertiary)",
        cursor: disabled ? "not-allowed" : "pointer",
        position: "relative",
        transition: "background-color 0.2s",
        opacity: disabled ? 0.6 : 1,
        flexShrink: 0,
      }}
    >
      <div style={{
        width: "14px",
        height: "14px",
        borderRadius: "50%",
        backgroundColor: "white",
        position: "absolute",
        top: "2px",
        left: checked ? "16px" : "2px",
        transition: "left 0.2s",
      }} />
    </button>
  );
}

export default function AdminRolesPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [perms, setPerms] = useState<Perms>(initPerms);

  const togglePerm = (role: string, mod: string, op: string) => {
    if (role === "Admin") return;
    setPerms((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [mod]: {
          ...prev[role][mod],
          [op]: !prev[role][mod][op],
        },
      },
    }));
  };

  return (
    <div>
        <h1 style={{ color: "var(--text-primary)", fontSize: "20px", fontWeight: 600, marginBottom: "24px" }}>Roles &amp; Permissions</h1>

        <div style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)", borderRadius: "8px", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", minWidth: "140px" }}>Module</th>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", minWidth: "60px" }}>Op</th>
                {roles.map((r) => (
                  <th key={r} style={{ textAlign: "center", padding: "12px 16px", color: r === "Admin" ? "var(--accent-blue)" : "var(--text-secondary)", fontSize: "12px", fontWeight: 600, minWidth: "90px" }}>
                    {r}
                    {r === "Admin" && <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: 400 }}>locked</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((mod) => (
                operations.map((op, opIdx) => (
                  <tr key={`${mod}-${op}`} style={{ borderBottom: opIdx === operations.length - 1 ? "1px solid var(--border-default)" : "1px solid var(--border-muted)" }}>
                    {opIdx === 0 ? (
                      <td rowSpan={operations.length} style={{ padding: "10px 16px", color: "var(--text-primary)", fontSize: "13px", fontWeight: 500, borderBottom: "1px solid var(--border-default)", verticalAlign: "top" }}>{mod}</td>
                    ) : null}
                    <td style={{ padding: "6px 16px", color: "var(--text-muted)", fontSize: "11px" }}>{op}</td>
                    {roles.map((role) => (
                      <td key={role} style={{ padding: "6px 16px", textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <Toggle
                            checked={perms[role][mod][op]}
                            disabled={role === "Admin"}
                            onChange={() => togglePerm(role, mod, op)}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
}
