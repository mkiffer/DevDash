import React from 'react';
import { CodeProblem } from '../../../types';

interface ProblemDescriptionProps {
  problem: CodeProblem;
}

export const ProblemDescription: React.FC<ProblemDescriptionProps> = ({ problem }) => {
  return (
    <div className="mb-4">
      <h3 className="text-4xl font-medium">{problem.title}</h3>
      <span className="text-base text-gray-500">{problem.difficulty}</span>
      <p className="mt-2 text-sm">{problem.description}</p>
    </div>
  );
};
