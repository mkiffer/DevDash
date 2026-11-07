/**
 * Tests for: StackOverflowSearch's request behaviour.
 * Coverage intent: the panel must not call the backend until the user searches.
 * The old on-load search returned 0 results in production yet still woke a
 * Lambda container and spent Stack Exchange quota on every page load.
 * Mocked: the Stack Overflow service, so the tests count calls instead of hitting
 * the network.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { searchStackOverflow } from '@/services/stackOverflowService';
import { StackOverflowSearch } from '../index';

vi.mock('@/services/stackOverflowService', () => ({
  searchStackOverflow: vi.fn(),
  getQuestionAnswers: vi.fn(),
}));

const emptySearchResponse = { items: [], has_more: false, quota_max: 10000, quota_remaining: 9999 };

describe('StackOverflowSearch', () => {
  beforeEach(() => {
    vi.mocked(searchStackOverflow).mockReset();
    vi.mocked(searchStackOverflow).mockResolvedValue(emptySearchResponse);
  });

  it('sends no request when the panel first appears', async () => {
    // Arrange and Act
    render(<StackOverflowSearch />);
    // Give any mount effect a chance to fire before asserting it didn't.
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assert
    expect(
      vi.mocked(searchStackOverflow),
      'Opening the dashboard must not search Stack Overflow; each call can start a cold Lambda',
    ).not.toHaveBeenCalled();
    expect(
      screen.getByText(/search stack overflow to see questions/i),
      'Before any search the panel should invite a search, not report "no questions found"',
    ).toBeInTheDocument();
    expect(screen.queryByText(/no questions found/i)).not.toBeInTheDocument();
  });

  it('searches once with the typed query, then reports an empty result', async () => {
    // Arrange
    render(<StackOverflowSearch />);

    // Act
    fireEvent.change(screen.getByPlaceholderText('Search Stack Overflow...'), {
      target: { value: 'python list comprehension' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    // Assert
    await waitFor(() =>
      expect(
        screen.getByText(/no questions found/i),
        'After a search with no matches, the panel should say so',
      ).toBeInTheDocument(),
    );
    expect(
      vi.mocked(searchStackOverflow),
      'One click should send exactly one search, with the text the user typed',
    ).toHaveBeenCalledTimes(1);
    expect(vi.mocked(searchStackOverflow)).toHaveBeenCalledWith('python list comprehension');
  });
});
