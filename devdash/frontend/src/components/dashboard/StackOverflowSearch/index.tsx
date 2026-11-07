import React, { useState } from 'react';
import { SearchBar } from './SearchBar';
import { ResultList } from './ResultList';
import { searchStackOverflow, getQuestionAnswers } from '../../../services/stackOverflowService';
import { StackOverflowResult } from '../../../types';
import { AnswerView } from './AnswerView';
import { useToast } from '@/hooks/use-toast';

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

interface SelectedQuestion {
  id: number;
  title: string;
}


export const StackOverflowSearch: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<StackOverflowResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<SelectedQuestion | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  // Nothing is fetched until the user searches. The panel used to search for
  // '[score:50] is:question' on load, but Stack Exchange returned 0 results for
  // it, so every page load woke a Lambda container and spent quota on an empty list.
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const { toast } = useToast();

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
  };

  const handleSearch = async () => {
    
    if (!query.trim()) {
      toast({
        title: "Warning",
        description: "Please enter a search query",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await searchStackOverflow(query);
      setResults(data.items);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch results. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionSelect = async (questionId: number, questionTitle: string) => {
    setIsLoading(true);
    try {
      const answersData = await getQuestionAnswers(questionId);
      setAnswers(answersData.items);
      setSelectedQuestion({ id: questionId, title: questionTitle });
    } catch (error) {
      console.error('Answer fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch answers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col overflow-auto-y">
      <div className="flex-none pt-1 pb-2">
        <SearchBar
          query={query}
          onQueryChange={handleQueryChange}
          onSearch={() => handleSearch()}
          isLoading={isLoading}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {selectedQuestion ? (
          <AnswerView
            questionTitle={selectedQuestion.title}
            answers={answers}
            onClose={() => setSelectedQuestion(null)}
          />
        ) : hasSearched ? (
          <ResultList 
            results={results}
            onQuestionSelect={handleQuestionSelect}
          />
        ) : (
          <div className="text-center text-gray-500 py-8">
            Search Stack Overflow to see questions and answers.
          </div>
        )}
      </div>
    </div>
  );
};
