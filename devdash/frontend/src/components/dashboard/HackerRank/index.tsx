import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, SidebarClose, SidebarOpen } from 'lucide-react';
import { hackerRankService, HackerRankChallenge, HackerRankSubmission } from '@/services/hackerRankService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

// Import subcomponents
import ChallengeToolbar from '@/components/dashboard/HackerRank/ChallengeToolbar';
import ChallengeList from '@/components/dashboard/HackerRank/ChallengeList';
import ChallengeDetails from '@/components/dashboard//HackerRank/ChallengeDetails';
import SolutionEditor from '@/components/dashboard//HackerRank/SolutionEditor';
import SubmissionResults from '@/components/dashboard/HackerRank/SubmissionResults';

// Import utilities
import { getStarterCode, LANGUAGE_OPTIONS, DIFFICULTY_OPTIONS } from '@/components/dashboard/HackerRank/HackerRankUtils';

export const HackerRankProblems: React.FC = () => {
  // State management
  const [challenges, setChallenges] = useState<HackerRankChallenge[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<HackerRankChallenge | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [code, setCode] = useState<string>('// Write your solution here');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<HackerRankSubmission | null>(null);
  const [activeTab, setActiveTab] = useState<string>('problem');
  const { toast } = useToast();
  const [isChallengeListVisible, setIsChallengeListVisible] = useState<boolean>(true)

  // Load challenges when component mounts or filters change
  useEffect(() => {
    loadChallenges();
  }, [selectedDifficulty]);

  // Load challenges from API
  const loadChallenges = async () => {
    setIsLoading(true);
    
    try {
      const response = await hackerRankService.getChallenges(
        1, 
        10, 
        selectedDifficulty || undefined
      );
      
      setChallenges(response.data);
      
      // Select the first challenge if we don't have one selected
      if (response.data.length > 0 && !currentChallenge) {
        loadChallenge(response.data[0].slug);
      }
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
  };

  // Load a specific challenge
  const loadChallenge = async (slug: string) => {
    setIsLoading(true);
    setSubmissionResult(null);
    setActiveTab('problem'); // Switch to problem tab when loading a new challenge
    
    try {
      const response = await hackerRankService.getChallenge(slug);
      setCurrentChallenge(response.data);
      
      // Set default code based on selected language and challenge
      const starterCode = getStarterCode(selectedLanguage, response.data.name);
      setCode(starterCode);
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

  // Handle language change
  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    if (currentChallenge) {
      setCode(getStarterCode(value, currentChallenge.name));
    } else {
      setCode(getStarterCode(value));
    }
  };

  // Handle submission
  const handleSubmit = async () => {
    if (!currentChallenge) return;
    
    setIsSubmitting(true);
    setSubmissionResult(null);
    
    try {
      // Submit the solution
      const submitResponse = await hackerRankService.submitSolution(
        currentChallenge.slug,
        code,
        selectedLanguage
      );
      
      // Wait a moment for processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get the submission result
      const resultResponse = await hackerRankService.getSubmissionResult(
        submitResponse.data.id
      );
      
      setSubmissionResult(resultResponse.data);
      setActiveTab('results'); // Switch to results tab
      
      if (resultResponse.data.status === 'Accepted') {
        toast({
          title: 'Success!',
          description: `Your solution passed all test cases. Score: ${resultResponse.data.score}/${currentChallenge.max_score}`,
        });
      } else {
        toast({
          title: 'Test Failed',
          description: 'Your solution didn\'t pass all test cases.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting solution:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit solution. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleChallengeList = () => {
    setIsChallengeListVisible(!isChallengeListVisible)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar with filters */}
      <ChallengeToolbar
        selectedLanguage={selectedLanguage}
        selectedDifficulty={selectedDifficulty}
        languages={LANGUAGE_OPTIONS}
        difficulties={DIFFICULTY_OPTIONS}
        onLanguageChange={handleLanguageChange}
        onDifficultyChange={setSelectedDifficulty}
        onRefresh={loadChallenges}
        isLoading={isLoading}
      />

      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden relative">
        {/* Challenge list with toggle button */}
        {isChallengeListVisible && (
          <div className="lg:w-1/3 overflow-auto">
            <ChallengeList
              challenges={challenges}
              currentChallengeId={currentChallenge?.id || null}
              isLoading={isLoading}
              onSelectChallenge={loadChallenge}
            />
          </div>
        )}

        {/* Challenge list toggle button when hidden */}
        {!isChallengeListVisible && (
          <div className="absolute left-2 top-0 z-10">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleChallengeList}
            >
              <SidebarOpen className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Challenge details and solution */}
        <div className={`${isChallengeListVisible ? 'lg:w-2/3' : 'w-full'} flex-1 flex flex-col overflow-hidden`}>
          {currentChallenge ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="flex items-center">
                {/* Toggle button integrated with tabs */}
                {isChallengeListVisible && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="mr-2"
                    onClick={toggleChallengeList}
                  >
                    <SidebarClose className="h-4 w-4" />
                  </Button>
                )}
                
                {/* Tabs */}
                <TabsList className="flex-1">
                  <TabsTrigger value="problem">Problem</TabsTrigger>
                  <TabsTrigger value="solution">Solution</TabsTrigger>
                  {submissionResult && (
                    <TabsTrigger value="results">Results</TabsTrigger>
                  )}
                </TabsList>
              </div>
              
              {/* Side-by-side view for Problem and Solution */}
              {(activeTab === 'problem' || activeTab === 'solution') && (
                <div className="flex-1 flex overflow-hidden">
                  {/* Problem Description */}
                  <div className={`${activeTab === 'problem' ? 'w-full' : 'w-1/2'} overflow-auto pr-2`}>
                    <ChallengeDetails challenge={currentChallenge} />
                  </div>
                  
                  {/* Solution Editor */}
                  {activeTab === 'solution' && (
                    <div className="w-1/2 overflow-auto pl-2 border-l">
                      <SolutionEditor
                        code={code}
                        language={selectedLanguage}
                        onChange={setCode}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                      />
                    </div>
                  )}
                </div>
              )}
              
              {/* Results Tab */}
              {activeTab === 'results' && submissionResult && (
                <TabsContent value="results" className="h-full overflow-auto">
                  <SubmissionResults 
                    result={submissionResult} 
                    maxScore={currentChallenge.max_score}
                  />
                </TabsContent>
              )}
            </Tabs>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              {isLoading ? (
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Loading challenge...</p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <Code className="h-12 w-12 text-gray-300 mx-auto" />
                  <p>Select a challenge from the list</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};