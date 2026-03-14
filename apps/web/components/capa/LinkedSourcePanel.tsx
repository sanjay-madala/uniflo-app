"use client";

import Link from "next/link";
import { Link2, FileText } from "lucide-react";
import { Badge } from "@uniflo/ui";
import type { CAPA } from "@uniflo/mock-data";

interface LinkedSourcePanelProps {
  capa: CAPA;
  locale: string;
  sopTitles?: Record<string, string>;
}

export function LinkedSourcePanel({ capa, locale, sopTitles = {} }: LinkedSourcePanelProps) {
  const links: Array<{
    label: string;
    href: string;
    variant: "blue" | "warning" | "success";
    icon: typeof Link2;
  }> = [];

  // Source audit link
  if (capa.source === "audit" && capa.source_id) {
    links.push({
      label: `Audit: ${capa.source_id.replace("aud_", "AUD-").toUpperCase()}`,
      href: `/${locale}/audit/${capa.source_id}/`,
      variant: "blue",
      icon: Link2,
    });
  }

  // Source ticket link
  if (capa.source === "ticket" && capa.source_id) {
    links.push({
      label: `Ticket: ${capa.source_id.replace("tkt_", "TKT-").toUpperCase()}`,
      href: `/${locale}/tickets/${capa.source_id}/`,
      variant: "warning",
      icon: Link2,
    });
  }

  // Additional linked audits (beyond source)
  if (capa.linked_audit_ids) {
    for (const auditId of capa.linked_audit_ids) {
      if (auditId !== capa.source_id) {
        links.push({
          label: `Audit: ${auditId.replace("aud_", "AUD-").toUpperCase()}`,
          href: `/${locale}/audit/${auditId}/`,
          variant: "blue",
          icon: Link2,
        });
      }
    }
  }

  // Additional linked tickets (beyond source)
  if (capa.linked_ticket_ids) {
    for (const ticketId of capa.linked_ticket_ids) {
      if (ticketId !== capa.source_id) {
        links.push({
          label: `Ticket: ${ticketId.replace("tkt_", "TKT-").toUpperCase()}`,
          href: `/${locale}/tickets/${ticketId}/`,
          variant: "warning",
          icon: Link2,
        });
      }
    }
  }

  // Linked SOPs
  if (capa.linked_sop_ids) {
    for (const sopId of capa.linked_sop_ids) {
      const sopTitle = sopTitles[sopId] ?? sopId.replace("sop_", "SOP-").toUpperCase();
      links.push({
        label: `SOP: ${sopTitle}`,
        href: `/${locale}/sop/${sopId}/`,
        variant: "success",
        icon: FileText,
      });
    }
  }

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link, i) => (
        <Link key={`${link.href}-${i}`} href={link.href}>
          <Badge
            variant={link.variant}
            className="cursor-pointer hover:opacity-80 transition-opacity inline-flex items-center gap-1"
            aria-label={`Navigate to ${link.label}`}
          >
            <link.icon className="h-3 w-3" />
            {link.label}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
