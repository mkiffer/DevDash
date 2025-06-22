import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import DOMPurify from 'dompurify';
// 1. Import 'parse' and the necessary helpers from html-react-parser
import parse, { domToReact, HTMLReactParserOptions, Element, DOMNode } from 'html-react-parser';

interface Answer {
  answer_id: number;
  body: string;
  score: number;
  is_accepted: boolean;
  creation_date: string;
  owner: {
    display_name: string;
    reputation: number;
  };
}

interface AnswerViewProps {
  questionTitle: string;
  answers: Answer[];
  onClose: () => void;
}

export const AnswerView: React.FC<AnswerViewProps> = ({
  questionTitle,
  answers,
  onClose
}) => {

  // 2. Define the parser options to find and replace <pre> tags
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      // Check if the node is a <pre> tag
      if (domNode instanceof Element && domNode.name === 'pre') {
        // Apply the same styling as the AI Chat code blocks
        return (
          <pre className="overflow-x-auto bg-gray-800 text-white p-3 rounded-md">
            {/* Make sure to render the children of the node and assert the type */}
            {domToReact(domNode.children as DOMNode[], options)}
          </pre>
        );
      }
    },
  };

  return (
    <div className="space-y-4">
      <div className="sticky top-0 bg-background z-10 pb-2">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold line-clamp-2">{questionTitle}</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
      
      {answers.length > 0 ? (
        answers.map((answer) => {
          // 3. Sanitize the HTML body for each answer before parsing
          const cleanBody = DOMPurify.sanitize(answer.body);

          return (
            <Card 
              key={answer.answer_id} 
              className={`${answer.is_accepted ? 'border-green-500' : ''} transition-colors`}
            >
              <CardHeader className="py-3">
                <CardTitle className="flex justify-between text-base">
                  <div className="flex items-center gap-2">
                    <span className="font-normal">{answer.owner.display_name}</span>
                    <span className="text-xs text-gray-500">
                      Rep: {answer.owner.reputation.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      Score: {answer.score}
                    </span>
                    {answer.is_accepted && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        ✓ Accepted
                      </span>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                {/* 4. Use parse() with the options to render the body */}
                <div className="prose prose-sm max-w-none">
                  {parse(cleanBody, options)}
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  Posted: {new Date(answer.creation_date).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <div className="text-center text-gray-500 py-8">
          No answers available for this question yet.
        </div>
      )}
    </div>
  );
};