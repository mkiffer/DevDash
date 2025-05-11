// components/dashboard/HackerRank/SolutionEditor.tsx
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
}


const SolutionEditor: React.FC<SolutionEditorProps> = ({
  code,
  language,
  onChange,
  onSubmit,
  isSubmitting
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Your Solution:</h3>
          <Badge variant="outline" className="text-xs font-mono">
            {language}
          </Badge>
        </div>
        
        <CodeEditor
          code={code}
          onChange={onChange}
          language={language}
          theme="vs-dark"  // Try this theme!
          options={{
            minimap: { enabled: false },  // Disable minimap for small screens
            fontSize: 14,
            lineNumbers: 'on',
            automaticLayout: true  // Important for responsive layouts
          }}
        />
      </div>
      
      <div className="mt-auto">
        <Button 
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2"
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
      </div>
    </div>
  );
};

export default SolutionEditor;