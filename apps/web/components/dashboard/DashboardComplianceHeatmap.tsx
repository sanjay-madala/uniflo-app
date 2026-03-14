"use client";

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

function getScorePillClass(score: number): string {
  if (score >= 90) return "bg-green-900/30 text-green-400 border border-green-800";
  if (score >= 75) return "bg-amber-900/30 text-amber-400 border border-amber-800";
  return "bg-red-900/30 text-red-400 border border-red-800";
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
                          className={`inline-flex items-center justify-center w-10 h-6 rounded text-xs font-medium ${getScorePillClass(score)}`}
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
