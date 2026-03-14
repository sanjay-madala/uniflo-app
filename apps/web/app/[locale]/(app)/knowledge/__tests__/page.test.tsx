import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KnowledgeBasePage from '../page';

import { kbArticles, kbCategories } from '@uniflo/mock-data';

const articles = kbArticles as Array<{
  id: string;
  title: string;
  status: string;
  visibility: string;
  category_id: string;
}>;

const categories = kbCategories as Array<{
  id: string;
  name: string;
  parent_id: string | null;
}>;

const publishedArticles = articles.filter((a) => a.status === 'published');
const internalArticles = publishedArticles.filter((a) => a.visibility === 'internal');
const publicArticles = publishedArticles.filter((a) => a.visibility === 'public');
const draftArticles = articles.filter((a) => a.status === 'draft');
const topCategories = categories.filter((c) => !c.parent_id);

describe('KnowledgeBasePage', () => {
  it('renders page header with title and subtitle', () => {
    render(<KnowledgeBasePage />);
    expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
    expect(screen.getByText('Documentation, guides, and articles for your team')).toBeInTheDocument();
  });

  it('renders categories section on the home view', () => {
    render(<KnowledgeBasePage />);
    expect(screen.getByText('Categories')).toBeInTheDocument();
    // Verify at least some top-level category names appear
    // CategoryCard may render the name inside a nested element
    for (const cat of topCategories.slice(0, 3)) {
      const matches = screen.queryAllByText(cat.name);
      expect(matches.length).toBeGreaterThan(0);
    }
  });

  it('renders tab counts correctly', () => {
    render(<KnowledgeBasePage />);
    expect(screen.getByText(`All Articles (${publishedArticles.length})`)).toBeInTheDocument();
    expect(screen.getByText(`Internal (${internalArticles.length})`)).toBeInTheDocument();
    expect(screen.getByText(`Public (${publicArticles.length})`)).toBeInTheDocument();
    expect(screen.getByText(`Drafts (${draftArticles.length})`)).toBeInTheDocument();
  });

  it('search filters articles and shows count', async () => {
    const user = userEvent.setup();
    render(<KnowledgeBasePage />);

    const searchInput = screen.getByPlaceholderText('Search articles, guides, and documentation...');
    // Use a unique enough prefix from the first published article
    const firstArticle = publishedArticles[0];
    const searchTerm = firstArticle.title.split(' ').slice(0, 2).join(' ');

    await user.type(searchInput, searchTerm);

    // Search mode should show a result count
    expect(screen.getByText(/article.*found for/i)).toBeInTheDocument();
  });

  it('tab filtering switches between All/Internal/Public', async () => {
    const user = userEvent.setup();
    render(<KnowledgeBasePage />);

    // Click Internal tab
    const internalTab = screen.getByText(`Internal (${internalArticles.length})`);
    await user.click(internalTab);

    // The count should reflect internal articles
    const countEl = screen.getByText(new RegExp(`${internalArticles.length} article`));
    expect(countEl).toBeInTheDocument();
  });

  it('renders New Article and Manage Categories buttons', () => {
    render(<KnowledgeBasePage />);
    expect(screen.getByText('New Article')).toBeInTheDocument();
    expect(screen.getByText('Manage Categories')).toBeInTheDocument();
  });
});
