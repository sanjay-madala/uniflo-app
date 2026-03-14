"use client";

import { BuilderCanvas } from "@/components/analytics/builder/BuilderCanvas";

export default function BuilderPage() {
  return (
    <div className="h-[calc(100vh-56px)]">
      <BuilderCanvas />
    </div>
  );
}
