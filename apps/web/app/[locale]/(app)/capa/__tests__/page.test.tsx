import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CAPAListPage from '../page';

import { capas } from '@uniflo/mock-data';

const NOW = new Date('2026-03-14T12:00:00Z');

const capaData = capas as Array<{
  id: string;
  title: string;
  status: string;
  severity: string;
  due_date: string;
  owner_id: string;
  created_at: string;
}>;

function isOverdue(capa: { due_date: string; status: string }): boolean {
  return new Date(capa.due_date) < NOW && capa.status !== 'closed';
}

describe('CAPAListPage', () => {
  it('renders page header with title and subtitle', () => {
    render(<CAPAListPage />);
    expect(screen.getByText('CAPA')).toBeInTheDocument();
    expect(screen.getByText('Corrective and preventive actions to drive continuous improvement')).toBeInTheDocument();
  });

  it('renders CAPA list from mock data', () => {
    render(<CAPAListPage />);
    // Default sort: created_at desc; first 10 shown
    // The desktop table has hidden md:block, but CAPACard renders on mobile
    // Both render the title, so getAllByText to handle duplicates
    const sorted = [...capaData].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const firstPage = sorted.slice(0, 10);
    for (const capa of firstPage.slice(0, 3)) {
      const matches = screen.getAllByText(capa.title);
      expect(matches.length).toBeGreaterThan(0);
    }
  });

  it('shows CAPA count', () => {
    render(<CAPAListPage />);
    expect(screen.getByText(new RegExp(`${capaData.length} CAPA`))).toBeInTheDocument();
  });

  it('KPI bar shows correct counts', () => {
    render(<CAPAListPage />);
    const overdue = capaData.filter((c) => isOverdue(c)).length;

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText(String(capaData.length))).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText(String(overdue))).toBeInTheDocument();
  });

  it('status filter select is rendered', () => {
    render(<CAPAListPage />);
    const comboboxes = screen.getAllByRole('combobox');
    expect(comboboxes.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('All Status')).toBeInTheDocument();
  });

  it('overdue items are highlighted with (overdue) label', () => {
    render(<CAPAListPage />);
    const overdueCapas = capaData.filter((c) => isOverdue(c));
    if (overdueCapas.length > 0) {
      const overdueLabels = screen.queryAllByText(/\(overdue\)/);
      expect(overdueLabels.length).toBeGreaterThan(0);
    }
  });

  it('renders New CAPA button', () => {
    render(<CAPAListPage />);
    expect(screen.getByText('New CAPA')).toBeInTheDocument();
  });
});
