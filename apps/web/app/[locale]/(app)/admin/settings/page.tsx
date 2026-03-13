"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, X, Upload } from "lucide-react";

const timezones = ["UTC-8 (PST)", "UTC-5 (EST)", "UTC+0 (GMT)", "UTC+4 (GST)", "UTC+5:30 (IST)"];
const languages = ["English", "Arabic", "French", "German"];

export default function AdminSettingsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [orgName, setOrgName] = useState("Uniflo Demo Co");
  const [timezone, setTimezone] = useState("UTC+5:30 (IST)");
  const [language, setLanguage] = useState("English");
  const [locations, setLocations] = useState(["HQ Mumbai", "Branch Delhi", "Branch Bangalore"]);
  const [newLocation, setNewLocation] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const addLocation = () => {
    if (newLocation.trim()) {
      setLocations([...locations, newLocation.trim()]);
      setNewLocation("");
    }
  };

  const section = (title: string, children: React.ReactNode, onSave?: () => void) => (
    <div style={{
      backgroundColor: "var(--bg-secondary)",
      border: "1px solid var(--border-default)",
      borderRadius: "8px",
      padding: "24px",
      marginBottom: "16px",
    }}>
      <h2 style={{ color: "var(--text-primary)", fontSize: "16px", fontWeight: 600, margin: "0 0 20px 0" }}>{title}</h2>
      {children}
      {onSave && (
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onSave}
            style={{
              padding: "8px 20px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "var(--accent-blue)",
              color: "white",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );

  const inputStyle = {
    width: "100%" as const,
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid var(--border-default)",
    backgroundColor: "var(--bg-tertiary)",
    color: "var(--text-primary)",
    fontSize: "13px",
    outline: "none" as const,
    boxSizing: "border-box" as const,
  };

  return (
    <div style={{ maxWidth: "700px" }}>
      <h1 style={{ color: "var(--text-primary)", fontSize: "20px", fontWeight: 600, marginBottom: "24px" }}>Organization Settings</h1>

      {/* Org Profile */}
      {section("Organization Profile", (
        <>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 500, marginBottom: "6px" }}>Organization name</label>
            <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 500, marginBottom: "6px" }}>Logo</label>
            <button
              onClick={() => showToast("Upload coming soon")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                borderRadius: "6px",
                border: "1px dashed var(--border-default)",
                backgroundColor: "transparent",
                color: "var(--text-muted)",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              <Upload size={14} /> Upload logo
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 500, marginBottom: "6px" }}>Timezone</label>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)} style={inputStyle}>
                {timezones.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 500, marginBottom: "6px" }}>Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} style={inputStyle}>
                {languages.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </>
      ), () => showToast("Organization profile saved"))}

      {/* Location Hierarchy */}
      {section("Location Hierarchy", (
        <>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="New location name"
              onKeyDown={(e) => e.key === "Enter" && addLocation()}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={addLocation}
              style={{
                padding: "10px 16px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "var(--accent-blue)",
                color: "white",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                flexShrink: 0,
              }}
            >
              <Plus size={14} /> Add
            </button>
          </div>
          {locations.map((loc, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              marginBottom: "6px",
              borderRadius: "6px",
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--border-muted)",
            }}>
              <span style={{ color: "var(--text-primary)", fontSize: "13px" }}>{loc}</span>
              <button
                onClick={() => setLocations(locations.filter((_, j) => j !== i))}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </>
      ), () => showToast("Locations saved"))}

      {/* Subscription */}
      {section("Subscription", (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "4px",
              backgroundColor: "rgba(88,166,255,0.1)",
              color: "var(--accent-blue)",
              fontSize: "13px",
              fontWeight: 600,
            }}>
              Enterprise Plan
            </span>
            <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "8px 0 0 0" }}>Full access to all features</p>
          </div>
          <button
            onClick={() => showToast("Sales team notified")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "1px solid var(--border-default)",
              backgroundColor: "transparent",
              color: "var(--text-secondary)",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Contact sales
          </button>
        </div>
      ))}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          padding: "10px 16px",
          borderRadius: "8px",
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
          color: "var(--text-primary)",
          fontSize: "13px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          zIndex: 200,
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
