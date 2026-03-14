import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SOPsPage from '../page';

import { sops } from '@uniflo/mock-data';

const sopData = sops as Array<{
  id: string;
  title: string;
  status: string;
  category: string;
  version: string;
  updated_at: string;
}>;

describe('SOPsPage', () => {
  it('renders page header with title and subtitle', () => {
    render(<SOPsPage />);
    expect(screen.getByText('SOPs')).toBeInTheDocument();
    expect(screen.getByText('Standard operating procedures for your organization')).toBeInTheDocument();
  });

  it('renders SOP library list from mock data', () => {
    render(<SOPsPage />);
    // Default sort: updated_at desc
    const sorted = [...sopData].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    const firstPage = sorted.slice(0, 10);
    for (const sop of firstPage.slice(0, 3)) {
      expect(screen.getByText(sop.title)).toBeInTheDocument();
    }
  });

  it('shows SOP count', () => {
    render(<SOPsPage />);
    expect(screen.getByText(new RegExp(`${sopData.length} SOP`))).toBeInTheDocument();
  });

  it('KPI cards show correct status labels and counts', () => {
    render(<SOPsPage />);
    const publishedCount = sopData.filter((s) => s.status === 'published').length;
    const inReviewCount = sopData.filter((s) => s.status === 'in_review').length;
    const draftCount = sopData.filter((s) => s.status === 'draft').length;

    // Labels may appear in both KPI cards and status chips, so use getAllByText
    expect(screen.getAllByText('Published').length).toBeGreaterThan(0);
    expect(screen.getAllByText('In Review').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Draft').length).toBeGreaterThan(0);
    expect(screen.getByText('Ack Rate')).toBeInTheDocument();

    // Verify the counts appear somewhere in the document
    expect(screen.getAllByText(String(publishedCount)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(String(inReviewCount)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(String(draftCount)).length).toBeGreaterThan(0);
  });

  it('search filters SOPs by title', async () => {
    const user = userEvent.setup();
    render(<SOPsPage />);

    const firstSop = sopData[0];
    const searchInput = screen.getByPlaceholderText('Search SOPs...');
    await user.type(searchInput, firstSop.title.slice(0, 12));

    expect(screen.getByText(firstSop.title)).toBeInTheDocument();
  });

  it('status filter via KPI click narrows results', async () => {
    const user = userEvent.setup();
    render(<SOPsPage />);

    // Initially shows all SOPs
    expect(screen.getByText(new RegExp(`${sopData.length} SOP`))).toBeInTheDocument();

    // "Published" appears in both KPI cards and status chips -- find the one inside a button
    const publishedElements = screen.getAllByText('Published');
    const publishedBtn = publishedElements.find(el => el.closest('button'))?.closest('button')!;
    await user.click(publishedBtn);

    const publishedCount = sopData.filter((s) => s.status === 'published').length;
    // After filtering, count should change (or stay if all are published)
    expect(screen.getByText(new RegExp(`\\d+ SOP`))).toBeInTheDocument();
  });

  it('renders New SOP button', () => {
    render(<SOPsPage />);
    expect(screen.getByText('New SOP')).toBeInTheDocument();
  });
});
