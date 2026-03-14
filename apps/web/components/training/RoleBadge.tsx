"use client";

import { Badge } from "@uniflo/ui";

const roleLabels: Record<string, string> = {
  kitchen_staff: "Kitchen Staff",
  front_desk: "Front Desk",
  server: "Server",
  maintenance: "Maintenance",
  supervisor: "Supervisor",
  concierge: "Concierge",
  housekeeping: "Housekeeping",
};

interface RoleBadgeProps {
  roleId: string;
}

export function RoleBadge({ roleId }: RoleBadgeProps) {
  return <Badge>{roleLabels[roleId] ?? roleId}</Badge>;
}
