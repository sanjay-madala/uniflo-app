"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

const industries = ["QSR", "Retail", "Hospitality", "Pharma", "Other"];
const roles = ["Admin", "Manager", "Operator", "Viewer"] as const;
const modules = [
  { id: "tickets", label: "Tickets", description: "Track and resolve support tickets" },
  { id: "sops", label: "SOPs", description: "Standard operating procedures" },
  { id: "audits", label: "Audits", description: "Compliance and quality audits" },
  { id: "capa", label: "CAPA", description: "Corrective and preventive actions" },
  { id: "tasks", label: "Tasks", description: "Task assignment and tracking" },
  { id: "analytics", label: "Analytics", description: "Reporting and data insights" },
];

interface TeamMember {
  email: string;
  role: typeof roles[number];
}

export default function OnboardingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([{ email: "", role: "Operator" }]);
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set(["tickets", "tasks"]));

  const addMember = () => setMembers([...members, { email: "", role: "Operator" }]);

  const updateMember = (idx: number, field: keyof TeamMember, value: string) => {
    setMembers(members.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  };

  const removeMember = (idx: number) => {
    if (members.length > 1) setMembers(members.filter((_, i) => i !== idx));
  };

  const toggleModule = (id: string) => {
    const next = new Set(selectedModules);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedModules(next);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "560px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-blue) 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
            }}
          >
            <span style={{ color: "white", fontSize: "16px", fontWeight: 700 }}>U</span>
          </div>
          <h1 style={{ color: "var(--text-primary)", fontSize: "22px", fontWeight: 700, margin: "0 0 4px 0" }}>
            Set up your workspace
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: 0 }}>Step {step} of 4</p>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "32px" }}>
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: "3px",
                borderRadius: "2px",
                backgroundColor: s <= step ? "var(--accent-blue)" : "var(--border-default)",
                transition: "background-color 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: "12px",
            padding: "32px",
          }}
        >
          {/* Step 1: Organization */}
          {step === 1 && (
            <div>
              <h2 style={{ color: "var(--text-primary)", fontSize: "18px", fontWeight: 600, margin: "0 0 4px 0" }}>
                Organization details
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "0 0 24px 0" }}>
                Tell us about your organization
              </p>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "6px" }}>
                  Organization name
                </label>
                <input
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Corp"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "6px" }}>
                  Industry
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {industries.map((ind) => (
                    <button
                      key={ind}
                      onClick={() => setIndustry(ind)}
                      style={{
                        padding: "6px 16px",
                        borderRadius: "6px",
                        border: `1px solid ${industry === ind ? "var(--accent-blue)" : "var(--border-default)"}`,
                        backgroundColor: industry === ind ? "rgba(88,166,255,0.1)" : "transparent",
                        color: industry === ind ? "var(--accent-blue)" : "var(--text-secondary)",
                        fontSize: "13px",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Invite members */}
          {step === 2 && (
            <div>
              <h2 style={{ color: "var(--text-primary)", fontSize: "18px", fontWeight: 600, margin: "0 0 4px 0" }}>
                Invite your team
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "0 0 24px 0" }}>
                Add team members to your workspace
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {members.map((m, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      value={m.email}
                      onChange={(e) => updateMember(idx, "email", e.target.value)}
                      placeholder="colleague@company.com"
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <select
                      value={m.role}
                      onChange={(e) => updateMember(idx, "role", e.target.value)}
                      style={{
                        height: "40px",
                        padding: "0 12px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-default)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        outline: "none",
                        minWidth: "120px",
                      }}
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    {members.length > 1 && (
                      <button
                        onClick={() => removeMember(idx)}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-default)",
                          backgroundColor: "transparent",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px",
                          flexShrink: 0,
                        }}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addMember}
                style={{
                  marginTop: "12px",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px dashed var(--border-default)",
                  backgroundColor: "transparent",
                  color: "var(--accent-blue)",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                + Add another
              </button>
            </div>
          )}

          {/* Step 3: Choose modules */}
          {step === 3 && (
            <div>
              <h2 style={{ color: "var(--text-primary)", fontSize: "18px", fontWeight: 600, margin: "0 0 4px 0" }}>
                Choose your modules
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "0 0 24px 0" }}>
                Select the modules you need — you can change this later
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {modules.map((mod) => {
                  const selected = selectedModules.has(mod.id);
                  return (
                    <button
                      key={mod.id}
                      onClick={() => toggleModule(mod.id)}
                      style={{
                        padding: "16px",
                        borderRadius: "8px",
                        border: `1px solid ${selected ? "var(--accent-blue)" : "var(--border-default)"}`,
                        backgroundColor: selected ? "rgba(88,166,255,0.08)" : "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ color: selected ? "var(--accent-blue)" : "var(--text-primary)", fontSize: "14px", fontWeight: 500 }}>
                          {mod.label}
                        </span>
                        <div
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "4px",
                            border: `1px solid ${selected ? "var(--accent-blue)" : "var(--border-default)"}`,
                            backgroundColor: selected ? "var(--accent-blue)" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "12px",
                          }}
                        >
                          {selected ? "✓" : ""}
                        </div>
                      </div>
                      <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: 0 }}>{mod.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(63,185,80,0.1)",
                  border: "1px solid rgba(63,185,80,0.3)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                  fontSize: "28px",
                }}
              >
                ✓
              </div>
              <h2 style={{ color: "var(--text-primary)", fontSize: "20px", fontWeight: 600, margin: "0 0 8px 0" }}>
                You&apos;re all set!
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "0 0 8px 0" }}>
                {orgName ? `${orgName} is` : "Your workspace is"} ready to go.
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "0 0 32px 0" }}>
                {selectedModules.size} modules enabled · {members.filter((m) => m.email.trim()).length} team members invited
              </p>
              <button
                onClick={() => router.push(`/${locale}/dashboard/`)}
                style={{
                  padding: "10px 32px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "var(--accent-blue)",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "opacity 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        {step < 4 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                style={navBtnStyle}
              >
                Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={() => setStep(step + 1)}
              style={{
                padding: "8px 24px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "var(--accent-blue)",
                color: "white",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {step === 3 ? "Finish setup" : "Continue"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "40px",
  padding: "0 12px",
  borderRadius: "6px",
  border: "1px solid var(--border-default)",
  backgroundColor: "var(--bg-primary)",
  color: "var(--text-primary)",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const navBtnStyle: React.CSSProperties = {
  padding: "8px 24px",
  borderRadius: "6px",
  border: "1px solid var(--border-default)",
  backgroundColor: "transparent",
  color: "var(--text-muted)",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
};
