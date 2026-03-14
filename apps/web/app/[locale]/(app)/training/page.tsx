import { GraduationCap } from "lucide-react";

export default function TrainingPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        padding: "48px 24px",
      }}
    >
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "16px",
          backgroundColor: "var(--bg-tertiary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        <GraduationCap size={36} style={{ color: "var(--accent-blue)" }} />
      </div>
      <h1
        style={{
          color: "var(--text-primary)",
          fontSize: "24px",
          fontWeight: 600,
          marginBottom: "8px",
        }}
      >
        Training
      </h1>
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "14px",
          maxWidth: "420px",
          lineHeight: "1.6",
          marginBottom: "24px",
        }}
      >
        Learning management system for onboarding, certifications, and ongoing staff development. Track completion rates and compliance training deadlines.
      </p>
      <span
        style={{
          display: "inline-block",
          padding: "6px 16px",
          borderRadius: "9999px",
          backgroundColor: "var(--bg-tertiary)",
          color: "var(--text-muted)",
          fontSize: "12px",
          fontWeight: 500,
          border: "1px solid var(--border-default)",
        }}
      >
        Coming Soon
      </span>
    </div>
  );
}
