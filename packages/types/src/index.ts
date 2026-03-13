export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'auditor' | 'support_agent' | 'field_staff';
  avatar: string | null;
  location_id: string;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  type: 'headquarters' | 'regional' | 'store';
  parent_id: string | null;
}

export interface Organization {
  id: string;
  name: string;
  plan: string;
  domain: string;
  locations: Location[];
}

export interface Ticket {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignee_id: string | null;
  location_id: string;
  created_at: string;
  resolved_at?: string;
  sla_breach_at?: string;
  linked_audit_id?: string;
  linked_capa_id?: string;
}

export interface Audit {
  id: string;
  title: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  score: number | null;
  pass: boolean | null;
  location_id: string;
  auditor_id: string;
  conducted_at?: string;
  scheduled_at?: string;
  started_at?: string;
  findings?: string[];
  auto_created_ticket_id?: string;
}

export interface SOP {
  id: string;
  title: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  category: string;
  steps: number;
  location_ids: string[];
  created_by: string;
  last_updated: string;
}

export interface CAPA {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'verified' | 'closed';
  source: 'audit' | 'ticket' | 'manual';
  source_id: string;
  root_cause: string;
  corrective_action: string;
  preventive_action: string;
  owner_id: string;
  due_date: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignee_id: string | null;
  due_date: string;
  created_at: string;
  completed_at?: string;
  linked_ticket_id?: string;
  linked_audit_id?: string;
  linked_capa_id?: string;
  linked_sop_id?: string;
}
