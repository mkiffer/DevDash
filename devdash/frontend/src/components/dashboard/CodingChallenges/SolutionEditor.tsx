// mkiffer/devdash/DevDash-481fb7860a2af2f6654500d4175c6f63f23cc3a7/devdash/frontend/src/components/dashboard/CodingChallenges/SolutionEditor.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { CodeEditor } from './CodeEditor/CodeEditor';

interface SolutionEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isDarkMode: boolean;
  isLangaugeSupported: boolean;
}

const SolutionEditor: React.FC<SolutionEditorProps> = ({
  code,
  language,
  onChange,
  onSubmit,
  isSubmitting,
  isDarkMode,
  isLangaugeSupported,
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Your Solution:</h3>
        <Badge variant="outline" className="text-xs font-mono">
          {language}
        </Badge>
      </div>
      <div className="flex-1 mb-4">
        <CodeEditor
          code={code}
          onChange={onChange}
          language={language}
          isDarkMode={isDarkMode}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            automaticLayout: true,
          }}
        />
      </div>
      <div className="flex-shrink-0">
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || !isLangaugeSupported}
          className="w-full flex items-center justify-center gap-2 dark:bg-gray-800 dark:text-white"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Running Tests...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run & Submit
            </>
          )}
        </Button>
        {!isLangaugeSupported && (
          <p className="text-xs text-red-500 text-center mt-2">
            Submission for {language} is not yet supported
          </p>
        )}
      </div>
    </div>
  );
};

export default SolutionEditor;