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

interface AuditComplianceHeatmapTableProps {
  data: HeatmapRow[];
  months?: string[];
}

function getScorePillStyle(score: number): { backgroundColor: string; color: string; border: string; fontWeight: number } {
  if (score >= 90) return { backgroundColor: "color-mix(in srgb, var(--accent-green) 15%, transparent)", color: "var(--text-primary)", border: "1px solid color-mix(in srgb, var(--accent-green) 30%, transparent)", fontWeight: 600 };
  if (score >= 75) return { backgroundColor: "color-mix(in srgb, var(--accent-yellow) 15%, transparent)", color: "var(--text-primary)", border: "1px solid color-mix(in srgb, var(--accent-yellow) 30%, transparent)", fontWeight: 600 };
  return { backgroundColor: "color-mix(in srgb, var(--accent-red) 15%, transparent)", color: "var(--text-primary)", border: "1px solid color-mix(in srgb, var(--accent-red) 30%, transparent)", fontWeight: 600 };
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
