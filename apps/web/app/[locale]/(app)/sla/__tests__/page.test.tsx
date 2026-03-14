import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SLAPolicyListPage from '../page';

import { slaPolicies, slaBreaches } from '@uniflo/mock-data';

const policies = slaPolicies as Array<{
  id: string;
  name: string;
  status: string;
  module: string;
  compliance_percent_30d: number;
  items_covered: number;
  breach_count_30d: number;
}>;

describe('SLAPolicyListPage', () => {
  it('renders page header with title and subtitle', () => {
    render(<SLAPolicyListPage />);
    expect(screen.getByText('SLA Policies')).toBeInTheDocument();
    expect(screen.getByText('Define and manage service level agreements')).toBeInTheDocument();
  });

  it('renders policy list from mock data', () => {
    render(<SLAPolicyListPage />);
    // All policies should be displayed (sorted by priority_order)
    for (const policy of policies.slice(0, 5)) {
      expect(screen.getByText(policy.name)).toBeInTheDocument();
    }
  });

  it('shows policy count text', () => {
    render(<SLAPolicyListPage />);
    expect(screen.getByText(new RegExp(`${policies.length} polic`))).toBeInTheDocument();
  });

  it('stats bar shows correct labels and values', () => {
    render(<SLAPolicyListPage />);
    const activePolicies = policies.filter((p) => p.status === 'active').length;
    expect(screen.getByText('Total Policies')).toBeInTheDocument();
    // "Active" appears in both KPI card and PolicyStatusBadge, so use getAllByText
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0);
    expect(screen.getByText('Breaches Today')).toBeInTheDocument();
    // "Compliance" may appear in policy card text too
    expect(screen.getAllByText(/Compliance/).length).toBeGreaterThan(0);

    expect(screen.getAllByText(String(policies.length)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(String(activePolicies)).length).toBeGreaterThan(0);
  });

  it('module tab filter works', async () => {
    const user = userEvent.setup();
    render(<SLAPolicyListPage />);

    const ticketCount = policies.filter((p) => p.module === 'tickets').length;
    const ticketsTab = screen.getByText(`Tickets (${ticketCount})`);
    await user.click(ticketsTab);

    // After clicking tickets tab, only ticket policies should show
    expect(screen.getByText(new RegExp(`${ticketCount} polic`))).toBeInTheDocument();
  });

  it('toggle switch is rendered for each policy card', () => {
    render(<SLAPolicyListPage />);
    // Each PolicyCard has a Switch with aria-label "Toggle {name}"
    for (const policy of policies.slice(0, 3)) {
      expect(screen.getByLabelText(`Toggle ${policy.name}`)).toBeInTheDocument();
    }
  });

  it('renders New Policy and Alerts buttons', () => {
    render(<SLAPolicyListPage />);
    expect(screen.getByText('New Policy')).toBeInTheDocument();
    expect(screen.getByText('Alerts')).toBeInTheDocument();
  });
});
