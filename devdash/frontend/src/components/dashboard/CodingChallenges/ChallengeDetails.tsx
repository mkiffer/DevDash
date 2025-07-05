// mkiffer/devdash/DevDash-481fb7860a2af2f6654500d4175c6f63f23cc3a7/devdash/frontend/src/components/dashboard/CodingChallenges/ChallengeDetails.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CodingProblem } from '@/services/codingProblemService';

interface ChallengeDetailsProps {
  challenge: CodingProblem;
}

const ChallengeDetails: React.FC<ChallengeDetailsProps> = ({ challenge }) => {
  return (
    <div className="h-full overflow-y-auto">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{challenge.title}</CardTitle>
          <div className="flex items-center space-x-2 pt-2">
            <Badge variant={
              challenge.difficulty === 'Easy' ? 'success' :
              challenge.difficulty === 'Medium' ? 'warning' : 'destructive'
            }>
              {challenge.difficulty}
            </Badge>
            
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: challenge.description }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ChallengeDetails;