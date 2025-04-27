// components/dashboard/HackerRank/ChallengeDetails.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import { CodingProblem } from '@/services/codingProblemService';

interface ChallengeDetailsProps {
  challenge: CodingProblem;
}

const difficultyColorMap = {
  'easy': 'bg-green-100 text-green-800',
  'medium': 'bg-yellow-100 text-yellow-800',
  'hard': 'bg-red-100 text-red-800'
};

const ChallengeDetails: React.FC<ChallengeDetailsProps> = ({ challenge }) => {
      // Create a type for the difficulty keys
  type DifficultyKey = 'easy' | 'medium' | 'hard';
  
  // Function to check if a string is a valid difficulty key
  const isDifficultyKey = (key: string): key is DifficultyKey => {
    return ['easy', 'medium', 'hard'].includes(key);
  };
  
  // Get the difficulty key safely
  const difficultyKey = challenge.difficulty.toLowerCase();
  const colorClass = isDifficultyKey(difficultyKey) 
    ? difficultyColorMap[difficultyKey] 
    : 'bg-gray-100';

    return (
    <div className="space-y-4 overflow-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{challenge.title}</h2>
        <Badge 
          className={colorClass}
        >
          {challenge.difficulty}
        </Badge>
      </div>
      
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{challenge.description}</ReactMarkdown>
      </div>
      
      {challenge.example_cases && challenge.example_cases.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Sample Test Cases:</h3>
          <div className="space-y-3">
            {challenge.example_cases.map((testcase, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md">
                <div className="mb-1">
                  <span className="font-medium text-xs">Input: </span>
                  <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(testcase.input,null,2)}
                  </pre>
                </div>
                <div>
                  <span className="font-medium text-xs">Expected Output: </span>
                  <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(testcase.output,null,2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeDetails;