"use client";

import { Input, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@uniflo/ui";

interface SOPFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  locationFilter: string;
  onLocationChange: (value: string) => void;
  dateFilter: string;
  onDateChange: (value: string) => void;
}

const locationLabels: Record<string, string> = {
  loc_001: "Downtown Hotel",
  loc_002: "Airport Hotel",
  loc_003: "Resort",
};

export function SOPFilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  locationFilter,
  onLocationChange,
  dateFilter,
  onDateChange,
}: SOPFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="Search SOPs..."
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        className="w-64"
      />
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="in_review">In Review</SelectItem>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>
      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="safety">Safety</SelectItem>
          <SelectItem value="operations">Operations</SelectItem>
          <SelectItem value="customer_service">Customer Service</SelectItem>
          <SelectItem value="compliance">Compliance</SelectItem>
          <SelectItem value="maintenance">Maintenance</SelectItem>
          <SelectItem value="hr">HR</SelectItem>
        </SelectContent>
      </Select>
      <Select value={locationFilter} onValueChange={onLocationChange}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Location" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Locations</SelectItem>
          {Object.entries(locationLabels).map(([id, name]) => (
            <SelectItem key={id} value={id}>{name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={dateFilter} onValueChange={onDateChange}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Date" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="7">Last 7 days</SelectItem>
          <SelectItem value="30">Last 30 days</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
