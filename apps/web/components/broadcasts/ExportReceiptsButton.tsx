"use client";

import { Download } from "lucide-react";
import { Button } from "@uniflo/ui";

interface ExportReceiptsButtonProps {
  broadcastId: string;
}

export function ExportReceiptsButton({ broadcastId }: ExportReceiptsButtonProps) {
  const handleExport = () => {
    // Mock export - in production this would generate a real CSV
    const filename = `broadcast-${broadcastId}-receipts-${new Date().toISOString().split("T")[0]}.csv`;
    alert(`Export started: ${filename}`);
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleExport}>
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  );
}
