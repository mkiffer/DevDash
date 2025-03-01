import React, { useState } from 'react';
import { ProblemDescription } from './ProblemDescription';
import { CodeEditor } from './CodeEditor';
import { CodeProblem } from '../../../types';
import { mockProblems } from '../../../utils/mockData';

export const CodePlayground: React.FC = () => {
  const [currentProblem, setCurrentProblem] = useState<CodeProblem>(mockProblems[0]);
  const [code, setCode] = useState<string>(currentProblem.starterCode);

  const handleCodeChange = (value: string) => {
    setCode(value);
  };

  return (
    <div className="h-full flex flex-col">
      <ProblemDescription problem={currentProblem} />
      <CodeEditor code={code} onChange={handleCodeChange} />
    </div>
  );
};