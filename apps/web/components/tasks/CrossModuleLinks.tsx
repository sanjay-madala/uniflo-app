"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@uniflo/ui";
import { ClipboardCheck, Shield, Ticket, FileText } from "lucide-react";
import type { TaskSource } from "@uniflo/mock-data";

interface CrossModuleLinksProps {
  linkedAuditId?: string | null;
  linkedCapaId?: string | null;
  linkedTicketId?: string | null;
  linkedSopId?: string | null;
  source?: TaskSource;
}

function formatId(id: string, prefix: string): string {
  return id.replace(`${prefix}_`, `${prefix.toUpperCase()}-`).toUpperCase();
}

export function CrossModuleLinks({ linkedAuditId, linkedCapaId, linkedTicketId, linkedSopId, source }: CrossModuleLinksProps) {
  const { locale } = useParams<{ locale: string }>();

  const hasLinks = linkedAuditId || linkedCapaId || linkedTicketId || linkedSopId;
  if (!hasLinks) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {linkedAuditId && (
        <Link href={`/${locale}/audit/${linkedAuditId}/`}>
          <Badge variant="blue" className="cursor-pointer hover:border-[var(--border-strong)] transition-colors">
            <ClipboardCheck className="h-3 w-3 me-1" />
            Audit: {formatId(linkedAuditId, "aud")}
            {source === "audit" && (
              <span className="ms-1 text-[var(--text-muted)]">(source)</span>
            )}
          </Badge>
        </Link>
      )}
      {linkedCapaId && (
        <Link href={`/${locale}/capa/${linkedCapaId}/`}>
          <Badge variant="warning" className="cursor-pointer hover:border-[var(--border-strong)] transition-colors">
            <Shield className="h-3 w-3 me-1" />
            CAPA: {formatId(linkedCapaId, "capa")}
          </Badge>
        </Link>
      )}
      {linkedTicketId && (
        <Link href={`/${locale}/tickets/${linkedTicketId}/`}>
          <Badge className="cursor-pointer hover:border-[var(--border-strong)] transition-colors">
            <Ticket className="h-3 w-3 me-1" />
            Ticket: {formatId(linkedTicketId, "tkt")}
          </Badge>
        </Link>
      )}
      {linkedSopId && (
        <Link href={`/${locale}/sop/${linkedSopId}/`}>
          <Badge variant="success" className="cursor-pointer hover:border-[var(--border-strong)] transition-colors">
            <FileText className="h-3 w-3 me-1" />
            SOP: {formatId(linkedSopId, "sop")}
          </Badge>
        </Link>
      )}
    </div>
  );
}
