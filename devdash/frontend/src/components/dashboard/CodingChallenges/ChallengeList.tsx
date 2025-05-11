// components/dashboard/HackerRank/ChallengeList.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CodingProblem } from '@/services/codingProblemService';

interface ChallengeListProps {
  challenges: CodingProblem[];
  currentChallengeId: number | null;
  isLoading: boolean;
  onSelectChallenge: (slug: string) => void;
}

const difficultyColorMap = {
  'easy': 'bg-green-100 text-green-800',
  'medium': 'bg-yellow-100 text-yellow-800',
  'hard': 'bg-red-100 text-red-800'
};

const ChallengeList: React.FC<ChallengeListProps> = ({
  challenges,
  currentChallengeId,
  isLoading,
  onSelectChallenge
}) => {
  // Create a type for the difficulty keys
  type DifficultyKey = 'easy' | 'medium' | 'hard';
  
  // Function to check if a string is a valid difficulty key
  const isDifficultyKey = (key: string): key is DifficultyKey => {
    return ['easy', 'medium', 'hard'].includes(key);
  };
  
  // Function to get the color class safely
  const getColorClass = (difficulty: string): string => {
    const key = difficulty.toLowerCase();
    return isDifficultyKey(key) ? difficultyColorMap[key] : 'bg-gray-100';
  };

  return (
    <div className="h-full overflow-auto">
      <h3 className="font-semibold mb-2">Challenges</h3>
      <div className="space-y-2">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className={`p-3 rounded-md border cursor-pointer hover:border-primary transition-colors ${
              currentChallengeId === challenge.id ? 'border-primary bg-gray-50 dark:bg-gray-800' : ''
            }`}
            onClick={() => onSelectChallenge(challenge.slug)}
          >
            <div className="flex justify-between items-start">
              <h4 className="font-medium line-clamp-1">{challenge.title}</h4>
              <Badge 
                className={getColorClass(challenge.difficulty)}
              >
                {challenge.difficulty}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
              {challenge.description.slice(0,20)}
            </p>
          </div>
        ))}
        
        {challenges.length === 0 && !isLoading && (
          <div className="text-center p-4 text-gray-500">
            No challenges found. Try a different filter.
          </div>
        )}
        
        {isLoading && (
          <div className="text-center p-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading challenges...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeList;