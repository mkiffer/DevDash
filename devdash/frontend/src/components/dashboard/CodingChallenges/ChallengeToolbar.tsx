// mkiffer/devdash/DevDash-481fb7860a2af2f6654500d4175c6f63f23cc3a7/devdash/frontend/src/components/dashboard/CodingChallenges/ChallengeToolbar.tsx
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowLeft } from 'lucide-react';

interface ChallengeToolbarProps {
  selectedLanguage: string;
  selectedDifficulty: string;
  languages: { value: string; label: string }[];
  difficulties: { value: string; label: string }[];
  onLanguageChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  onBack: () => void;
  showBack: boolean;
}

const ChallengeToolbar: React.FC<ChallengeToolbarProps> = ({
  selectedLanguage,
  selectedDifficulty,
  languages,
  difficulties,
  onLanguageChange,
  onDifficultyChange,
  onRefresh,
  isLoading,
  onBack,
  showBack,
}) => {
  return (
    <div className="flex items-center p-2 border-b">
      {showBack && (
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      <div className="flex items-center space-x-2 flex-grow">
        <Select value={selectedLanguage} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map(lang => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            {difficulties.map(diff => (
              <SelectItem key={diff.value} value={diff.value}>
                {diff.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" size="icon" onClick={onRefresh} disabled={isLoading}>
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};

export default ChallengeToolbar;