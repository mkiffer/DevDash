// devdash/frontend/src/components/dashboard/CodingChallenges/index.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { SubmissionResult, CodingProblem, codingProblemService } from '@/services/codingProblemService';
import { useToast } from '@/hooks/use-toast';
import ChallengeToolbar from '@/components/dashboard/CodingChallenges/ChallengeToolbar';
import ChallengeList from '@/components/dashboard/CodingChallenges/ChallengeList';
import ChallengeDetails from '@/components/dashboard/CodingChallenges/ChallengeDetails';
import SolutionEditor from '@/components/dashboard/CodingChallenges/SolutionEditor';
import SubmissionResults from '@/components/dashboard/CodingChallenges/SubmissionResults';
import { filterChallengesByDifficulty, getStarterCode, LANGUAGE_OPTIONS, DIFFICULTY_OPTIONS } from '@/components/dashboard/CodingChallenges/CodingChallengeUtils';

export interface CodingProblemComponentProps {
  isDarkMode: boolean;
}

export const CodingProblemComponent: React.FC<CodingProblemComponentProps> = ({ isDarkMode }) => {
  const [challenges, setChallenges] = useState<CodingProblem[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<CodingProblem | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [code, setCode] = useState<string>('// Write your solution here');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const { toast } = useToast();

  // A ref because reading or updating this cache should never cause a re-render.
  const openedChallengesBySlug = useRef(new Map<string, CodingProblem>());

  const visibleChallenges = useMemo(
    () => filterChallengesByDifficulty(challenges, selectedDifficulty),
    [challenges, selectedDifficulty]
  );

  const loadChallenges = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await codingProblemService.getProblems();
      setChallenges(response.data);
    } catch (error) {
      console.error('Error loading challenges:', error);
      toast({
        title: 'Error',
        description: 'Failed to load challenges. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // Fetching on mount is the legitimate "synchronize with an external system" case for an effect, but
    // the request has to raise the loading flag before it starts, and the rule
    // traces that synchronous setState through the call graph. Satisfying it
    // would mean dropping the spinner or adopting a data-fetching library.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadChallenges();
  }, [loadChallenges]);

  const openChallenge = (challenge: CodingProblem) => {
    setCurrentChallenge(challenge);
    setCode(getStarterCode(selectedLanguage, challenge.title, challenge.example_input));
  };

  const loadChallenge = async (slug: string) => {
    setSubmissionResult(null);

    const openedChallenge = openedChallengesBySlug.current.get(slug);
    if (openedChallenge) {
      openChallenge(openedChallenge);
      return;
    }

    setIsLoading(true);
    try {
      const response = await codingProblemService.getProblem(slug);
      openedChallengesBySlug.current.set(slug, response.data);
      openChallenge(response.data);
    } catch (error) {
      console.error('Error loading challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to load challenge. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    if (currentChallenge) {
      setCode(getStarterCode(value, currentChallenge.title));
    } else {
      setCode(getStarterCode(value));
    }
  };

  const handleSubmit = async () => {
    if (!currentChallenge) return;
    setIsSubmitting(true);
    setSubmissionResult(null);
    try {
      const submitResponse = await codingProblemService.submitSolution(
        currentChallenge.slug,
        code,
        selectedLanguage
      );

      // Check if the backend returned a definitive error (like Compilation Error)
      if (submitResponse.data.status === 'Error') {
        toast({
          title: `Submission Failed: ${submitResponse.data.message}`,
          description: submitResponse.data.compile_output || 'There was a problem with your code. Probably a syntax error',
          variant: 'destructive',
        });
        // Stop execution here to prevent the crash
        return; 
      }

      setSubmissionResult(submitResponse.data);
      if (submitResponse.data.status === 'Accepted') {
        toast({
          title: 'Success!',
          description: `Your solution passed all test cases. Score: ${submitResponse.data.score}`,
        });
      } else {
        toast({
          title: 'Test Failed',
          description: 'Your solution didn\'t pass all test cases. Scroll down to see your results!',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting solution:', error);
      toast({
        title: 'Error',
        description:
          (error instanceof Error && error.message) ||
          'Failed to submit solution. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = () => {
    openedChallengesBySlug.current.clear();
    loadChallenges();
  };

  const handleBack = () => {
    setCurrentChallenge(null);
    setSubmissionResult(null);
  };

  return (
    <div className="flex flex-col h-full">
      <ChallengeToolbar
        selectedLanguage={selectedLanguage}
        selectedDifficulty={selectedDifficulty}
        languages={LANGUAGE_OPTIONS}
        difficulties={DIFFICULTY_OPTIONS}
        onLanguageChange={handleLanguageChange}
        onDifficultyChange={setSelectedDifficulty}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        onBack={handleBack}
        showBack={!!currentChallenge}
      />
      <div className="flex-1 overflow-auto">
        {!currentChallenge ? (
          <ChallengeList
            challenges={visibleChallenges}
            currentChallengeId={null}
            isLoading={isLoading}
            onSelectChallenge={loadChallenge}
          />
        ) : (
          <div className="flex h-full">
            <div className="w-2/5 pr-4 border-r">
              <ChallengeDetails challenge={currentChallenge} />
            </div>
            <div className="w-3/5 flex flex-col pl-4">
              {/* The SolutionEditor container is now flexible and will shrink. */}
              <div className="flex-1 min-h-0">
                <SolutionEditor
                  code={code}
                  language={selectedLanguage}
                  onChange={setCode}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  isDarkMode={isDarkMode}
                  isLangaugeSupported={selectedLanguage === 'python'}
                />
              </div>
              {submissionResult && (
                // The results container has a fixed height, forcing the editor to shrink.
                <div className="h-2/5 mt-4 border-t-2 pt-4 overflow-y-auto">
                  <h3 className="font-semibold mb-2">Results:</h3>
                  <SubmissionResults result={submissionResult} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};