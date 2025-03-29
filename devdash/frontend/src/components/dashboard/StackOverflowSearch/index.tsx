import React, { useState, useEffect } from 'react';
import { SearchBar } from './SearchBar';
import { ResultList } from './ResultList';
import { searchStackOverflow, getQuestionAnswers } from '../../../services/stackOverflowService';
import { StackOverflowResult } from '../../../types';
import { mockStackOverflowResults } from '../../../utils/mockData';
import { AnswerView } from './AnswerView';
import { useToast } from '@/hooks/use-toast';
//import { data } from 'react-router-dom';

interface StackOverflowQuestion {
  question_id: number;
  title: string;
  body: string;
  score: number;
  answer_count: number;
  tags: string[];
  link: string;
}

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
  const [results, setResults] = useState<StackOverflowQuestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<SelectedQuestion | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const { toast } = useToast();

  // Load initial questions
  useEffect(() => {
    const loadInitialQuestions = async () => {
      try {
        setIsLoading(true);
        const data = await searchStackOverflow('[score:50] is:question');
        setResults(data.items);
      } catch (error) {
        console.error('Error loading initial questions:', error);
        toast({
          title: "Error",
          description: "Failed to load initial questions",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialQuestions();
  }, []);

  const handleQueryChange = (newQuery: string) => {
    console.log('Query changed to:', newQuery); // Debug log
    setQuery(newQuery);
  };

  const handleSearch = async () => {
    console.log('Handling search with query:', query); // Debug log
    
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
      console.log('Making search request...'); // Debug log
      const data = await searchStackOverflow(query);
      console.log('Search results:', data); // Debug log
      setResults(data.items);
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

  useEffect(() => {
    console.log('Current query:', query);
    console.log('Current results:', results);
  }, [query, results]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none">
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
        ) : (
          <ResultList 
            results={results}
            onQuestionSelect={handleQuestionSelect}
          />
        )}
      </div>
    </div>
  );
};
