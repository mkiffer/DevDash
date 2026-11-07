/**
 * Tests for: filterChallengesByDifficulty in CodingChallengeUtils.
 * Coverage intent: browser-side difficulty filtering, which replaced a backend
 * request on every filter change.
 */
import { describe, expect, it } from 'vitest';
import { CodingProblem } from '@/services/codingProblemService';
import { filterChallengesByDifficulty } from '../CodingChallengeUtils';

const buildChallenge = (id: number, difficulty: string): CodingProblem => ({
  id,
  difficulty,
  title: `Challenge ${id}`,
  slug: `challenge-${id}`,
  description: 'A description',
  example_cases: [],
});

const challenges = [buildChallenge(1, 'Easy'), buildChallenge(2, 'Hard'), buildChallenge(3, 'Easy')];

describe('filterChallengesByDifficulty', () => {
  it('keeps only challenges with the selected difficulty', () => {
    const filteredIds = filterChallengesByDifficulty(challenges, 'Easy').map(challenge => challenge.id);

    expect(filteredIds).toEqual([1, 3]);
  });

  it.each(['all', ''])('returns every challenge when the filter is %j', noFilter => {
    // '' is the toolbar's initial value and 'all' is its "Any Difficulty" option.
    expect(filterChallengesByDifficulty(challenges, noFilter)).toEqual(challenges);
  });

  it('returns an empty list when no challenge matches', () => {
    expect(filterChallengesByDifficulty(challenges, 'Medium')).toEqual([]);
  });
});
