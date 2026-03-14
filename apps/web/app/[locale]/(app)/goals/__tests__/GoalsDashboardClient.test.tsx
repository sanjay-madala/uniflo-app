import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GoalsDashboardClient from '../GoalsDashboardClient';

import { goals, goalDashboardKPIs } from '@uniflo/mock-data';

const goalsData = goals as Array<{
  id: string;
  title: string;
  timeframe: string;
  status: string;
  health: string;
  level: string;
  owner_id: string;
  key_results: Array<{ id: string; title: string }>;
}>;

const kpis = goalDashboardKPIs as {
  total_goals: number;
  active_goals: number;
  achieved_goals: number;
  on_track_pct: number;
  at_risk_count: number;
  behind_count: number;
  avg_progress: number;
};

const q1Goals = goalsData.filter((g) => g.timeframe === 'Q1');

describe('GoalsDashboardClient', () => {
  it('renders page header with title and subtitle', () => {
    render(<GoalsDashboardClient />);
    expect(screen.getByText('Goals & OKRs')).toBeInTheDocument();
    expect(screen.getByText('Track objectives powered by your operational data')).toBeInTheDocument();
  });

  it('renders goal tree with Q1 goals by default', () => {
    render(<GoalsDashboardClient />);
    // Default timeframe is Q1
    const goalTree = screen.getByRole('tree', { name: /goals tree/i });
    expect(goalTree).toBeInTheDocument();

    // At least some Q1 goals should be visible
    for (const goal of q1Goals.slice(0, 3)) {
      expect(screen.getByText(goal.title)).toBeInTheDocument();
    }
  });

  it('KPI cards show data from goalDashboardKPIs', () => {
    render(<GoalsDashboardClient />);
    expect(screen.getByText('Active Goals')).toBeInTheDocument();
    // "On Track" may appear as both KPI title and goal health badge
    expect(screen.getAllByText('On Track').length).toBeGreaterThan(0);
    // "Achieved" may also appear multiple times
    expect(screen.getAllByText('Achieved').length).toBeGreaterThan(0);
    expect(screen.getByText('At Risk / Behind')).toBeInTheDocument();

    expect(screen.getAllByText(String(kpis.active_goals)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(`${kpis.on_track_pct}%`).length).toBeGreaterThan(0);
  });

  it('timeframe selector shows Q1-Q4 and Annual buttons', () => {
    render(<GoalsDashboardClient />);
    // "Q1 2026" may appear as both the timeframe button and the goal's timeframe_label
    expect(screen.getAllByText('Q1 2026').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Q2 2026').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Q3 2026').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Q4 2026').length).toBeGreaterThan(0);
    expect(screen.getByText('Annual')).toBeInTheDocument();
  });

  it('clicking Annual timeframe shows all goals', async () => {
    const user = userEvent.setup();
    render(<GoalsDashboardClient />);

    const annualBtn = screen.getByText('Annual');
    await user.click(annualBtn);

    // Annual filter shows goals where timeframe === 'annual' OR any timeframe
    // The component: result.filter(g => g.timeframe === timeframe || timeframe === 'annual')
    // When timeframe='annual', ALL goals pass the filter
    expect(screen.getByText(new RegExp(`${goalsData.length} goal`))).toBeInTheDocument();
  });

  it('renders New Goal and Team View buttons', () => {
    render(<GoalsDashboardClient />);
    expect(screen.getByText('New Goal')).toBeInTheDocument();
    expect(screen.getByText('Team View')).toBeInTheDocument();
  });
});
