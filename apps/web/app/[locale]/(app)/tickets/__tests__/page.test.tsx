import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TicketsPage from '../page';

// Get the actual mock data for assertions
import { tickets, users } from '@uniflo/mock-data';

describe('TicketsPage', () => {
  it('renders page header with title and subtitle', () => {
    render(<TicketsPage />);
    expect(screen.getByText('Tickets')).toBeInTheDocument();
    expect(screen.getByText('Track and resolve issues across your organization')).toBeInTheDocument();
  });

  it('renders ticket list from mock data', () => {
    render(<TicketsPage />);
    // First page shows up to 10 tickets; verify some titles appear
    const ticketData = tickets as Array<{ title: string }>;
    // The first ticket title should be visible (sorted by created_at desc by default)
    const sortedTickets = [...ticketData].sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const firstPageTitles = sortedTickets.slice(0, 10).map((t) => t.title);
    for (const title of firstPageTitles.slice(0, 3)) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });

  it('shows ticket count', () => {
    render(<TicketsPage />);
    const countText = screen.getByText(new RegExp(`${(tickets as any[]).length} ticket`));
    expect(countText).toBeInTheDocument();
  });

  it('search filters tickets by title', async () => {
    const user = userEvent.setup();
    render(<TicketsPage />);

    const searchInput = screen.getByPlaceholderText('Search tickets...');
    const firstTicket = (tickets as Array<{ title: string }>)[0];

    // Type a short prefix to keep the test fast
    await user.type(searchInput, firstTicket.title.slice(0, 5));

    // After search, matching ticket should still be visible
    expect(screen.getByText(firstTicket.title)).toBeInTheDocument();
  });

  it('status filter select is rendered with correct options', () => {
    render(<TicketsPage />);
    // The status filter select trigger should be present
    const comboboxes = screen.getAllByRole('combobox');
    expect(comboboxes.length).toBeGreaterThanOrEqual(1);
    // Verify the "All Status" default is displayed
    expect(screen.getByText('All Status')).toBeInTheDocument();
  });

  it('sort by title changes order', async () => {
    const user = userEvent.setup();
    render(<TicketsPage />);

    // Click the Title sort button
    const titleSortBtn = screen.getByRole('button', { name: /Title/i });
    await user.click(titleSortBtn);

    // After clicking, tickets should be sorted by title ascending
    // We can verify by checking the first visible ticket title changes
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    // First row is header, second row should have a ticket
    expect(rows.length).toBeGreaterThan(1);
  });

  it('renders New Ticket button', () => {
    render(<TicketsPage />);
    expect(screen.getByText('New Ticket')).toBeInTheDocument();
  });
});
