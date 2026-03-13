"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
const mockUsers = [
  { id: 1, name: "Sarah Chen", email: "sarah.chen@democorp.com", role: "admin", location: "HQ New York", active: true },
  { id: 2, name: "James Wilson", email: "james.w@democorp.com", role: "manager", location: "HQ New York", active: true },
  { id: 3, name: "Maria Garcia", email: "maria.g@democorp.com", role: "field_staff", location: "West Coast Hub", active: true },
  { id: 4, name: "Ahmed Khan", email: "ahmed.k@democorp.com", role: "manager", location: "Chicago Store", active: true },
  { id: 5, name: "Lisa Park", email: "lisa.p@democorp.com", role: "admin", location: "HQ New York", active: false },
  { id: 6, name: "David Brown", email: "david.b@democorp.com", role: "field_staff", location: "West Coast Hub", active: true },
  { id: 7, name: "Emma Taylor", email: "emma.t@democorp.com", role: "manager", location: "Chicago Store", active: true },
  { id: 8, name: "Raj Patel", email: "raj.p@democorp.com", role: "field_staff", location: "HQ New York", active: true },
  { id: 9, name: "Sophie Martin", email: "sophie.m@democorp.com", role: "admin", location: "West Coast Hub", active: false },
  { id: 10, name: "Tom Anderson", email: "tom.a@democorp.com", role: "field_staff", location: "Chicago Store", active: true },
  { id: 11, name: "Nina Rossi", email: "nina.r@democorp.com", role: "manager", location: "HQ New York", active: true },
  { id: 12, name: "Chris Lee", email: "chris.l@democorp.com", role: "field_staff", location: "West Coast Hub", active: true },
  { id: 13, name: "Anna Schmidt", email: "anna.s@democorp.com", role: "admin", location: "Chicago Store", active: true },
  { id: 14, name: "Jake Murphy", email: "jake.m@democorp.com", role: "field_staff", location: "HQ New York", active: false },
  { id: 15, name: "Priya Sharma", email: "priya.s@democorp.com", role: "manager", location: "West Coast Hub", active: true },
  { id: 16, name: "Mark Johnson", email: "mark.j@democorp.com", role: "field_staff", location: "Chicago Store", active: true },
  { id: 17, name: "Yuki Tanaka", email: "yuki.t@democorp.com", role: "manager", location: "HQ New York", active: true },
  { id: 18, name: "Ben Carter", email: "ben.c@democorp.com", role: "field_staff", location: "West Coast Hub", active: true },
  { id: 19, name: "Olivia White", email: "olivia.w@democorp.com", role: "admin", location: "Chicago Store", active: false },
  { id: 20, name: "Leo Kim", email: "leo.k@democorp.com", role: "field_staff", location: "HQ New York", active: true },
];

const locations = ["All", "HQ New York", "West Coast Hub", "Chicago Store"];
const roles = ["All", "admin", "manager", "field_staff"];

const roleBadge: Record<string, { bg: string; color: string }> = {
  admin: { bg: "rgba(88,166,255,0.1)", color: "var(--accent-blue)" },
  manager: { bg: "rgba(210,153,34,0.1)", color: "var(--accent-yellow)" },
  field_staff: { bg: "rgba(63,185,80,0.1)", color: "var(--accent-green)" },
};

