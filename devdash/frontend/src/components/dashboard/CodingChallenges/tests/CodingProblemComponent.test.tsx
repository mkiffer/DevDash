/**
 * Tests for: CodingProblemComponent's request behaviour.
 * Coverage intent: each saved request is a saved round trip to the backend, so
 * these tests count service calls and check nothing delays the submit result.
 * Mocked: the service, plus the toolbar and editor. Their Radix and CodeMirror
 * internals don't matter here, and the mocks expose only the callbacks under test.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { codingProblemService } from '@/services/codingProblemService';
import { CodingProblemComponent } from '../index';

vi.mock('@/services/codingProblemService', () => ({
  codingProblemService: {
    getProblems: vi.fn(),
    getProblem: vi.fn(),
    submitSolution: vi.fn(),
  },
}));

vi.mock('@/components/dashboard/CodingChallenges/ChallengeToolbar', () => ({
  default: ({ onDifficultyChange, onRefresh, onBack }: {
    onDifficultyChange: (difficulty: string) => void;
    onRefresh: () => void;
    onBack: () => void;
  }) => (
    <div>
      <button onClick={() => onDifficultyChange('Hard')}>Filter hard</button>
      <button onClick={onRefresh}>Refresh</button>
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

vi.mock('@/components/dashboard/CodingChallenges/SolutionEditor', () => ({
  default: ({ onSubmit }: { onSubmit: () => void }) => <button onClick={onSubmit}>Submit</button>,
}));

const easyChallenge = {
  id: 1, title: 'Easy One', slug: 'easy-one', difficulty: 'Easy', description: 'easy', example_cases: [],
};
const hardChallenge = {
  id: 2, title: 'Hard One', slug: 'hard-one', difficulty: 'Hard', description: 'hard', example_cases: [],
};

const renderLoadedList = async () => {
  render(<CodingProblemComponent isDarkMode={false} />);
  await screen.findByText('Easy One');
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(codingProblemService.getProblems).mockResolvedValue({
    data: [easyChallenge, hardChallenge], status: 200,
  });
  vi.mocked(codingProblemService.getProblem).mockResolvedValue({ data: easyChallenge, status: 200 });
});

describe('CodingProblemComponent', () => {
  it('filters by difficulty without another backend request', async () => {
    await renderLoadedList();

    fireEvent.click(screen.getByText('Filter hard'));

    expect(screen.queryByText('Easy One')).not.toBeInTheDocument();
    expect(screen.getByText('Hard One')).toBeInTheDocument();
    // A second call would cost the user about 2 seconds per filter change.
    expect(codingProblemService.getProblems).toHaveBeenCalledTimes(1);
  });

  it('reopens a challenge without fetching it again', async () => {
    await renderLoadedList();

    fireEvent.click(screen.getByText('Easy One'));
    await screen.findByText('Submit');
    fireEvent.click(screen.getByText('Back'));
    fireEvent.click(await screen.findByText('Easy One'));
    await screen.findByText('Submit');

    expect(codingProblemService.getProblem).toHaveBeenCalledTimes(1);
  });

  it('refresh fetches the list and opened challenges again', async () => {
    await renderLoadedList();
    fireEvent.click(screen.getByText('Easy One'));
    await screen.findByText('Submit');
    fireEvent.click(screen.getByText('Back'));
    await screen.findByText('Easy One');

    fireEvent.click(screen.getByText('Refresh'));
    await waitFor(() => expect(codingProblemService.getProblems).toHaveBeenCalledTimes(2));
    fireEvent.click(await screen.findByText('Easy One'));
    await screen.findByText('Submit');

    // Refresh is the user asking for current data, so it has to bypass the cache.
    expect(codingProblemService.getProblem).toHaveBeenCalledTimes(2);
  });

  it('shows a submission result without a fixed wait', async () => {
    vi.mocked(codingProblemService.submitSolution).mockResolvedValue({
      data: { status: 'Accepted', results: [], score: 100 }, status: 200,
    });
    await renderLoadedList();
    fireEvent.click(screen.getByText('Easy One'));
    fireEvent.click(await screen.findByText('Submit'));

    // The old code slept 2 s after the backend had already answered.
    const results = await screen.findByText('Results:', {}, { timeout: 500 });

    expect(results).toBeInTheDocument();
  });
});
