// components/dashboard/HackerRank/SolutionEditor.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface SolutionEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

// Define a proper interface for CodeEditor props
interface CodeEditorProps {
    code: string;
    onChange: (code: string) => void;
    language?: string;
  }

// Simple code editor component (replace with your actual editor component)
const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, language = 'javascript' }) => {
  return (
    <textarea
      value={code}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-gray-100 rounded-md"
      spellCheck="false"
    />
  );
};

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