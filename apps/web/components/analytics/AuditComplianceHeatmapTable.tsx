"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@uniflo/ui";

interface HeatmapRow {
  location: string;
  [month: string]: string | number;
}

interface AuditComplianceHeatmapTableProps {
  data: HeatmapRow[];
  months?: string[];
}

function getScorePillStyle(score: number): React.CSSProperties {
  if (score >= 90) return { backgroundColor: "var(--accent-green)", color: "var(--text-on-accent)", fontWeight: 700, borderRadius: "4px" };
  if (score >= 75) return { backgroundColor: "var(--accent-yellow)", color: "var(--text-on-accent)", fontWeight: 700, borderRadius: "4px" };
  return { backgroundColor: "var(--accent-red)", color: "var(--text-on-accent)", fontWeight: 700, borderRadius: "4px" };
}

export function AuditComplianceHeatmapTable({
  data,
  months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
}: AuditComplianceHeatmapTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
          Compliance Heatmap
        </CardTitle>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Color-coded audit scores by location and month
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Location</TableHead>
                {months.map((m) => (
                  <TableHead key={m} className="text-xs text-center w-16">{m}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.location}>
                  <TableCell className="text-sm font-medium text-[var(--text-primary)]">
                    {row.location}
                  </TableCell>
                  {months.map((m) => {
                    const score = row[m] as number;
                    return (
                      <TableCell key={m} className="text-center">
                        <span
                          className="inline-flex items-center justify-center w-10 h-6 rounded text-xs font-medium"
                          style={getScorePillStyle(score)}
                          title={`${row.location} -- ${m}: ${score}%`}
                        >
                          {score}
                        </span>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
