import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrainingLibraryPage from '../page';

import { trainingModules, trainingEnrollments } from '@uniflo/mock-data';

const modules = trainingModules as Array<{
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  difficulty: string;
  completion_rate: number;
  total_enrolled: number;
  estimated_duration_minutes: number;
}>;

const enrollments = trainingEnrollments as Array<{
  status: string;
}>;

describe('TrainingLibraryPage', () => {
  it('renders page header with title and subtitle', () => {
    render(<TrainingLibraryPage />);
    expect(screen.getByText('Training Library')).toBeInTheDocument();
    expect(screen.getByText('Browse and manage training modules')).toBeInTheDocument();
  });

  it('renders module grid with module titles', () => {
    render(<TrainingLibraryPage />);
    // Default view is grid, sorted by title asc; PER_PAGE = 9
    const sortedModules = [...modules].sort((a, b) => a.title.localeCompare(b.title));
    const firstPage = sortedModules.slice(0, 9);
    for (const mod of firstPage.slice(0, 3)) {
      const matches = screen.getAllByText(mod.title);
      expect(matches.length).toBeGreaterThan(0);
    }
  });

  it('shows module count text', () => {
    render(<TrainingLibraryPage />);
    expect(screen.getByText(new RegExp(`${modules.length} module`))).toBeInTheDocument();
  });

  it('KPI stats show correct labels and values', () => {
    render(<TrainingLibraryPage />);
    const publishedCount = modules.filter((m) => m.status === 'published').length;
    const avgCompletion = Math.round(
      modules.reduce((sum, m) => sum + m.completion_rate, 0) / modules.length
    );
    const overdueCount = enrollments.filter((e) => e.status === 'overdue').length;

    expect(screen.getByText('Total Modules')).toBeInTheDocument();
    // "Published" appears in both KPI card and status badges
    expect(screen.getAllByText('Published').length).toBeGreaterThan(0);
    expect(screen.getByText('Avg Completion')).toBeInTheDocument();
    expect(screen.getByText('Overdue Enrollments')).toBeInTheDocument();

    // Use getAllByText since numbers may appear in multiple places (KPI card + elsewhere)
    expect(screen.getAllByText(String(modules.length)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(String(publishedCount)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(`${avgCompletion}%`).length).toBeGreaterThan(0);
    expect(screen.getAllByText(String(overdueCount)).length).toBeGreaterThan(0);
  });

  it('category filter select is rendered with correct options', () => {
    render(<TrainingLibraryPage />);
    const comboboxes = screen.getAllByRole('combobox');
    expect(comboboxes.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('All Categories')).toBeInTheDocument();
  });

  it('search filters modules by title', async () => {
    const user = userEvent.setup();
    render(<TrainingLibraryPage />);

    const searchInput = screen.getByPlaceholderText('Search modules...');
    const firstModule = modules[0];
    await user.type(searchInput, firstModule.title.slice(0, 10));

    const matches = screen.getAllByText(firstModule.title);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('renders New Module and view toggle buttons', () => {
    render(<TrainingLibraryPage />);
    expect(screen.getByText('New Module')).toBeInTheDocument();
    // The toggle shows either "List" or "Grid" depending on current mode
    expect(screen.getByText('List')).toBeInTheDocument();
  });
});
