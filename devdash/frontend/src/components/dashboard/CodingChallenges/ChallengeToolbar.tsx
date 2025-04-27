// components/dashboard/HackerRank/ChallengeToolbar.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';

interface LanguageOption {
  value: string;
  label: string;
}

interface DifficultyOption {
  value: string;
  label: string;
}

interface ChallengeToolbarProps {
  selectedLanguage: string;
  selectedDifficulty: string;
  languages: LanguageOption[];
  difficulties: DifficultyOption[];
  onLanguageChange: (language: string) => void;
  onDifficultyChange: (difficulty: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const ChallengeToolbar: React.FC<ChallengeToolbarProps> = ({
  selectedLanguage,
  selectedDifficulty,
  languages,
  difficulties,
  onLanguageChange,
  onDifficultyChange,
  onRefresh,
  isLoading
}) => {
  return (
    <div className="mb-4 flex flex-wrap gap-2 justify-between items-center">
      <div className="flex flex-wrap gap-2 items-center">
        <Select
          value={selectedLanguage}
          onValueChange={(value) => onLanguageChange(value==='any'?'':value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={selectedDifficulty}
          onValueChange={(value) => onDifficultyChange(value==='any'?'':value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
          <SelectItem value="any">Any Difficulty</SelectItem>
            {difficulties.map((diff) => (
            <SelectItem key={diff.value} value={diff.value}>
                {diff.label}
            </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button
        size="sm"
        variant="outline"
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center gap-1"
      >
        <RefreshCw className="h-3 w-3" />
        Refresh Challenges
      </Button>
    </div>
  );
};

export default ChallengeToolbar;