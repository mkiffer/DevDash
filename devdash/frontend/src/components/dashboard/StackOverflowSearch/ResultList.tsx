// devdash/frontend/src/components/dashboard/StackOverflowSearch/ResultList.tsx

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, MessageSquare } from 'lucide-react';
import DOMPurify from 'dompurify';
// 1. Import 'parse' and helpers from html-react-parser
import parse, { domToReact, HTMLReactParserOptions, Element, DOMNode } from 'html-react-parser';

interface StackOverflowResult {
  question_id: number;
  title: string;
  body: string;
  score: number;
  answer_count: number;
  tags: string[];
  link: string;
  creation_date: string;
}

interface ResultListProps {
  results: StackOverflowResult[];
  onQuestionSelect: (questionId: number, questionTitle: string) => void;
}

export const ResultList: React.FC<ResultListProps> = ({ results, onQuestionSelect }) => {
  // 2. Define the parser options to find and replace <pre> tags
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      // Check if the node is a <pre> tag
      if (domNode instanceof Element && domNode.name === 'pre') {
        // Apply the same styling as the AI Chat code blocks
        return (
          <pre className="overflow-x-auto bg-gray-800 text-white p-3 rounded-md">
            {/* Make sure to render the children of the node */}
            {domToReact(domNode.children as DOMNode[], options)}
          </pre>
        );
      }
    },
  };

  return (
    <div className="space-y-3 overflow-y-auto h-full">
      {results.length > 0 ? (
        results.map((result) => {
          const cleanBody = DOMPurify.sanitize(result.body);
          // The title can still use the simple parse
          const cleanTitle = parse(result.title);

          return (
            <Card key={result.question_id} className="hover:border-gray-400 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-sm font-medium flex-1">
                      {cleanTitle}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {result.score} votes
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {result.answer_count}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {result.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <CardContent className="py-3">
                    {/* 3. Use parse() with the options instead of dangerouslySetInnerHTML */}
                    <div className="prose prose-sm max-w-none">
                      {parse(cleanBody, options)}
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      Posted: {new Date(result.creation_date).toLocaleDateString()}
                    </div>
                  </CardContent>

                  <div className="flex justify-between items-center gap-2">
                    <Button
                      onClick={() => onQuestionSelect(result.question_id, result.title)}
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                    >
                      View Answers
                    </Button>
                    <a
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        SO Link
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <div className="text-center text-gray-500 py-8">
          No questions found. Try adjusting your search query.
        </div>
      )}
    </div>
  );
};