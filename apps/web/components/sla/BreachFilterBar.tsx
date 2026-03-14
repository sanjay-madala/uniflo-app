"use client";

import {
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@uniflo/ui";

interface BreachFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  moduleFilter: string;
  onModuleFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  severityFilter: string;
  onSeverityFilterChange: (value: string) => void;
}

export function BreachFilterBar({
  search,
  onSearchChange,
  moduleFilter,
  onModuleFilterChange,
  statusFilter,
  onStatusFilterChange,
  severityFilter,
  onSeverityFilterChange,
}: BreachFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="Search alerts..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-64"
      />
      <Select value={moduleFilter} onValueChange={onModuleFilterChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Module" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Modules</SelectItem>
          <SelectItem value="tickets">Tickets</SelectItem>
          <SelectItem value="audits">Audits</SelectItem>
          <SelectItem value="capa">CAPA</SelectItem>
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="at_risk">At Risk</SelectItem>
          <SelectItem value="breached">Breached</SelectItem>
          <SelectItem value="escalated">Escalated</SelectItem>
        </SelectContent>
      </Select>
      <Select value={severityFilter} onValueChange={onSeverityFilterChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Severity</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
          <SelectItem value="warning">Warning</SelectItem>
          <SelectItem value="info">Info</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
