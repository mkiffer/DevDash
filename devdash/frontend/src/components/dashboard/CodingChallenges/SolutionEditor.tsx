import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
// NOTE: Assuming `CodeEditor` is a named export from this path, as per your provided code.
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
    // This is the main flex container that lays out its children vertically.
    <div className="flex flex-col h-full">
      
      {/* Header section for the editor, set to not shrink. */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h3 className="font-semibold">Your Solution:</h3>
        <Badge variant="outline" className="text-xs font-mono">
          {language}
        </Badge>
      </div>

      {/* This is the container for the code editor. */}
      {/* CHANGE: The key is `flex-1` (to grow and fill available space) and `min-h-0` (to allow shrinking). */}
      {/* This prevents the container from overflowing its parent and creating an unwanted scrollbar. */}
      <div className="flex-1 relative min-h-0">
        <CodeEditor
          code={code}
          onChange={onChange}
          language={language}
          isDarkMode={isDarkMode}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on'
          }}
        />
      </div>
      
      {/* Footer section with the submit button, set to not shrink. */}
      <div className="flex-shrink-0 pt-2">
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