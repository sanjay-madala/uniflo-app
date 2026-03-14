export function PortalFooter() {
  return (
    <footer
      className="flex h-12 items-center justify-center gap-4 border-t text-xs"
      style={{
        backgroundColor: "var(--portal-bg)",
        borderColor: "var(--portal-border)",
        color: "var(--portal-text-muted)",
      }}
    >
      <span>Powered by Uniflo</span>
      <span style={{ color: "var(--portal-border)" }}>|</span>
      <button className="transition-colors hover:underline">Privacy Policy</button>
      <span style={{ color: "var(--portal-border)" }}>|</span>
      <button className="transition-colors hover:underline">Help</button>
    </footer>
  );
}
