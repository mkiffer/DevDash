// components/dashboard/HackerRank/SubmissionResults.tsx
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { SubmissionResult } from '@/services/codingProblemService';

interface SubmissionResultsProps {
  result: SubmissionResult;
}

const SubmissionResults: React.FC<SubmissionResultsProps> = ({ result }) => {
  return (
    <div className="space-y-4 overflow-auto">
      <Alert variant={result.status === 'Accepted' ? 'default' : 'destructive'}>
        <AlertTitle>
          {result.status === 'Accepted' ? 'Success!' : 'Test Failed'}
        </AlertTitle>
        <AlertDescription>
          {result.status === 'Accepted' 
            ? `Your solution passed all test cases. Score: ${result.score}`
            : 'Your solution didn\'t pass all test cases.'
          }
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        <h3 className="font-semibold">Test Results:</h3>
        {result.results.map((testResult, index) => (
          <div 
            key={index}
            className={`border rounded-md overflow-hidden ${
              testResult.passed === true ? 'border-green-200' : 'border-red-200'
            }`}
          >
            <div className={`px-4 py-2 flex justify-between items-center ${
              testResult.passed === true ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <span className="font-medium">Test Case {index + 1}</span>
              <Badge variant={testResult.passed === true ? 'default' : 'destructive'}>
                {testResult.passed}
              </Badge>
            </div>
            
            <div className="p-4 space-y-3">
              {testResult.actual && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Standard Output:</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {testResult.actual}
                  </pre>
                </div>
              )}
              
              {testResult.error && (
                <div>
                  <h4 className="text-sm font-semibold mb-1 text-red-600">Error Output:</h4>
                  <pre className="text-xs bg-red-50 p-2 rounded overflow-x-auto">
                    {testResult.error}
                  </pre>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Expected Output:</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto h-24">
                    {testResult.expected}
                  </pre>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold mb-1">Your Output:</h4>
                  <pre className={`text-xs p-2 rounded overflow-x-auto h-24 ${
                    testResult.passed === true? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    {testResult.actual}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubmissionResults;