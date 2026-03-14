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

interface DashboardComplianceHeatmapProps {
  data: HeatmapRow[];
}

const MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

function getScorePillStyle(score: number): React.CSSProperties {
  if (score >= 90) return { backgroundColor: "var(--accent-green)", color: "var(--text-on-accent)", fontWeight: 700 };
  if (score >= 75) return { backgroundColor: "var(--accent-yellow)", color: "var(--text-on-accent)", fontWeight: 700 };
  return { backgroundColor: "var(--accent-red)", color: "var(--text-on-accent)", fontWeight: 700 };
}

export function DashboardComplianceHeatmap({ data }: DashboardComplianceHeatmapProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
          Compliance Heatmap
        </CardTitle>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Audit scores by location over the last 6 months
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Location</TableHead>
                {MONTHS.map((m) => (
                  <TableHead key={m} className="text-xs text-center w-16">
                    {m}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.location}>
                  <TableCell className="text-sm font-medium text-[var(--text-primary)]">
                    {row.location}
                  </TableCell>
                  {MONTHS.map((m) => {
                    const score = row[m] as number;
                    return (
                      <TableCell key={m} className="text-center">
                        <span
                          className="inline-flex items-center justify-center w-10 h-6 rounded text-xs"
                          style={getScorePillStyle(score)}
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