export default function AdminUsersPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [users, setUsers] = useState(mockUsers);
  const [roleFilter, setRoleFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("field_staff");

  const filtered = users.filter((u) => {
    if (roleFilter !== "All" && u.role !== roleFilter) return false;
    if (locationFilter !== "All" && u.location !== locationFilter) return false;
    return true;
  });

  const perPage = 10;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleActive = (id: number) => {
    setUsers(users.map((u) => u.id === id ? { ...u, active: !u.active } : u));
  };

  const selectStyle: React.CSSProperties = {
    padding: "7px 10px",
    borderRadius: "6px",
    border: "1px solid var(--border-default)",
    backgroundColor: "var(--bg-secondary)",
    color: "var(--text-primary)",
    fontSize: "12px",
    outline: "none",
    appearance: "none",
  };

  return (
    <>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1 style={{ color: "var(--text-primary)", fontSize: "20px", fontWeight: 600, margin: 0 }}>Users</h1>
          <button
            onClick={() => setShowInvite(true)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 14px", borderRadius: "6px", border: "none",
              backgroundColor: "var(--accent-blue)", color: "white",
              fontSize: "13px", fontWeight: 600, cursor: "pointer",
            }}
          >
            <Plus size={14} /> Invite user
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} style={selectStyle}>
            {roles.map((r) => <option key={r} value={r}>{r === "All" ? "All Roles" : r.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
          </select>
          <select value={locationFilter} onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }} style={selectStyle}>
            {locations.map((l) => <option key={l} value={l}>{l === "All" ? "All Locations" : l}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={{ border: "1px solid var(--border-default)", borderRadius: "8px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-secondary)" }}>
                {["User", "Email", "Role", "Location", "Status"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid var(--border-default)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((u) => {
                const badge = roleBadge[u.role] || roleBadge.admin;
                return (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--border-muted)" }}>
                    <td style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "30px", height: "30px", borderRadius: "50%",
                        backgroundColor: badge.color, display: "flex",
                        alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <span style={{ color: "white", fontSize: "11px", fontWeight: 600 }}>{u.name.split(" ").map((n) => n[0]).join("")}</span>
                      </div>
                      <span style={{ color: "var(--text-primary)", fontSize: "13px", fontWeight: 500 }}>{u.name}</span>
                    </td>
                    <td style={{ padding: "10px 16px", color: "var(--text-secondary)", fontSize: "13px" }}>{u.email}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{
                        padding: "2px 8px", borderRadius: "4px",
                        backgroundColor: badge.bg, color: badge.color,
                        fontSize: "11px", fontWeight: 500, textTransform: "capitalize",
                      }}>
                        {u.role.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px", color: "var(--text-secondary)", fontSize: "13px" }}>{u.location}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <button
                        onClick={() => toggleActive(u.id)}
                        style={{
                          width: "36px", height: "20px", borderRadius: "10px",
                          border: "none", cursor: "pointer",
                          backgroundColor: u.active ? "var(--accent-green)" : "var(--bg-tertiary)",
                          position: "relative", transition: "background-color 0.2s",
                        }}
                      >
                        <div style={{
                          width: "16px", height: "16px", borderRadius: "50%",
                          backgroundColor: "white", position: "absolute",
                          top: "2px", left: u.active ? "18px" : "2px",
                          transition: "left 0.2s",
                        }} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
              Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--border-default)", backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)", cursor: "pointer", opacity: page === 1 ? 0.4 : 1, display: "flex", alignItems: "center" }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--border-default)", backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)", cursor: "pointer", opacity: page === totalPages ? 0.4 : 1, display: "flex", alignItems: "center" }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        }}>
          <div style={{
            width: "100%", maxWidth: "420px",
            backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)",
            borderRadius: "12px", padding: "24px",
            boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ color: "var(--text-primary)", fontSize: "16px", fontWeight: 600, margin: 0 }}>Invite user</h2>
              <button onClick={() => setShowInvite(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 500, marginBottom: "6px" }}>Email</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@company.com"
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: "6px",
                  border: "1px solid var(--border-default)", backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)", fontSize: "13px", outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 500, marginBottom: "6px" }}>Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: "6px",
                  border: "1px solid var(--border-default)", backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)", fontSize: "13px", outline: "none", boxSizing: "border-box", appearance: "none" as const,
                }}
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="field_staff">Field Staff</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowInvite(false)}
                style={{
                  padding: "8px 16px", borderRadius: "6px",
                  border: "1px solid var(--border-default)", backgroundColor: "transparent",
                  color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (inviteEmail) {
                    setUsers([...users, { id: users.length + 1, name: inviteEmail.split("@")[0], email: inviteEmail, role: inviteRole, location: "HQ New York", active: true }]);
                    setInviteEmail("");
                    setShowInvite(false);
                  }
                }}
                style={{
                  padding: "8px 16px", borderRadius: "6px",
                  border: "none", backgroundColor: "var(--accent-blue)",
                  color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                }}
              >
                Send invite
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
