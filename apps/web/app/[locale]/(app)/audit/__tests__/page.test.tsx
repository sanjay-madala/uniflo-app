import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuditPage from '../page';

import { audits } from '@uniflo/mock-data';

const auditData = audits as Array<{
  id: string;
  title: string;
  status: string;
  score: number | null;
  pass: boolean | null;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
}>;

function getAuditDate(a: typeof auditData[0]): string {
  return a.completed_at || a.started_at || a.scheduled_at || '';
}

describe('AuditPage', () => {
  it('renders page header with title and subtitle', () => {
    render(<AuditPage />);
    expect(screen.getByText('Audits')).toBeInTheDocument();
    expect(screen.getByText('Schedule, conduct, and review compliance audits')).toBeInTheDocument();
  });

  it('renders audit list from mock data', () => {
    render(<AuditPage />);
    // Verify the table is rendered with rows
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    // Verify at least one audit title link exists
    const sortedAudits = [...auditData].sort((a, b) => {
      const da = getAuditDate(a);
      const db = getAuditDate(b);
      return (db ? new Date(db).getTime() : 0) - (da ? new Date(da).getTime() : 0);
    });
    const firstPage = sortedAudits.slice(0, 10);
    // Use getAllByText in case a title is duplicated somewhere
    for (const audit of firstPage.slice(0, 2)) {
      const matches = screen.getAllByText(audit.title);
      expect(matches.length).toBeGreaterThan(0);
    }
  });

  it('KPI summary shows correct labels and values', () => {
    render(<AuditPage />);

    const scheduledCount = auditData.filter((a) => a.status === 'scheduled').length;
    const inProgressCount = auditData.filter((a) => a.status === 'in_progress').length;

    // Labels may appear in both KPI cards and status chips so use getAllByText
    expect(screen.getAllByText('Scheduled').length).toBeGreaterThan(0);
    expect(screen.getAllByText('In Progress').length).toBeGreaterThan(0);
    expect(screen.getByText('Avg Score')).toBeInTheDocument();
    expect(screen.getByText('Pass Rate')).toBeInTheDocument();

    // Verify the values are rendered
    expect(screen.getAllByText(String(scheduledCount)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(String(inProgressCount)).length).toBeGreaterThan(0);
  });

  it('displays audit count text', () => {
    render(<AuditPage />);
    expect(screen.getByText(new RegExp(`${auditData.length} audit`))).toBeInTheDocument();
  });

  it('filter by status works via KPI click', async () => {
    const user = userEvent.setup();
    render(<AuditPage />);

    // "Scheduled" may appear in multiple places -- find the one inside a button
    const scheduledElements = screen.getAllByText('Scheduled');
    const scheduledBtn = scheduledElements.find(el => el.closest('button'))?.closest('button')!;
    await user.click(scheduledBtn);

    const scheduledCount = auditData.filter((a) => a.status === 'scheduled').length;
    expect(screen.getByText(new RegExp(`${scheduledCount} audit`))).toBeInTheDocument();
  });

  it('renders New Audit button', () => {
    render(<AuditPage />);
    expect(screen.getByText('New Audit')).toBeInTheDocument();
  });

  it('renders Calendar and List view toggle buttons', () => {
    render(<AuditPage />);
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('List')).toBeInTheDocument();
  });
});
