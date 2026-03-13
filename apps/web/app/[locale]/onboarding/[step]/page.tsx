"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, X, ChevronRight, ChevronLeft } from "lucide-react";

const industries = ["SaaS", "Healthcare", "Retail", "Manufacturing", "Other"];
const countries = ["USA", "UK", "UAE", "India", "Other"];
const timezones = ["UTC-8 (PST)", "UTC-5 (EST)", "UTC+0 (GMT)", "UTC+4 (GST)", "UTC+5:30 (IST)"];
const roleOptions = ["Admin", "Manager", "Field Staff"];

function ProgressBar({ step }: { step: number }) {
  const pct = step === 1 ? 33 : step === 2 ? 66 : 100;
  return (
    <div style={{ height: "4px", backgroundColor: "var(--bg-tertiary)", borderRadius: "2px", marginBottom: "32px" }}>
      <div style={{ height: "100%", width: `${pct}%`, backgroundColor: "var(--accent-blue)", borderRadius: "2px", transition: "width 0.3s ease" }} />
    </div>
  );
}

function SelectInput({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 500, marginBottom: "6px" }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "6px",
          border: "1px solid var(--border-default)",
          backgroundColor: "var(--bg-secondary)",
          color: "var(--text-primary)",
          fontSize: "13px",
          outline: "none",
          appearance: "auto",
        }}
      >
        <option value="">Select...</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 500, marginBottom: "6px" }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "6px",
          border: "1px solid var(--border-default)",
          backgroundColor: "var(--bg-secondary)",
          color: "var(--text-primary)",
          fontSize: "13px",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function Step1({ orgName, setOrgName, industry, setIndustry, country, setCountry, timezone, setTimezone }: {
  orgName: string; setOrgName: (v: string) => void;
  industry: string; setIndustry: (v: string) => void;
  country: string; setCountry: (v: string) => void;
  timezone: string; setTimezone: (v: string) => void;
}) {
  return (
    <>
      <h2 style={{ color: "var(--text-primary)", fontSize: "18px", fontWeight: 600, margin: "0 0 4px 0" }}>Set up your organization</h2>
      <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "0 0 24px 0" }}>Tell us about your company</p>
      <TextInput label="Organization name" value={orgName} onChange={setOrgName} placeholder="Acme Corp" />
      <SelectInput label="Industry" value={industry} onChange={setIndustry} options={industries} />
      <SelectInput label="Country" value={country} onChange={setCountry} options={countries} />
      <SelectInput label="Timezone" value={timezone} onChange={setTimezone} options={timezones} />
    </>
  );
}

function Step2({ locations, setLocations }: { locations: string[]; setLocations: (v: string[]) => void }) {
  const [newLoc, setNewLoc] = useState("");
  const addLocation = () => {
    if (newLoc.trim() && locations.length < 3) {
      setLocations([...locations, newLoc.trim()]);
      setNewLoc("");
    }
  };
  return (
    <>
      <h2 style={{ color: "var(--text-primary)", fontSize: "18px", fontWeight: 600, margin: "0 0 4px 0" }}>Add locations</h2>
      <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "0 0 24px 0" }}>Add up to 3 locations for your organization</p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <input
          type="text"
          value={newLoc}
          onChange={(e) => setNewLoc(e.target.value)}
          placeholder="Location name"
          onKeyDown={(e) => e.key === "Enter" && addLocation()}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: "6px",
            border: "1px solid var(--border-default)",
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            fontSize: "13px",
            outline: "none",
          }}
        />
        <button
          onClick={addLocation}
          disabled={locations.length >= 3}
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
            opacity: locations.length >= 3 ? 0.5 : 1,
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
          marginBottom: "8px",
          borderRadius: "6px",
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}>
          <span style={{ color: "var(--text-primary)", fontSize: "13px" }}>{loc}</span>
          <button onClick={() => setLocations(locations.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
            <X size={14} />
          </button>
        </div>
      ))}
      {locations.length === 0 && (
        <p style={{ color: "var(--text-muted)", fontSize: "13px", textAlign: "center", padding: "24px 0" }}>No locations added yet</p>
      )}
    </>
  );
}

function Step3({ members, setMembers }: { members: { email: string; role: string }[]; setMembers: (v: { email: string; role: string }[]) => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Manager");
  const addMember = () => {
    if (email.trim()) {
      setMembers([...members, { email: email.trim(), role }]);
      setEmail("");
    }
  };
  return (
    <>
      <h2 style={{ color: "var(--text-primary)", fontSize: "18px", fontWeight: 600, margin: "0 0 4px 0" }}>Invite your team</h2>
      <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "0 0 24px 0" }}>Add team members to get started</p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@company.com"
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: "6px",
            border: "1px solid var(--border-default)",
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            fontSize: "13px",
            outline: "none",
          }}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: "6px",
            border: "1px solid var(--border-default)",
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            fontSize: "13px",
            outline: "none",
          }}
        >
          {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button
          onClick={addMember}
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
          }}
        >
          <Plus size={14} /> Add
        </button>
      </div>
      {members.map((m, i) => (
        <div key={i} style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          marginBottom: "8px",
          borderRadius: "6px",
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}>
          <div>
            <span style={{ color: "var(--text-primary)", fontSize: "13px" }}>{m.email}</span>
            <span style={{ color: "var(--accent-blue)", fontSize: "11px", marginLeft: "8px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "rgba(88,166,255,0.1)" }}>{m.role}</span>
          </div>
          <button onClick={() => setMembers(members.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
            <X size={14} />
          </button>
        </div>
      ))}
      {members.length === 0 && (
        <p style={{ color: "var(--text-muted)", fontSize: "13px", textAlign: "center", padding: "24px 0" }}>No team members added yet</p>
      )}
    </>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const step = parseInt(params.step as string) || 1;

  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [members, setMembers] = useState<{ email: string; role: string }[]>([]);

  const goTo = (s: number) => router.push(`/${locale}/onboarding/${s}/`);

  const handleNext = () => {
    if (step < 3) goTo(step + 1);
    else router.push(`/${locale}/dashboard/`);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "520px", padding: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px", justifyContent: "center" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: "linear-gradient(135deg, #58A6FF 0%, #388BFD 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: "14px", fontWeight: 700 }}>U</span>
          </div>
          <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "18px" }}>Uniflo Setup</span>
          <span style={{ color: "var(--text-muted)", fontSize: "13px", marginLeft: "auto" }}>Step {step} of 3</span>
        </div>

        <ProgressBar step={step} />

        {step === 1 && <Step1 orgName={orgName} setOrgName={setOrgName} industry={industry} setIndustry={setIndustry} country={country} setCountry={setCountry} timezone={timezone} setTimezone={setTimezone} />}
        {step === 2 && <Step2 locations={locations} setLocations={setLocations} />}
        {step === 3 && <Step3 members={members} setMembers={setMembers} />}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px", gap: "12px" }}>
          {step > 1 ? (
            <button
              onClick={() => goTo(step - 1)}
              style={{
                padding: "10px 20px",
                borderRadius: "6px",
                border: "1px solid var(--border-default)",
                backgroundColor: "transparent",
                color: "var(--text-secondary)",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <ChevronLeft size={14} /> Back
            </button>
          ) : <div />}
          <div style={{ display: "flex", gap: "8px" }}>
            {step < 3 && (
              <button
                onClick={() => goTo(step + 1)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "transparent",
                  color: "var(--text-muted)",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Skip
              </button>
            )}
            <button
              onClick={handleNext}
              style={{
                padding: "10px 20px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "var(--accent-blue)",
                color: "white",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {step === 3 ? "Complete setup" : "Continue"} <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
