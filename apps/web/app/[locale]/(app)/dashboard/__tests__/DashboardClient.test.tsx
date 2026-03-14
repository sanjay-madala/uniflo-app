import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock analytics data which is empty at source — provide fixture values
vi.mock('@uniflo/mock-data', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    dashboardKPIs: [
      {
        id: 'kpi_1',
        title: 'Open Tickets',
        value: 42,
        unit: '',
        trend: 5,
        trendLabel: 'vs last period',
        isPositive: false,
        sparklineData: [{ name: 'd1', value: 38 }, { name: 'd2', value: 42 }],
        color: '#58A6FF',
        module: 'tickets',
        linkTo: '/tickets',
      },
      {
        id: 'kpi_2',
        title: 'Audit Score',
        value: '87%',
        unit: '',
        trend: 2,
        trendLabel: 'vs last period',
        isPositive: true,
        sparklineData: [{ name: 'd1', value: 85 }, { name: 'd2', value: 87 }],
        color: '#3FB950',
        module: 'audits',
        linkTo: '/audit',
      },
      {
        id: 'kpi_3',
        title: 'CAPA Overdue',
        value: 3,
        unit: '',
        trend: -1,
        trendLabel: 'vs last period',
        isPositive: true,
        sparklineData: [{ name: 'd1', value: 4 }, { name: 'd2', value: 3 }],
        color: '#F0883E',
        module: 'capa',
        linkTo: '/capa',
      },
    ],
    trendData: [
      { date: '2026-03-08', compliance: 88, csat: 4.2, ticket_volume: 12, resolution_hours: 6, sla_compliance: 91, audit_score: 85 },
      { date: '2026-03-09', compliance: 89, csat: 4.3, ticket_volume: 10, resolution_hours: 5, sla_compliance: 92, audit_score: 86 },
      { date: '2026-03-10', compliance: 90, csat: 4.1, ticket_volume: 14, resolution_hours: 7, sla_compliance: 90, audit_score: 87 },
    ],
    activityEvents: [
      {
        id: 'evt_1',
        type: 'ticket_created',
        title: 'Broken ice machine reported',
        description: 'New ticket in Maintenance category',
        module: 'tickets',
        actor_id: 'usr_001',
        actor_name: 'Sarah Chen',
        location_id: 'loc_001',
        location_name: 'Downtown',
        timestamp: '2026-03-14T11:30:00Z',
        severity: 'info',
      },
      {
        id: 'evt_2',
        type: 'audit_completed',
        title: 'Kitchen Safety Audit passed',
        description: 'Score: 92%',
        module: 'audits',
        actor_id: 'usr_002',
        actor_name: 'James Wilson',
        location_id: 'loc_002',
        location_name: 'Airport',
        timestamp: '2026-03-14T10:00:00Z',
        severity: 'info',
      },
      {
        id: 'evt_3',
        type: 'capa_overdue',
        title: 'CAPA-005 is overdue',
        description: 'Root cause analysis pending',
        module: 'capa',
        actor_id: 'usr_003',
        actor_name: 'Maria Lopez',
        location_id: 'loc_003',
        location_name: 'Resort',
        timestamp: '2026-03-14T09:00:00Z',
        severity: 'warning',
      },
    ],
    locationTree: {
      id: 'org_1',
      name: 'Uniflo Corp',
      type: 'org',
      parent_id: null,
      children: [],
    },
    crossModuleSummary: {
      date_range: { start: '2026-02-13', end: '2026-03-14' },
      location_id: null,
      tickets: { open: 42, resolved_this_period: 68, avg_resolution_hours: 5.4, sla_compliance_pct: 91, trend_vs_prior: 5 },
      audits: { completed_this_period: 12, avg_score: 87, pass_rate: 83, findings_count: 14, trend_vs_prior: 2 },
      capa: { open: 8, overdue: 3, closure_rate: 71, avg_closure_days: 12, trend_vs_prior: -1 },
      tasks: { open: 24, overdue: 5, completion_rate: 78, velocity: 14, trend_vs_prior: 3 },
      sla: { overall_compliance_pct: 91, breaches_this_period: 6, avg_time_to_breach_hours: 3.2, trend_vs_prior: 2 },
      overall_health_score: 84,
    },
    auditHeatmapData: [],
  };
});

import DashboardClient from '../DashboardClient';

describe('DashboardClient', () => {
  it('renders the page header with title', () => {
    render(<DashboardClient />);
    expect(screen.getByText('Operations Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Real-time overview across all modules')).toBeInTheDocument();
  });

  it('renders KPI cards with correct data', () => {
    render(<DashboardClient />);
    expect(screen.getByText('Open Tickets')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Audit Score')).toBeInTheDocument();
    expect(screen.getByText('87%')).toBeInTheDocument();
    expect(screen.getByText('CAPA Overdue')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders activity feed with events', () => {
    render(<DashboardClient />);
    expect(screen.getByText('Latest Activity')).toBeInTheDocument();
    expect(screen.getByText('Broken ice machine reported')).toBeInTheDocument();
    expect(screen.getByText('Kitchen Safety Audit passed')).toBeInTheDocument();
    expect(screen.getByText('CAPA-005 is overdue')).toBeInTheDocument();
  });

  it('renders date range picker with preset buttons', () => {
    render(<DashboardClient />);
    expect(screen.getByText('7d')).toBeInTheDocument();
    expect(screen.getByText('30d')).toBeInTheDocument();
    expect(screen.getByText('90d')).toBeInTheDocument();
    expect(screen.getByText('QTD')).toBeInTheDocument();
  });

  it('clicking date range preset changes selected state', async () => {
    const user = userEvent.setup();
    render(<DashboardClient />);

    const btn7d = screen.getByText('7d');
    await user.click(btn7d);

    // The 7d button should now have the active style class
    expect(btn7d.className).toContain('bg-[var(--accent-blue)]');
  });

  it('renders the Export button', () => {
    render(<DashboardClient />);
    expect(screen.getByText('Export')).toBeInTheDocument();
  });
});
